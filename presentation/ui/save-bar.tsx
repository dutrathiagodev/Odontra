"use client";

import { Check, CircleAlert, Loader2, Save } from "lucide-react";
import { Button } from "./button";

interface SaveBarProps {
  state: "idle" | "saving" | "saved" | "error";
  error: string;
  label: string;
  onSave: () => void;
  disabled?: boolean;
  /** Campos com problema depois de tentar salvar: mostra o resumo e o atalho para o primeiro. */
  issueCount?: number;
  onReview?: () => void;
}

/** Botão de salvar fixo acima da barra inferior no celular (no lugar normal no iPad/desktop), com o erro logo acima. */
export function SaveBar({ state, error, label, onSave, disabled, issueCount = 0, onReview }: SaveBarProps) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-[60px] z-20 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
      <div role="alert">
        {issueCount > 0 && (
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
            <p className="min-w-0 flex-1 font-medium">
              {issueCount === 1 ? "1 campo precisa de ajuste antes de salvar." : `${issueCount} campos precisam de ajuste antes de salvar.`}
            </p>
            {onReview && (
              <button type="button" onClick={onReview} className="-my-1 min-h-11 shrink-0 rounded-md px-2 font-bold text-rose-700 underline underline-offset-2 hover:bg-rose-100">
                Revisar
              </button>
            )}
          </div>
        )}
      </div>
      {state === "error" && (
        <p role="alert" className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}
      <Button onClick={onSave} disabled={disabled || state === "saving"} className="w-full sm:w-auto">
        {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {state === "saving" ? "Salvando…" : state === "saved" ? "Salvo" : state === "error" ? "Tentar salvar de novo" : label}
      </Button>
    </div>
  );
}
