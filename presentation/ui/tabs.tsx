"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { arrowTarget } from "./keyboard";

export interface TabItem<K extends string> {
  key: K;
  label: string;
  /** Aba com campo a corrigir: ganha um ponto vermelho. */
  alert?: boolean;
}

const tabId = (idBase: string, key: string) => `${idBase}-aba-${key}`;
const panelId = (idBase: string) => `${idBase}-painel`;

interface TabsProps<K extends string> {
  items: TabItem<K>[];
  active: K;
  onChange: (key: K) => void;
  /** Prefixo dos ids (liga cada aba ao painel). Único na página. */
  idBase: string;
  /** Nome do grupo de abas para leitor de tela. */
  label: string;
}

/**
 * Abas roláveis na horizontal, pensadas para o polegar no celular.
 * Teclado: só a aba ativa entra no Tab; setas, Home e End trocam de aba.
 */
export function Tabs<K extends string>({ items, active, onChange, idBase, label }: TabsProps<K>) {
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = arrowTarget(e.key, index, items.length);
    if (target === null || e.key === "ArrowUp" || e.key === "ArrowDown") return;
    e.preventDefault();
    onChange(items[target].key);
    document.getElementById(tabId(idBase, items[target].key))?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {items.map((item, index) => {
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            id={tabId(idBase, item.key)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(idBase)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => onKeyDown(e, index)}
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

/** Conteúdo da aba ativa, ligado à aba por `aria-labelledby`. */
export function TabPanel({ idBase, active, children }: { idBase: string; active: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={panelId(idBase)} aria-labelledby={tabId(idBase, active)} tabIndex={0} className="space-y-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-50">
      {children}
    </div>
  );
}
