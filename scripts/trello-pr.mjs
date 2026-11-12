// Liga os Pull Requests aos cards do Trello do Odontra.
//
// Um PR cita um card pela branch (Odontra/00012-descricao) ou pelo título (Odontra/00012).
// Para cada card citado: anexa o link do PR (sem repetir).
// Para o card da branch, move de lista conforme o evento:
//   PR aberto / reaberto / pronto para revisão -> TRELLO_LISTA_PR      (padrão: "Em revisão")
//   PR mergeado                                -> TRELLO_LISTA_MERGE   (padrão: "Em teste")
//   PR fechado sem merge                       -> TRELLO_LISTA_FECHADO (padrão: "Fazendo")
// Lista que não existe no quadro é ignorada (só anexa o PR).
//
// No quadro, o card precisa ter o id no nome: "Odontra/00012 ..." ou "[Odontra - 00012] ...".
//
// Precisa de TRELLO_KEY e TRELLO_TOKEN (secrets) e TRELLO_BOARD (variável do repositório: id ou atalho do quadro).
// Sem qualquer um deles, avisa e sai sem erro: o PR não fica vermelho por falta de Trello.
//
// Uso no workflow: node scripts/trello-pr.mjs   (lê GITHUB_EVENT_PATH)
//                  node scripts/trello-pr.mjs --selftest
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PADRAO = /Odontra\s*[/-]\s*(\d{1,5})(?!\d)/gi;

/** Normaliza o número do card com 5 dígitos: 12 -> "00012". */
export const idDoCard = (numero) => String(Number(numero)).padStart(5, "0");

/** Card da branch (Odontra/00012-descricao) ou null. */
export function cardDaBranch(ref) {
  const n = /^Odontra\/(\d{1,5})(?:-[\w.-]*)?$/i.exec(ref ?? "")?.[1];
  return n ? idDoCard(n) : null;
}

/** Todos os cards citados pelo PR: o da branch e os do título. O corpo não conta, para não anexar por engano. */
export function cardsDoPR(pr) {
  const ids = new Set();
  const daBranch = cardDaBranch(pr?.head?.ref);
  if (daBranch) ids.add(daBranch);
  for (const m of (pr?.title ?? "").matchAll(PADRAO)) ids.add(idDoCard(m[1]));
  return [...ids];
}

