"use client";

import { Clock3, FileDown, History, MousePointerClick, Table2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "./reveal";
import { ChartScene } from "./tour/chart-scene";
import { HistoryScene } from "./tour/history-scene";
import { PdfScene } from "./tour/pdf-scene";
import { ToothScene } from "./tour/tooth-scene";
import { WindowShell } from "./tour/window-shell";

const AUTOPLAY_MS = 7000;

const STEPS = [
  { key: "chart", icon: Table2, title: "Veja a boca inteira", text: "Os 32 dentes na tela, coloridos por condição: cárie, restauração, coroa, implante e mais." },
  { key: "tooth", icon: MousePointerClick, title: "Toque no dente", text: "Escolha a condição e escreva uma observação. Tudo fica salvo na consulta." },
  { key: "history", icon: History, title: "Histórico de cada consulta", text: "A evolução do paciente em ordem, com alertas de alergia e medicação à vista." },
  { key: "pdf", icon: FileDown, title: "PDF em um toque", text: "Prontuário completo em A4, pronto para baixar ou imprimir." },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/** Tour do produto: troca de cena sozinho e também por toque, como a demo em vídeo. */
export function ProductTour() {
  const [active, setActive] = useState<StepKey>("chart");
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => {
      setActive((current) => STEPS[(STEPS.findIndex((s) => s.key === current) + 1) % STEPS.length].key);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, autoplay]);

  const choose = (key: string) => {
    setAutoplay(false);
    setActive(key as StepKey);
  };

  return (
    <section id="tour" className="relative overflow-hidden bg-enamel py-16 sm:py-24">

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-5xl">Do primeiro toque ao PDF, sem papel.</h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.8fr_1.4fr]">
          <Reveal delay={80}>
            <ol className="space-y-2.5">
              {STEPS.map((step, i) => {
                const selected = step.key === active;
                const Icon = step.icon;
                return (
                  <li key={step.key}>
                    <button type="button" onClick={() => choose(step.key)} aria-current={selected} className={`relative w-full overflow-hidden rounded-2xl p-4 text-left transition active:scale-[0.99] ${selected ? "bg-white shadow-xl shadow-brand-600/15 ring-1 ring-white" : "bg-white/40 hover:bg-white/70"}`}>
                      <span className="flex items-start gap-3">
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${selected ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30" : "bg-white text-slate-400"}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-xs font-bold text-brand-600">Passo {i + 1}</span>
                          <span className="block font-extrabold text-navy-900">{step.title}</span>
                          {selected && <span className="animate-slide-up mt-1 block text-sm leading-relaxed text-slate-600">{step.text}</span>}
                        </span>
                      </span>
                      {selected && autoplay && <span key={active} className="absolute inset-x-0 bottom-0 h-1 origin-left bg-brand-500" style={{ animation: `progress ${AUTOPLAY_MS}ms linear forwards` }} />}
                    </button>
                  </li>
                );
              })}
            </ol>
            {!autoplay && (
              <button type="button" onClick={() => setAutoplay(true)} className="mt-3 flex min-h-10 items-center gap-2 text-sm font-bold text-navy-800">
                <Clock3 className="h-4 w-4" /> Retomar demonstração automática
              </button>
            )}
          </Reveal>

          <Reveal delay={160}>
            <WindowShell rail={STEPS.map((s) => ({ key: s.key, label: s.title, icon: s.icon }))} active={active} onSelect={choose} title="odontra · painel">
              <div key={active} className="animate-slide-up">
                {active === "chart" && <ChartScene />}
                {active === "tooth" && <ToothScene />}
                {active === "history" && <HistoryScene />}
                {active === "pdf" && <PdfScene />}
              </div>
            </WindowShell>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
