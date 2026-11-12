import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface RailItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

/** Janela de vidro do produto, com a barra lateral de ícones como na demo de referência. */
export function WindowShell({ rail, active, onSelect, title, children }: { rail: RailItem[]; active: string; onSelect: (key: string) => void; title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/60 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.35)] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/70 bg-white/50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <p className="ml-2 truncate text-xs font-bold text-slate-500">{title}</p>
      </div>
      <div className="flex">
        <div className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-white/70 py-4 sm:flex">
          {rail.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" aria-label={label} onClick={() => onSelect(key)} className={`grid h-10 w-10 place-items-center rounded-xl transition active:scale-90 ${active === key ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30" : "text-slate-400 hover:bg-white"}`}>
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
        <div className="min-h-[26rem] min-w-0 flex-1 p-3 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
