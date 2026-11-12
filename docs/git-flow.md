# Git Flow do Odontra

Como o código anda do card do Trello até a produção, e quais travas o GitHub confere em cada passo.

`Card no Trello → branch Odontra/<card>-slug → commits → PR para a develop → checks verdes → merge → PR de entrega develop → main`

## Branches

| Branch | Para que serve | Quem escreve nela |
| -- | -- | -- |
| `main` | Produção. O que está aqui é o que o paciente e o dentista usam. | Só por PR vindo da `develop` (a entrega). |
| `develop` | Integração. Junta as tarefas prontas antes de irem para produção. | Por PR das branches de tarefa. |
| `Odontra/<card>-slug` | Uma tarefa (um card do Trello). | Quem pegou o card. |

## Nome da branch e do PR

- O card do Trello tem um id de 5 dígitos: `Odontra/00012`.
- A branch usa o mesmo id e uma descrição curta, em minúsculas e com hífens: `Odontra/00012-agenda-semanal`.
- O título do PR cita o card: `Odontra/00012 agenda semanal`. Um PR que resolve mais de um card cita todos no título.
- Commits começam com `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `test:`, `perf:` ou `refactor:` (pode ter escopo: `fix(auth): ...`).

## Passo a passo de uma tarefa

```bash
git switch develop
git pull
git switch -c Odontra/00012-agenda-semanal
# ... código, testes ...
npm run lint && npm run typecheck && npm test && npm run build
git push -u origin Odontra/00012-agenda-semanal
```

1. Abra o PR **para a `develop`** (a branch padrão do GitHub é a `main`: troque a base na hora de abrir).
2. Preencha o modelo do PR: card, o que mudou, como testar e o checklist.
3. Espere os checks ficarem verdes. Vermelho = corrigir e enviar de novo na mesma branch.
4. Merge na `develop`.

## Entrega em produção (release)

1. Abra um PR de `develop` para `main`. O título diz o que vai junto (ex.: `Entrega: Odontra/00012, Odontra/00015`).
2. Os checks rodam de novo, agora também o `so-da-develop`.
3. Com tudo verde, o responsável faz o merge. A `main` não aceita push direto.

Correção urgente em produção também passa pela `develop`: branch `Odontra/<card>-slug` → PR para a `develop` → PR de entrega para a `main`.

## O que cada check faz

| Check (nome no GitHub) | Workflow | Quando roda | O que confere |
| -- | -- | -- | -- |
| `qualidade` | `.github/workflows/ci.yml` | PR para `develop`/`main` e push nelas | `npm ci`, `npm run lint`, `npm run typecheck` (`next typegen` + `tsc`), `npm test` (Vitest) e `npm run build`. A build usa URL e chave do Supabase de mentira: ela não fala com o banco. |
| `so-da-develop` | `.github/workflows/entrega-main.yml` | PR para `main` | A origem do PR é a `develop` deste repositório. Qualquer outra branch é recusada. |
| `sem-coautor-de-ia` | `.github/workflows/sem-coautor-de-ia.yml` | PR para `develop`/`main` | Nenhum commit do PR tem `Co-authored-by` fora de `.github/coautores-permitidos.txt` nem a assinatura `Generated with ...` na mensagem. |
| `trello` | `.github/workflows/trello-pr.yml` | PR aberto, editado, pronto para revisão ou fechado | Anexa o PR ao card e move o card (ver abaixo). Não é obrigatório e passa sem fazer nada enquanto o Trello não estiver configurado. |

Rodar os mesmos passos na sua máquina antes do PR:

```bash
npm run lint
npm run typecheck
npm test
npm run build
bash scripts/sem-coautor.sh origin/develop HEAD
```

## Sem coautor de ferramenta

A autoria dos commits é só de pessoas da equipe. Ferramentas de código costumam acrescentar `Co-authored-by: ...` ou `Generated with ...` na mensagem do commit: isso reprova o check `sem-coautor-de-ia`.

- Desligue a atribuição automática de commits na ferramenta que você usa.
- Se escapou: `git commit --amend` (último commit) ou `git rebase -i origin/develop` (vários), apague a linha e envie de novo com `git push --force-with-lease`.
- Coautor de verdade (outra pessoa da equipe, ou o squash do GitHub juntando commits de duas pessoas)? Coloque o e-mail dela em `.github/coautores-permitidos.txt`.

## Banco de dados (migrations)

- Migration nova só com `supabase migration new <nome>`.
- Antes do PR: `npm run db:reset` (recria o banco do zero com todas as migrations) e `npm run db:test`.
- Nunca editar uma migration que já foi aplicada. Para corrigir, crie outra migration.

## Trello

O workflow `trello-pr.yml` usa `scripts/trello-pr.mjs`:

| Evento do PR | O que acontece com o card da branch |
| -- | -- |
| Aberto, reaberto ou pronto para revisão | Vai para a lista `Em revisão` |
| Mergeado | Vai para a lista `Em teste` |
| Fechado sem merge | Volta para a lista `Fazendo` |

Todo card citado na branch ou no título recebe o link do PR como anexo. No quadro, o nome do card começa com o id: `Odontra/00012 ...` ou `[Odontra - 00012] ...`.

Para ligar:

1. Gere a chave e o token em <https://trello.com/power-ups/admin> (token do usuário que vai mover os cards).
2. No repositório, crie os secrets `TRELLO_KEY` e `TRELLO_TOKEN`:
   ```bash
   gh secret set TRELLO_KEY --repo dutrathiagodev/Odontra
   gh secret set TRELLO_TOKEN --repo dutrathiagodev/Odontra
   ```
3. Crie a variável com o id (ou atalho da URL) do quadro:
   ```bash
   gh variable set TRELLO_BOARD --repo dutrathiagodev/Odontra --body "<id-do-quadro>"
   ```
4. Se as listas do quadro tiverem outros nomes, crie as variáveis `TRELLO_LISTA_PR`, `TRELLO_LISTA_MERGE` e `TRELLO_LISTA_FECHADO` com o nome exato de cada lista.

Para testar as regras sem Trello: `node scripts/trello-pr.mjs --selftest`.

## Aplicar as regras

As travas das branches ficam em rulesets do GitHub. Os corpos JSON estão em `.github/rulesets/` e são os mesmos dos comandos abaixo. Rodar uma vez (precisa ser admin do repositório):

```bash
gh api repos/dutrathiagodev/Odontra/rulesets --method POST --input .github/rulesets/develop.json
gh api repos/dutrathiagodev/Odontra/rulesets --method POST --input .github/rulesets/main.json
```

Ou, sem os arquivos:

```bash
gh api repos/dutrathiagodev/Odontra/rulesets --method POST --input - <<'JSON'
{
  "name": "develop - nao pode ser apagada",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/develop"], "exclude": [] } },
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "pull_request" }],
  "rules": [
    { "type": "deletion" },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "qualidade", "integration_id": 15368 },
          { "context": "sem-coautor-de-ia", "integration_id": 15368 }
        ]
      }
    }
  ]
}
JSON

