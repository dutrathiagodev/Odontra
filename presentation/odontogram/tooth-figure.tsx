import type { ToothCondition } from "@/domain/tooth";
import { CONDITION_COLORS, TOOTH_STROKE } from "./condition-style";
import { TOOTH_PROFILE, toothKind } from "./tooth-shapes";

/**
 * Dente em perfil com a anatomia do tipo (incisivo, canino, pré-molar, molar), colorido pela condição.
 * `flipped` vira as raízes para cima, como na arcada superior.
 */
export function ToothFigure({ fdi = "16", condition, flipped = false }: { fdi?: string; condition: ToothCondition; flipped?: boolean }) {
  const missing = condition === "missing";
  const fill = condition === "healthy" || missing ? "#ffffff" : CONDITION_COLORS[condition];

  return (
    <svg viewBox="0 0 24 44" className="h-full w-full" style={flipped ? { transform: "scaleY(-1)" } : undefined} aria-hidden>
      <path
        d={TOOTH_PROFILE[toothKind(fdi)]}
        fill={fill}
        stroke={TOOTH_STROKE}
        strokeWidth={1.1}
        strokeLinejoin="round"
        strokeDasharray={missing ? "2.5 2" : undefined}
        opacity={missing ? 0.7 : 1}
      />
      {condition === "extraction" && <path d="M5 6 L19 38 M19 6 L5 38" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />}
      {condition === "endodontics" && <path d="M12 12 V36" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />}
      {condition === "implant" && <path d="M8 24 H16 M9 28 H15 M10 32 H14" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />}
    </svg>
  );
}
