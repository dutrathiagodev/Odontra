"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/** Painel que sobe da base da tela no celular e vira modal centralizado no desktop. */
export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
      <div className="safe-bottom relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 shadow-2xl sm:max-w-md sm:rounded-3xl sm:pb-5">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-navy-900">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
