"use client";

import { Check, Loader2, Save } from "lucide-react";
import { Button } from "./button";

interface SaveBarProps {
  state: "idle" | "saving" | "saved" | "error";
  error: string;
  label: string;
  onSave: () => void;
  disabled?: boolean;
}

/** Botão de salvar fixo acima da barra inferior no celular (no lugar normal no iPad/desktop), com o erro logo acima. */
export function SaveBar({ state, error, label, onSave, disabled }: SaveBarProps) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-[60px] z-20 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
      {state === "error" && (
        <p role="alert" className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}
      {/* Leitor de tela ouve "Salvando…" e "Salvo" sem precisar procurar o botão. */}
      <p aria-live="polite" className="sr-only">
        {state === "saving" ? "Salvando…" : state === "saved" ? "Salvo." : ""}
      </p>
      <Button onClick={onSave} disabled={disabled || state === "saving"} className="w-full sm:w-auto">
        {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {state === "saving" ? "Salvando…" : state === "saved" ? "Salvo" : state === "error" ? "Tentar salvar de novo" : label}
      </Button>
    </div>
  );
}
