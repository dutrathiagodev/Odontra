"use client";

import { TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface ConfirmOptions {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
}

/**
 * Diálogo de confirmação para ações destrutivas, no lugar do confirm() do navegador.
 * Foco inicial no botão seguro (Cancelar), Esc fecha, clique fora cancela.
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setOptions(null);
    resolver.current(value);
  }, []);

  const dialog = options ? <ConfirmDialog {...options} onClose={close} /> : null;
  return { confirm, dialog };
}

function ConfirmDialog({ title, description, confirmLabel, cancelLabel = "Cancelar", onClose }: ConfirmOptions & { onClose: (value: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
      <button type="button" aria-label={cancelLabel} onClick={() => onClose(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" />
      <div className="animate-slide-up relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <div>
            <h2 id="confirm-title" className="text-lg font-semibold text-ink">{title}</h2>
            <div id="confirm-description" className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{description}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={() => onClose(false)} className="h-11 rounded-lg border border-line px-5 text-sm font-semibold text-ink transition-colors hover:bg-paper">
            {cancelLabel}
          </button>
          <button type="button" onClick={() => onClose(true)} className="h-11 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
