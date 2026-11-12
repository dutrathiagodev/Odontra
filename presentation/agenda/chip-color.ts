/** Cores das etiquetas da agenda (fundo claro + texto escuro), como as do Calendário do iOS. */
const PALETTE = [
  { bg: "#dbe8ff", fg: "#1a45b3", bar: "#2357d9" }, // azul
  { bg: "#d9f2df", fg: "#1d6b33", bar: "#34a853" }, // verde
  { bg: "#ffdcdc", fg: "#a3262a", bar: "#ff3b30" }, // vermelho
  { bg: "#ece0ff", fg: "#5b2fae", bar: "#8e5cf6" }, // roxo
  { bg: "#fff1c2", fg: "#7a5300", bar: "#f5b400" }, // amarelo
  { bg: "#e6ebf2", fg: "#3c4a60", bar: "#8492a6" }, // cinza
] as const;

export type ChipColor = (typeof PALETTE)[number];

/** Mesma cor sempre para o mesmo paciente (ou título), para reconhecer de relance. */
export function chipColor(seed: string): ChipColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
