"use client";

export interface TabItem<K extends string> {
  key: K;
  label: string;
  /** Aba com campo a corrigir: ganha um ponto vermelho. */
  alert?: boolean;
}

/** Abas roláveis na horizontal, pensadas para o polegar no celular. */
export function Tabs<K extends string>({ items, active, onChange }: { items: TabItem<K>[]; active: K; onChange: (key: K) => void }) {
  return (
    <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.key)}
            className={`min-h-11 shrink-0 rounded-lg px-5 text-sm font-bold transition ${
              selected ? "bg-navy-900 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
            {item.alert && (
              <>
                <span aria-hidden="true" className="ml-1.5 inline-block h-2 w-2 rounded-full bg-rose-500 align-middle" />
                <span className="sr-only"> (tem campo a corrigir)</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
