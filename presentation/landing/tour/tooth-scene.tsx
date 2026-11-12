"use client";

import { useEffect, useState } from "react";
import { TOOTH_CONDITION_LABELS, type ToothCondition } from "@/domain/tooth";
import { CONDITION_COLORS, TOOTH_STROKE } from "../../odontogram/condition-style";
import { ToothFigure } from "../../odontogram/tooth-figure";

const FLOW: { condition: ToothCondition; note: string }[] = [
  { condition: "caries", note: "Cárie profunda, face oclusal." },
  { condition: "restoration", note: "Resina composta realizada hoje." },
  { condition: "endodontics", note: "Canal tratado, aguardar coroa." },
  { condition: "crown", note: "Coroa cerâmica instalada." },
];
const OPTIONS: ToothCondition[] = ["healthy", "caries", "restoration", "crown", "endodontics", "implant", "missing", "extraction"];

/** Simula o toque em um dente: a condição é escolhida e a observação é digitada, em loop. */
export function ToothScene() {
  const [step, setStep] = useState(0);
  const current = FLOW[step];

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % FLOW.length), 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid items-center gap-5 text-navy-900 sm:grid-cols-[0.8fr_1.2fr]">
      <div className="relative mx-auto grid h-56 w-44 place-items-center rounded-3xl bg-gradient-to-b from-white to-brand-50 ring-1 ring-brand-100 sm:h-72 sm:w-52">
        <span className="absolute left-3 top-3 rounded-lg bg-navy-900 px-2.5 py-1 text-sm font-extrabold text-white">26</span>
        <div key={current.condition} className="animate-slide-up h-40 w-24 drop-shadow-xl sm:h-52 sm:w-28">
          <ToothFigure condition={current.condition} />
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-white">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Condição</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {OPTIONS.map((option) => {
            const selected = option === current.condition;
            return (
              <span key={option} className={`flex min-h-10 items-center gap-2 rounded-xl border px-2.5 text-xs font-bold transition-all duration-300 sm:text-sm ${selected ? "scale-[1.03] border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200" : "border-slate-200 bg-white text-slate-500"}`}>
                <span className="h-3.5 w-3.5 shrink-0 rounded-full border" style={{ background: CONDITION_COLORS[option], borderColor: TOOTH_STROKE }} />
                {TOOTH_CONDITION_LABELS[option]}
              </span>
            );
          })}
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Observação</p>
        <TypedNote key={current.note} text={current.note} />
      </div>
    </div>
  );
}

/** Digita o texto letra a letra; remontado (via key) a cada nova observação. */
function TypedNote({ text }: { text: string }) {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTyped((n) => Math.min(n + 1, text.length)), 38);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <p className="mt-1.5 min-h-16 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
      {text.slice(0, typed)}
      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-600 align-middle" />
    </p>
  );
}
