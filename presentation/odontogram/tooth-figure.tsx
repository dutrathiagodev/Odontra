import type { ToothCondition } from "@/domain/tooth";
import { CONDITION_COLORS, TOOTH_PATH, TOOTH_STROKE } from "./condition-style";

/** Desenho de um dente colorido pela condição. `flipped` espelha para a arcada inferior. */
export function ToothFigure({ condition, flipped = false }: { condition: ToothCondition; flipped?: boolean }) {
  const missing = condition === "missing";

  return (
    <svg viewBox="0 0 24 40" className="h-full w-full" style={flipped ? { transform: "scaleY(-1)" } : undefined} aria-hidden>
      <path
        d={TOOTH_PATH}
        fill={CONDITION_COLORS[condition]}
        stroke={TOOTH_STROKE}
        strokeWidth={1.3}
        strokeLinejoin="round"
        strokeDasharray={missing ? "2.5 2" : undefined}
        opacity={missing ? 0.7 : 1}
      />
      {condition === "extraction" && (
        <path d="M6 5 L18 31 M18 5 L6 31" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" />
      )}
      {condition === "endodontics" && <path d="M12 12 V30" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />}
      {condition === "implant" && <path d="M8 22 H16 M9 26 H15 M10 30 H14" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />}
    </svg>
  );
}
