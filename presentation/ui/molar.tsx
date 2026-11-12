import { useId, type CSSProperties } from "react";

/**
 * Molar em traço contínuo: duas cúspides com o sulco na coroa, duas raízes e a furca.
 * Desenhado para lembrar um dente de verdade (referências de line art enviadas pelo cliente).
 */
const OUTLINE =
  "M100 56C86 40 70 30 52 30C28 30 16 52 18 82C20 108 30 128 38 150C46 176 50 210 62 226C72 238 84 228 86 206C88 186 90 162 100 160C110 162 112 186 114 206C116 228 128 238 138 226C150 210 154 176 162 150C170 128 180 108 182 82C184 52 172 30 148 30C128 30 112 40 100 56Z";
const CREASE = "M100 56C112 70 136 73 157 62";
const FURCATION = "M86 182C92 170 106 168 116 176";

const TONES = {
  light: { stroke: "#ffffff", fill: "rgba(255,255,255,0.05)", hatch: "#ffffff" },
  blue: { stroke: "#9cc0ff", fill: "rgba(156,192,255,0.08)", hatch: "#9cc0ff" },
  ink: { stroke: "#0e2240", fill: "#ffffff", hatch: "#0e2240" },
} as const;

export interface MolarProps {
  className?: string;
  style?: CSSProperties;
  tone?: keyof typeof TONES;
  /** Hachura de desenho à mão dentro do dente (fica bonito em tamanhos grandes). */
  hatched?: boolean;
  strokeWidth?: number;
}

export function Molar({ className = "", style, tone = "light", hatched = false, strokeWidth = 7 }: MolarProps) {
  const id = useId().replace(/:/g, "");
  const colors = TONES[tone];

  return (
    <svg viewBox="0 0 200 250" className={className} style={style} fill="none" aria-hidden>
      {hatched && (
        <defs>
          <clipPath id={`${id}-clip`}>
            <path d={OUTLINE} />
          </clipPath>
          <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="7" stroke={colors.hatch} strokeWidth="0.7" opacity="0.28" />
          </pattern>
          <radialGradient id={`${id}-shade`} cx="35%" cy="25%" r="80%">
            <stop offset="0" stopColor={colors.hatch} stopOpacity="0.22" />
            <stop offset="1" stopColor={colors.hatch} stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      <path d={OUTLINE} fill={colors.fill} />
      {hatched && (
        <g clipPath={`url(#${id}-clip)`}>
          <rect width="200" height="250" fill={`url(#${id}-hatch)`} />
          <rect width="200" height="250" fill={`url(#${id}-shade)`} />
        </g>
      )}
      <path d={OUTLINE} stroke={colors.stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d={CREASE} stroke={colors.stroke} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <path d={FURCATION} stroke={colors.stroke} strokeWidth={strokeWidth * 0.55} strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