gh api repos/dutrathiagodev/Odontra/rulesets --method POST --input - <<'JSON'
{
  "name": "main - so o dono entrega via PR",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "pull_request" }],
  "rules": [
    { "type": "update" },
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["merge", "squash", "rebase"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "qualidade", "integration_id": 15368 },
          { "context": "so-da-develop", "integration_id": 15368 },
          { "context": "sem-coautor-de-ia", "integration_id": 15368 }
        ]
      }
    }
  ]
}
JSON
```

O que cada ruleset faz:

| Ruleset | Regras |
| -- | -- |
| `develop - nao pode ser apagada` | A `develop` não pode ser apagada. Para entrar na `develop`, os checks `qualidade` e `sem-coautor-de-ia` precisam estar verdes. |
| `main - so o dono entrega via PR` | A `main` não pode ser apagada nem receber force push. Só muda por PR (`update` bloqueia push direto; o admin passa só via PR). Checks obrigatórios: `qualidade`, `so-da-develop` e `sem-coautor-de-ia`. |

Notas:

- `actor_id: 5` com `RepositoryRole` é o papel **Admin** do repositório; `bypass_mode: pull_request` deixa o admin furar a regra só pelo PR, nunca por push direto.
- `integration_id: 15368` é o GitHub Actions: o check só conta se vier dos workflows deste repositório.
- Conferir depois: `gh api repos/dutrathiagodev/Odontra/rulesets`. Para mudar, edite o JSON e rode `gh api repos/dutrathiagodev/Odontra/rulesets/<id> --method PUT --input .github/rulesets/<arquivo>.json`.
- Os checks só aparecem para escolha depois de rodarem uma vez. Pela API não tem esse problema, mas o primeiro PR depois de aplicar as regras é o teste de verdade.
