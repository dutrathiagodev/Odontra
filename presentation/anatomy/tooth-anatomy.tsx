"use client";

import { Layers, Minus, Play, Plus, Square } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { ANATOMY_PARTS, type PartKey } from "./anatomy-parts";

const OUTER = "M150 28C108 28 86 58 90 104C93 140 106 168 110 200C114 250 128 330 142 392C145 408 155 408 158 392C172 330 186 250 190 200C194 168 207 140 210 104C214 58 192 28 150 28Z";
const INNER_CROWN = "M150 46C118 46 102 68 105 106C108 138 120 166 124 205L176 205C180 166 192 138 195 106C198 68 182 46 150 46Z";
const PULP = "M150 70C132 70 126 92 128 118C130 140 140 160 143 200C145 260 147 330 150 392C153 330 155 260 157 200C160 160 170 140 172 118C174 92 168 70 150 70Z";
const TOUR_MS = 3200;

/** Corte do dente interativo: toque nas partes ou nos rótulos, ligue camadas e revele o interior. */
export function ToothAnatomy() {
  const uid = useId().replace(/:/g, "");
  const [selected, setSelected] = useState<PartKey | null>("pulp");
  const [hidden, setHidden] = useState<Set<PartKey>>(new Set());
  const [reveal, setReveal] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [touring, setTouring] = useState(false);

  useEffect(() => {
    if (!touring) return;
    const timer = setInterval(() => {
      setSelected((current) => {
        const index = ANATOMY_PARTS.findIndex((p) => p.key === current);
        return ANATOMY_PARTS[(index + 1) % ANATOMY_PARTS.length].key;
      });
    }, TOUR_MS);
    return () => clearInterval(timer);
  }, [touring]);

  const part = ANATOMY_PARTS.find((p) => p.key === selected);
  const visible = (key: PartKey) => !hidden.has(key);
  const dim = (key: PartKey) => (selected && selected !== key ? 0.5 : 1);
  const pick = (key: PartKey) => {
    setTouring(false);
    setSelected((current) => (current === key ? null : key));
  };
  const toggleLayer = (key: PartKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // “Revelar interior”: primeiro some o esmalte, depois a dentina, mostrando a polpa.
  const enamelOpacity = Math.max(0, 1 - reveal / 50);
  const dentinOpacity = Math.max(0, 1 - Math.max(0, reveal - 50) / 50);

  const layer = (key: PartKey, extra = 1) => ({
    opacity: (visible(key) ? 1 : 0) * dim(key) * extra,
    transition: "opacity .35s ease",
    cursor: "pointer",
  });

  return (
    <div className="space-y-4">
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-white to-brand-50 ring-1 ring-brand-100">
        <div className="relative aspect-[420/430] w-full">
          <svg viewBox="0 0 420 430" className="absolute inset-0 h-full w-full" role="img" aria-label="Corte do dente com camadas interativas">
            <defs>
              <linearGradient id={`${uid}-enamel`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#cfe0f7" />
              </linearGradient>
              <linearGradient id={`${uid}-dentin`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f6e6b8" />
                <stop offset="1" stopColor="#e8cf92" />
              </linearGradient>
              <linearGradient id={`${uid}-pulp`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f9b4bb" />
                <stop offset="1" stopColor="#ef7f8f" />
              </linearGradient>
              <clipPath id={`${uid}-crown`}><rect x="0" y="0" width="300" height="205" /></clipPath>
              <clipPath id={`${uid}-root`}><rect x="0" y="198" width="300" height="240" /></clipPath>
            </defs>

            <g transform={`translate(60 0)`} style={{ transformOrigin: "210px 215px", transform: `translate(60px, 0) scale(${zoom})`, transition: "transform .4s ease" }}>
              {/* Osso alveolar */}
              <g onClick={() => pick("bone")} style={layer("bone")}>
                <path d="M-40 236C20 226 80 236 112 240L112 440L-40 440Z M188 240C220 236 280 226 340 236L340 440L188 440Z" fill="#ead3ab" />
                <path d="M-40 236C20 226 80 236 112 240C118 300 134 380 146 440L-40 440Z" fill="#ead3ab" />
                <path d="M340 236C280 226 220 236 188 240C182 300 166 380 154 440L340 440Z" fill="#ead3ab" />
                {[[30,300],[60,350],[90,310],[20,390],[80,400],[110,350],[250,300],[290,350],[220,330],[310,400],[240,400],[190,370]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="#d9b985" />
                ))}
              </g>
              {/* Ligamento periodontal */}
              <g onClick={() => pick("ligament")} style={layer("ligament")} clipPath={`url(#${uid}-root)`}>
                <path d={OUTER} fill="none" stroke="#c9904f" strokeWidth="13" strokeLinejoin="round" />
                <path d={OUTER} fill="none" stroke="#f1d29a" strokeWidth="7" strokeLinejoin="round" strokeDasharray="2 5" />
              </g>
              {/* Gengiva */}
              <g onClick={() => pick("gum")} style={layer("gum")}>
                <path d="M-40 196C30 180 92 190 114 210C118 226 114 244 110 250C80 254 20 252 -40 244Z" fill="#f09aae" stroke="#dc7791" strokeWidth="2" />
                <path d="M340 196C270 180 208 190 186 210C182 226 186 244 190 250C220 254 280 252 340 244Z" fill="#f09aae" stroke="#dc7791" strokeWidth="2" />
              </g>
              {/* Dentina (corpo inteiro) */}
              <g onClick={() => pick("dentin")} style={{ ...layer("dentin", dentinOpacity) }}>
                <path d={OUTER} fill={`url(#${uid}-dentin)`} />
              </g>
              {/* Esmalte (casca da coroa) */}
              <g onClick={() => pick("enamel")} style={layer("enamel", enamelOpacity)} clipPath={`url(#${uid}-crown)`}>
                <path d={OUTER} fill={`url(#${uid}-enamel)`} stroke="#aac6ea" strokeWidth="2" />
                <path d={INNER_CROWN} fill={`url(#${uid}-dentin)`} opacity={0} />
              </g>
              {/* Dentina visível sob o esmalte */}
              <g onClick={() => pick("dentin")} style={layer("dentin", dentinOpacity)} clipPath={`url(#${uid}-crown)`} pointerEvents={visible("enamel") && enamelOpacity > 0.5 ? "none" : "auto"}>
                <path d={INNER_CROWN} fill={`url(#${uid}-dentin)`} />
              </g>
              {/* Cemento */}
              <g onClick={() => pick("cementum")} style={layer("cementum")} clipPath={`url(#${uid}-root)`}>
                <path d={OUTER} fill="none" stroke="#d3a95f" strokeWidth="5" strokeLinejoin="round" />
              </g>
              {/* Polpa */}
              <g onClick={() => pick("pulp")} style={layer("pulp")}>
                <path d={PULP} fill={`url(#${uid}-pulp)`} stroke="#d9606f" strokeWidth="1.5" />
                <path d="M150 90V390" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
                <path d="M146 100V388" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
              </g>
              {/* Feixe vásculo-nervoso no ápice */}
              <g onClick={() => pick("nerve")} style={layer("nerve")}>
                <path d="M150 388C150 400 146 412 138 424M150 388C150 402 156 414 166 426" stroke="#f4c94a" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M146 388C144 402 142 412 134 424" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M154 388C156 402 158 414 168 426" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </g>

            {/* Linhas de ligação dos rótulos */}
            {ANATOMY_PARTS.map((p) => {
              const labelY = (p.labelTop / 100) * 430 + 14;
              const x1 = p.side === "left" ? 92 : 328;
              const active = selected === p.key;
              return (
                <path
                  key={p.key}
                  d={`M${x1} ${labelY} L${p.anchor[0] + 60} ${p.anchor[1]}`}
                  stroke={active ? "#2563eb" : "#94a3b8"}
                  strokeWidth={active ? 2 : 1}
                  fill="none"
                  opacity={visible(p.key) ? 1 : 0.2}
                  style={{ transition: "all .3s" }}
                />
              );
            })}
          </svg>

          {ANATOMY_PARTS.map((p) => {
            const active = selected === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => pick(p.key)}
                aria-pressed={active}
                style={{ top: `${p.labelTop}%` }}
                className={`absolute ${p.side === "left" ? "left-1.5 text-left" : "right-1.5 text-right"} w-[21%] min-h-8 rounded-lg px-1.5 py-1 text-[10.5px] font-bold leading-tight transition sm:text-xs ${
                  active ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30" : "bg-white/90 text-navy-900 ring-1 ring-slate-200"
                } ${visible(p.key) ? "" : "opacity-40"}`}
              >
                {p.label}
              </button>
            );
          })}

        </div>
      </div>

      <div aria-live="polite" className="min-h-28 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        {part ? (
          <div key={part.key} className="animate-slide-up">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{part.summary}</p>
            <h3 className="mt-0.5 text-lg font-extrabold text-navy-900">{part.label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{part.detail}</p>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-slate-500">Toque em uma parte do dente ou em um rótulo para ver a explicação.</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <label className="flex items-center justify-between text-sm font-bold text-navy-900">
          <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-brand-600" /> Revelar interior</span>
          <span className="text-xs font-semibold text-slate-500">{reveal}%</span>
        </label>
        <input type="range" min={0} max={100} value={reveal} onChange={(e) => setReveal(Number(e.target.value))} aria-label="Revelar interior do dente" className="mt-2 h-8 w-full accent-brand-600" />
        <div className="mt-2 flex flex-wrap gap-2">
          {ANATOMY_PARTS.map((p) => {
            const on = visible(p.key);
            return (
              <button key={p.key} type="button" aria-pressed={on} onClick={() => toggleLayer(p.key)} className={`min-h-9 rounded-full px-3 text-xs font-bold transition active:scale-95 ${on ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "bg-slate-100 text-slate-400 line-through"}`}>
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-1.5">
          <span className="pl-2 text-sm font-bold text-navy-900">Zoom</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Afastar" onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))} className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 active:scale-90"><Minus className="h-4 w-4" /></button>
            <span className="w-12 text-center text-xs font-semibold text-slate-500">{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="Aproximar" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(1)))} className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 active:scale-90"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        <button type="button" onClick={() => setTouring((t) => !t)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-bold text-white active:scale-95">
          {touring ? <><Square className="h-4 w-4" /> Parar tour</> : <><Play className="h-4 w-4" /> Explorar automaticamente</>}
        </button>
      </div>
    </div>
  );
}
