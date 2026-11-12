"use client";

/* eslint-disable @next/next/no-img-element */
import { CheckCircle2, FileDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TOOTH_CONDITION_LABELS, type Odontogram, type ToothCondition } from "@/domain/tooth";
import { CONDITION_COLORS, TOOTH_STROKE } from "../../odontogram/condition-style";
import { OdontogramChart } from "../../odontogram/odontogram-chart";
import { PROFILE_PHOTOS, profilePhotoUrl } from "../../profile-photos";

const BASE: Odontogram = {
  "16": { condition: "restoration", note: "" },
  "36": { condition: "endodontics", note: "" },
  "46": { condition: "crown", note: "" },
  "11": { condition: "implant", note: "" },
  "38": { condition: "missing", note: "" },
};
const TARGET_TOOTH = "26";
const OPTIONS: ToothCondition[] = ["caries", "restoration", "crown", "endodontics"];

type Point = { x: number; y: number };

/**
 * Demonstração automática do produto, no estilo da referência:
 * o cursor toca no dente 26, marca cárie e gera o PDF. Roda em loop só quando está na tela.
 */
export function HeroDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [teeth, setTeeth] = useState<Odontogram>(BASE);
  const [cursor, setCursor] = useState<Point>({ x: 0.82, y: 0.92 });
  const [click, setClick] = useState<Point | null>(null);
  const [picker, setPicker] = useState<Point | null>(null);
  const [highlight, setHighlight] = useState<ToothCondition | null>(null);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");
  const [running, setRunning] = useState(false);
  const patient = PROFILE_PHOTOS[0];

  /** Centro de um elemento da demo, em fração da caixa (0 a 1). */
  const pointOf = useCallback((selector: string): Point => {
    const box = boxRef.current;
    const el = box?.querySelector(selector);
    if (!box || !el) return { x: 0.5, y: 0.5 };
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - b.left) / b.width, y: (r.top + r.height / 2 - b.top) / b.height };
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // Com movimento reduzido a demo fica parada no estado inicial.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    const tap = (p: Point) => {
      setClick(p);
      timers.push(setTimeout(() => setClick(null), 450));
    };

    const cycle = () => {
      setTeeth(BASE);
      setPicker(null);
      setHighlight(null);
      setToast("");
      setGenerating(false);
      setCursor({ x: 0.82, y: 0.92 });

      at(700, () => setCursor(pointOf(`[data-tooth="${TARGET_TOOTH}"]`)));
      at(1600, () => {
        const tooth = pointOf(`[data-tooth="${TARGET_TOOTH}"]`);
        tap(tooth);
        setPicker({ x: Math.min(tooth.x, 0.62), y: Math.min(tooth.y + 0.08, 0.6) });
      });
      at(2400, () => setCursor(pointOf('[data-option="caries"]')));
      at(2900, () => setHighlight("caries"));
      at(3200, () => {
        tap(pointOf('[data-option="caries"]'));
        setTeeth({ ...BASE, [TARGET_TOOTH]: { condition: "caries", note: "Face oclusal" } });
        setPicker(null);
        setToast("Dente 26: cárie registrada");
      });
      at(4600, () => {
        setToast("");
        setCursor(pointOf('[data-action="pdf"]'));
      });
      at(5400, () => {
        tap(pointOf('[data-action="pdf"]'));
        setGenerating(true);
      });
      at(6500, () => {
        setGenerating(false);
        setToast("Prontuário em PDF pronto");
      });
      at(9000, cycle);
    };

    cycle();
    return () => timers.forEach(clearTimeout);
  }, [running, pointOf]);

  return (
    <div ref={boxRef} className="relative select-none rounded-[22px] border border-white/15 bg-white p-3 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:p-5" aria-label="Demonstração: marcar um dente e gerar o prontuário em PDF">
      <div className="mb-3 flex items-center gap-3 border-b border-line pb-3">
        <img src={profilePhotoUrl(patient.id, 96)} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{patient.name}</p>
          <p className="text-xs text-muted">Consulta 3, hoje</p>
        </div>
        <span data-action="pdf" className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-colors ${generating ? "bg-accent-strong" : "bg-accent"}`}>
          <FileDown className="h-3.5 w-3.5" /> {generating ? "Gerando…" : "Gerar PDF"}
        </span>
      </div>

      <div className="pointer-events-none">
        <OdontogramChart value={teeth} showList={false} />
      </div>

      {picker && (
        <div className="animate-slide-up absolute z-10 w-44 rounded-xl border border-line bg-white p-2 shadow-xl" style={{ left: `${picker.x * 100}%`, top: `${picker.y * 100}%`, transform: "translateX(-50%)" }}>
          <p className="px-1.5 pb-1 text-[11px] font-semibold text-muted">Dente 26</p>
          {OPTIONS.map((option) => (
            <span key={option} data-option={option} className={`flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs font-medium ${highlight === option ? "bg-accent/10 text-accent" : ""}`}>
              <span className="h-3 w-3 rounded-full border" style={{ background: CONDITION_COLORS[option], borderColor: TOOTH_STROKE }} />
              {TOOTH_CONDITION_LABELS[option]}
            </span>
          ))}
        </div>
      )}

      {toast && (
        <p role="status" className="animate-slide-up absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}
        </p>
      )}

      {click && <span className="animate-pulse-ring pointer-events-none absolute z-30 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent" style={{ left: `${click.x * 100}%`, top: `${click.y * 100}%` }} />}

      <svg viewBox="0 0 24 24" className="pointer-events-none absolute z-30 h-6 w-6 drop-shadow transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }} aria-hidden>
        <path d="M4 2l15 9-6.5 1.6L16 20l-2.6 1.2-3.5-7.4L4 18z" fill="#0e2240" stroke="#ffffff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
