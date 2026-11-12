"use client";

import { FlaskConical, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { demoMode } from "@/infrastructure/container";
import { useDemoMode } from "./use-demo-mode";

/** Faixa fixa no painel enquanto o modo exemplo está ligado, com o botão para sair. */
export function DemoBanner() {
  const active = useDemoMode();
  const router = useRouter();
  if (!active) return null;

  const leave = () => {
    demoMode.leave();
    router.push("/painel");
  };

  return (
    <div role="status" className="mb-5 flex flex-col gap-3 rounded-xl bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-3 text-sm">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <span>
          <strong className="font-bold">Exemplo:</strong> pacientes fictícios só nesta aba do navegador.
          Nada do que você fizer aqui é salvo no seu prontuário.
        </span>
      </p>
      <button
        type="button"
        onClick={leave}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-amber-900 ring-1 ring-amber-300 transition hover:bg-amber-100"
      >
        <LogOut className="h-4 w-4" aria-hidden /> Sair do exemplo
      </button>
    </div>
  );
}
