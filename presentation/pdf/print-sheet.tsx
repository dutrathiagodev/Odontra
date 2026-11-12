"use client";

import { ExternalLink, Share } from "lucide-react";
import { useSyncExternalStore } from "react";
import { BottomSheet } from "../ui/bottom-sheet";
import { Button, linkButtonClass } from "../ui/button";
import { sharePdfFile } from "./pdf-actions";

/*
 * Retorno da impressão fora da tela que pediu: salvar uma consulta nova troca de página
 * (/consultas/nova → /consultas/<id>) e a tela original some antes do PDF ficar pronto.
 * Por isso o aviso fica num lugar só, montado no layout do painel.
 */

type PrintNotice =
  | { kind: "ready"; file: File; url: string; canShare: boolean; error?: string }
  | { kind: "error"; message: string };

let notice: PrintNotice | null = null;
const listeners = new Set<() => void>();

function publish(next: PrintNotice | null) {
  const previous = notice;
  notice = next;
  // O endereço do arquivo some um tempo depois (a aba aberta pela folha ainda precisa carregar).
  if (previous?.kind === "ready" && (next?.kind !== "ready" || next.url !== previous.url)) setTimeout(() => URL.revokeObjectURL(previous.url), 60_000);
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** PDF pronto, esperando um toque para abrir a folha de compartilhamento (que tem Imprimir). */
export function showPdfReady(file: File, canShare: boolean) {
  publish({ kind: "ready", file, url: URL.createObjectURL(file), canShare });
}

export function showPrintError(message: string) {
  publish({ kind: "error", message });
}

export function clearPrintNotice() {
  publish(null);
}

const BLOCKED = "O navegador não deixou abrir o PDF. Toque em Abrir o PDF ou permita pop-ups para o Odontra.";

export function PrintSheetHost() {
  const current = useSyncExternalStore(subscribe, () => notice, () => null);

  if (!current) return null;

  if (current.kind === "error") {
    return (
      <BottomSheet open title="Não deu para imprimir" onClose={clearPrintNotice}>
        <div className="space-y-3 pb-4">
          <p className="text-sm text-slate-600">{current.message}</p>
          <Button variant="secondary" onClick={clearPrintNotice} className="w-full">Entendi</Button>
        </div>
      </BottomSheet>
    );
  }

  const share = async () => {
    try {
      if ((await sharePdfFile(current.file)) === "shared") clearPrintNotice();
    } catch {
      // Compartilhamento recusado: tenta abrir o PDF numa aba (este toque ainda vale).
      if (window.open(current.url, "_blank")) clearPrintNotice();
      else publish({ ...current, error: BLOCKED });
    }
  };

  return (
    <BottomSheet open title="Prontuário pronto" onClose={clearPrintNotice}>
      <div className="space-y-3 pb-4">
        <p className="text-sm text-slate-600">
          {current.canShare
            ? "Toque em Imprimir e escolha Imprimir na lista do aparelho. Pela mesma lista dá para salvar em Arquivos ou enviar."
            : "Abra o PDF e use o botão Compartilhar do visualizador para imprimir."}
        </p>
        {current.error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">{current.error}</p>}
        {current.canShare && (
          <Button onClick={share} className="w-full">
            <Share className="h-4 w-4" /> Imprimir
          </Button>
        )}
        <a
          href={current.url}
          target="_blank"
          rel="noopener"
          onClick={() => setTimeout(clearPrintNotice, 0)}
          className={`${linkButtonClass(current.canShare ? "secondary" : "primary")} w-full`}
        >
          <ExternalLink className="h-4 w-4" /> Abrir o PDF
        </a>
      </div>
    </BottomSheet>
  );
}
