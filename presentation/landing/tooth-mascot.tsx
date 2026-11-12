"use client";

import { useEffect, useRef, useState } from "react";
import { Molar } from "../ui/molar";

/** Dente mascote no centro do fluxo: os olhos acompanham o dedo ou o mouse. */
export function ToothMascot() {
  const ref = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const follow = (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = clientX - (r.left + r.width / 2);
      const dy = clientY - (r.top + r.height * 0.42);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 260);
      setLook({ x: (dx / dist) * reach, y: (dy / dist) * reach });
    };
    // No máximo uma atualização por quadro da tela: o movimento fica liso e não pesa a rolagem.
    let frame = 0;
    let last = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        follow(last.x, last.y);
      });
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const pupil = (cx: number) => (
    <circle cx={cx + look.x * 5} cy={96 + look.y * 5} r="6.5" fill="#06101f" />
  );

  return (
    <div ref={ref} className="relative grid h-44 w-44 place-items-center sm:h-56 sm:w-56">
      <div className="absolute inset-4 rounded-full bg-accent/40 blur-3xl" aria-hidden />
      <div className="relative grid h-full w-full place-items-center rounded-full border border-white/15 bg-[#0b1a33]">
        <div className="relative h-[70%] w-[70%]">
          <Molar className="absolute inset-0 h-full w-full" tone="light" strokeWidth={8} />
          <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx="74" cy="96" r="15" fill="#ffffff" />
            <circle cx="126" cy="96" r="15" fill="#ffffff" />
            {pupil(74)}
            {pupil(126)}
            <path d="M84 132C94 142 106 142 116 132" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