/** Id do card a partir do nome dele no Trello ("Odontra/00012 ..." ou "[Odontra - 00012] ..."). */
export function idNoNome(nome) {
  const m = /^\[?\s*Odontra\s*(?:\/|\s-\s|-)\s*(\d{1,5})(?!\d)/i.exec(nome ?? "");
  return m ? idDoCard(m[1]) : null;
}

/** Para qual lista o card da branch vai, ou null quando o evento não move nada. */
export function decidir(ev, listas = nomesDasListas(process.env)) {
  const pr = ev?.pull_request;
  const card = cardDaBranch(pr?.head?.ref);
  if (!card) return null;
  if (ev.action === "closed") return { card, lista: pr.merged ? listas.merge : listas.fechado };
  if (["opened", "reopened", "ready_for_review"].includes(ev.action) && !pr.draft) return { card, lista: listas.pr };
  return null;
}

export function nomesDasListas(env) {
  return {
    pr: env.TRELLO_LISTA_PR || "Em revisão",
    merge: env.TRELLO_LISTA_MERGE || "Em teste",
    fechado: env.TRELLO_LISTA_FECHADO || "Fazendo",
  };
}

/** Diz o que falta para rodar (lista vazia = pode rodar). */
export function configFaltando(env) {
  return ["TRELLO_KEY", "TRELLO_TOKEN", "TRELLO_BOARD"].filter((k) => !env[k]);
}

// Cliente simples da API do Trello. O Trello limita as chamadas (429): espera e tenta de novo até 5 vezes.
function criarApi(key, token) {
  return async (method, path, params = {}) => {
    const url = new URL(`https://api.trello.com/1${path}`);
    url.search = new URLSearchParams({ ...params, key, token }).toString();
    for (let tentativa = 1; ; tentativa++) {
      const res = await fetch(url, { method });
      if (res.ok) return res.json();
      if ((res.status === 429 || res.status >= 500) && tentativa < 5) {
        await new Promise((r) => setTimeout(r, tentativa * 3000));
        continue;
      }
      throw new Error(`${method} ${path} -> ${res.status}`);
    }
  };
}

async function anexarPR(api, cardId, pr) {
  const existentes = await api("GET", `/cards/${cardId}/attachments`, { fields: "url" });
  if (existentes.some((a) => a.url === pr.html_url)) return false;
  await api("POST", `/cards/${cardId}/attachments`, { url: pr.html_url, name: `PR #${pr.number}: ${pr.title}` });
  return true;
}

function selftest() {
  const ok = (condicao, msg) => {
    if (!condicao) throw new Error(`falhou: ${msg}`);
    console.log(`ok - ${msg}`);
  };
  const listas = nomesDasListas({});
  const ev = (action, extra = {}, ref = "Odontra/00012-agenda-semanal") => ({
    action,
    pull_request: { head: { ref }, title: "Agenda semanal", draft: false, merged: false, ...extra },
  });
  ok(cardDaBranch("Odontra/00012-agenda-semanal") === "00012", "extrai o card da branch com descrição");
  ok(cardDaBranch("odontra/12") === "00012", "aceita branch sem descrição e completa com zeros");
  ok(cardDaBranch("feature/agenda") === null, "branch fora do padrão é ignorada");
  ok(decidir(ev("opened"), listas).lista === "Em revisão", "PR aberto vai para a lista de revisão");
  ok(decidir(ev("closed", { merged: true }), listas).lista === "Em teste", "PR mergeado vai para a lista de teste");
  ok(decidir(ev("closed"), listas).lista === "Fazendo", "PR fechado sem merge volta para Fazendo");
  ok(decidir(ev("opened", { draft: true }), listas) === null, "PR em rascunho não move o card");
  ok(decidir(ev("opened", {}, "develop"), listas) === null, "PR de release (develop) não move card");
  ok(cardsDoPR({ head: { ref: "develop" }, title: "Release: Odontra/00012 e Odontra-00031" }).join() === "00012,00031", "lê os cards citados no título");
  ok(idNoNome("[Odontra - 00012] Agenda semanal") === "00012", "acha o id no nome do card com colchetes");
  ok(idNoNome("Odontra/00012 Agenda semanal") === "00012", "acha o id no nome do card com barra");
  ok(idNoNome("Agenda semanal") === null, "card sem id no nome é ignorado");
  ok(configFaltando({ TRELLO_KEY: "k" }).join() === "TRELLO_TOKEN,TRELLO_BOARD", "aponta o que falta configurar");
}

async function main() {
  const env = process.env;
  const faltando = configFaltando(env);
  if (faltando.length) {
    console.log(`Trello não configurado (falta: ${faltando.join(", ")}). Nada a fazer.`);
    return;
  }
  const ev = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"));
  const pr = ev.pull_request ?? {};
  const decisao = decidir(ev, nomesDasListas(env));
  const citados = cardsDoPR(pr);
  if (!decisao && !citados.length) return console.log("PR sem card citado. Nada a fazer.");

  const api = criarApi(env.TRELLO_KEY, env.TRELLO_TOKEN);
  const [listas, cards] = await Promise.all([
    api("GET", `/boards/${env.TRELLO_BOARD}/lists`, { fields: "name" }),
    api("GET", `/boards/${env.TRELLO_BOARD}/cards`, { fields: "name,idList" }),
  ]);
  const acharCard = (id) => cards.find((c) => idNoNome(c.name) === id);

  for (const id of citados) {
    const card = acharCard(id);
    if (!card) console.log(`Card Odontra/${id} não encontrado no quadro.`);
    else if (await anexarPR(api, card.id, pr)) console.log(`PR #${pr.number} anexado a Odontra/${id}.`);
  }

  if (!decisao) return;
  const card = acharCard(decisao.card);
  if (!card) return;
  const lista = listas.find((l) => l.name.trim().toLowerCase() === decisao.lista.toLowerCase());
  if (!lista) return console.log(`Lista "${decisao.lista}" não existe no quadro. O card não foi movido.`);
  if (card.idList === lista.id) return console.log(`Odontra/${decisao.card} já está em ${decisao.lista}.`);
  await api("PUT", `/cards/${card.id}`, { idList: lista.id });
  console.log(`Odontra/${decisao.card} -> ${decisao.lista}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--selftest")) selftest();
  else await main();
}
