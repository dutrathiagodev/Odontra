"use client";

import { useState } from "react";
import {
  TOOTH_CONDITIONS,
  TOOTH_CONDITION_LABELS,
  type ToothEntry,
} from "@/domain/tooth";
import { Button } from "../ui/button";
import { TextAreaField } from "../ui/fields";
import { CONDITION_COLORS, TOOTH_STROKE } from "./condition-style";

interface ToothEditorProps {
  entry: ToothEntry;
  onSave: (entry: ToothEntry) => void;
  onClear: () => void;
}

export function ToothEditor({ entry, onSave, onClear }: ToothEditorProps) {
  const [condition, setCondition] = useState(entry.condition);
  const [note, setNote] = useState(entry.note);

  return (
    <div className="space-y-4 pb-2">
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Condição</span>
        <div className="grid grid-cols-2 gap-2">
          {TOOTH_CONDITIONS.map((item) => {
            const selected = item === condition;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setCondition(item)}
                className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3 text-left text-sm font-semibold transition active:scale-95 ${
                  selected ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span className="h-4 w-4 shrink-0 rounded-full border" style={{ background: CONDITION_COLORS[item], borderColor: TOOTH_STROKE }} />
                {TOOTH_CONDITION_LABELS[item]}
              </button>
            );
          })}
        </div>
      </div>

      <TextAreaField label="Observação" value={note} onChange={setNote} rows={3} placeholder="Ex.: sensibilidade ao frio, face oclusal, retratamento…" />

      <div className="flex gap-2">
        <Button variant="danger" onClick={onClear} className="flex-1">Limpar</Button>
        <Button onClick={() => onSave({ condition, note })} className="flex-[2]">Salvar dente</Button>
      </div>
    </div>
  );
}
