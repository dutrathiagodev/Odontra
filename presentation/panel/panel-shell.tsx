import { Suspense, type ReactNode } from "react";
import { Logo } from "../ui/logo";
import { PanelNav } from "./panel-nav";

export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-900 px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo href="/painel" />
        </div>
        <p className="mb-2 mt-9 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-300/60">Menu</p>
        <Suspense fallback={null}>
          <PanelNav variant="side" />
        </Suspense>
        <p className="mt-auto rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-brand-200/70">
          Os dados ficam salvos apenas neste dispositivo. Faça o PDF dos prontuários para guardar uma cópia.
        </p>
      </aside>

      <header className="sticky top-0 z-30 bg-navy-900 shadow-md shadow-navy-950/20 lg:hidden">
        <div className="flex h-14 items-center px-4">
          <Logo href="/painel" />
        </div>
      </header>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-44 pt-5 sm:px-8 sm:pt-8 lg:pb-12">{children}</main>
      </div>

      <Suspense fallback={null}>
        <PanelNav variant="bottom" />
      </Suspense>
    </div>
  );
}
