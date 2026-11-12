"use client";

import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import {
  LOWER_TEETH,
  TOOTH_CONDITIONS,
  TOOTH_CONDITION_LABELS,
  UPPER_TEETH,
  withToothEntry,
  type Odontogram,
  type ToothEntry,
} from "@/domain/tooth";
import { BottomSheet } from "../ui/bottom-sheet";
import { CONDITION_COLORS, TOOTH_STROKE } from "./condition-style";
import { ToothEditor } from "./tooth-editor";
import { ToothFigure } from "./tooth-figure";

const HEALTHY: ToothEntry = { condition: "healthy", note: "" };
const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH];

interface OdontogramChartProps {
  value: Odontogram;
  /** Sem `onChange` o odontograma é apenas de visualização. */
  onChange?: (next: Odontogram) => void;
  /** Os dentes entram em sequência (usado na landing). */
  animated?: boolean;
  /** Lista abaixo do desenho com os dentes que têm condição ou observação. */
  showList?: boolean;
}

export function OdontogramChart({ value, onChange, animated = false, showList = true }: OdontogramChartProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const editable = Boolean(onChange);

  const annotated = ALL_TEETH.filter((tooth) => value[tooth]);

  const update = (tooth: string, entry: ToothEntry) => {
    onChange?.(withToothEntry(value, tooth, entry));
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-b from-brand-50 to-white p-3 ring-1 ring-brand-100 sm:p-5">
        <div className="grid grid-cols-8 gap-x-1 gap-y-3 sm:grid-cols-16">
          {ALL_TEETH.map((tooth, index) => {
            const entry = value[tooth] ?? HEALTHY;
            const lower = index >= UPPER_TEETH.length;
            return (
              <button
                key={tooth}
                type="button"
                data-tooth={tooth}
                disabled={!editable}
                onClick={() => setSelected(tooth)}
                aria-label={`Dente ${tooth}: ${TOOTH_CONDITION_LABELS[entry.condition]}${entry.note ? `. ${entry.note}` : ""}`}
                style={animated ? { animation: "tooth-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both", animationDelay: `${index * 35}ms` } : undefined}
                className="group/tooth relative flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 transition enabled:active:scale-90 enabled:hover:-translate-y-1 enabled:hover:bg-brand-100/60 disabled:cursor-default"
              >
                <span className="text-[11px] font-bold text-slate-500">{tooth}</span>
                <span className="block h-12 w-full max-w-9 sm:h-14">
                  <ToothFigure fdi={tooth} condition={entry.condition} flipped={!lower} />
                </span>
                {entry.note && (
                  <span className="absolute right-0 top-4 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-white ring-2 ring-white">
                    <MessageSquareText className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {editable && <p className="mt-3 text-center text-xs text-slate-500">Toque em um dente para registrar a condição e uma observação.</p>}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
        {TOOTH_CONDITIONS.map((condition) => (
          <li key={condition} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border" style={{ background: CONDITION_COLORS[condition], borderColor: TOOTH_STROKE }} />
            {TOOTH_CONDITION_LABELS[condition]}
          </li>
        ))}
      </ul>

      {showList && annotated.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-navy-900">Dentes registrados</h3>
          <ul className="space-y-2">
            {annotated.map((tooth) => {
              const entry = value[tooth];
              return (
                <li key={tooth}>
                  <button
                    type="button"
                    disabled={!editable}
                    onClick={() => setSelected(tooth)}
                    className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left enabled:active:bg-slate-50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-900 text-sm font-extrabold text-white">{tooth}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-navy-900">{TOOTH_CONDITION_LABELS[entry.condition]}</span>
                      {entry.note && <span className="block text-sm text-slate-600">{entry.note}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <BottomSheet open={selected !== null} title={selected ? `Dente ${selected}` : ""} onClose={() => setSelected(null)}>
        {selected && (
          <ToothEditor
            key={selected}
            entry={value[selected] ?? HEALTHY}
            onSave={(entry) => update(selected, entry)}
            onClear={() => update(selected, HEALTHY)}
          />
        )}
      </BottomSheet>
    </div>
  );
}
