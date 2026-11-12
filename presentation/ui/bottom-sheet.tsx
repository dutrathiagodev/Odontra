"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { useFocusTrap } from "./use-focus-trap";

/**
 * Painel que sobe da base da tela no celular e vira modal centralizado no desktop.
 * Foco preso dentro enquanto aberto, Esc fecha e o foco volta para o botão que abriu.
 */
export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(panelRef, open, { onEscape: onClose });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Fundo: toque fora fecha. Fica fora da ordem do Tab (o botão Fechar já faz isso). */}
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="safe-bottom relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 shadow-2xl outline-none sm:max-w-md sm:rounded-3xl sm:pb-5"
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <header className="mb-4 flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-extrabold text-navy-900">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar" className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
