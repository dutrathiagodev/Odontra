import { Button } from "./button";

/** Carregando, não encontrado ou erro com "Tentar de novo": nenhuma tela fica parada sem explicação. */
export function LoadState({ state, error, missingText, onRetry }: { state: "loading" | "missing" | "error"; error?: string; missingText: string; onRetry: () => void }) {
  if (state === "loading") return <p role="status" className="py-10 text-center text-slate-500">Carregando…</p>;
  if (state === "missing") return <p className="py-10 text-center text-slate-500">{missingText}</p>;
  return (
    <div role="alert" className="mx-auto my-10 max-w-sm rounded-2xl bg-rose-50 px-5 py-5 text-center text-sm text-rose-800 ring-1 ring-rose-200">
      <p className="font-semibold">Não deu para abrir.</p>
      {error && <p className="mt-1">{error}</p>}
      <Button variant="secondary" onClick={onRetry} className="mt-3">Tentar de novo</Button>
    </div>
  );
}
