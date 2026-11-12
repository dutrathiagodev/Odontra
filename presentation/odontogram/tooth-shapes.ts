/**
 * Silhuetas de dente em perfil (coroa em cima, raízes para baixo) num quadro 24×44,
 * por tipo anatômico, para o odontograma do PDF no estilo da ficha impressa.
 */
export type ToothKind = "incisor" | "canine" | "premolar" | "molar";

export const TOOTH_PROFILE: Record<ToothKind, string> = {
  incisor: "M7 4 L17 4 C17 11 16 17 15 21 C15 30 13 41 12 41 C11 41 9 30 9 21 C8 17 7 11 7 4 Z",
  canine: "M7 10 C7 6 10 2 12 2 C14 2 17 6 17 10 C17 16 16 19 15 22 C15 31 13 43 12 43 C11 43 9 31 9 22 C8 19 7 16 7 10 Z",
  premolar: "M6 11 C6 5 8 3 12 3 C16 3 18 5 18 11 C18 16 17 18 16 20 C16 29 14 41 12 41 C10 41 8 29 8 20 C7 18 6 16 6 11 Z",
  molar: "M3 11 C3 5 6 3 12 4 C18 3 21 5 21 11 C21 16 19 18 18 19 C18 28 17 38 15 40 C14 41 13 37 13 31 L12 25 L11 31 C11 37 10 41 9 40 C7 38 6 28 6 19 C5 18 3 16 3 11 Z",
};

/** Tipo do dente pela numeração FDI (último dígito). */
export function toothKind(fdi: string): ToothKind {
  const position = Number(fdi.slice(-1));
  if (position <= 2) return "incisor";
  if (position === 3) return "canine";
  if (position <= 5) return "premolar";
  return "molar";
}
