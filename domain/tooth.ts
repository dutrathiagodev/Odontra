export type ToothCondition =
  | "healthy"
  | "caries"
  | "restoration"
  | "crown"
  | "endodontics"
  | "implant"
  | "missing"
  | "extraction";

export const TOOTH_CONDITIONS: readonly ToothCondition[] = [
  "healthy",
  "caries",
  "restoration",
  "crown",
  "endodontics",
  "implant",
  "missing",
  "extraction",
];

export const TOOTH_CONDITION_LABELS: Record<ToothCondition, string> = {
  healthy: "Hígido",
  caries: "Cárie",
  restoration: "Restauração",
  crown: "Coroa",
  endodontics: "Endodontia",
  implant: "Implante",
  missing: "Ausente",
  extraction: "Extração indicada",
};

/** Numeração FDI, na ordem em que aparecem no odontograma (esquerda → direita). */
export const UPPER_TEETH = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
] as const;

export const LOWER_TEETH = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
] as const;

export interface ToothEntry {
  condition: ToothCondition;
  note: string;
}

/** Só dentes com condição diferente de hígido ou com observação são guardados. */
export type Odontogram = Record<string, ToothEntry>;

export function isToothEntryEmpty(entry: ToothEntry): boolean {
  return entry.condition === "healthy" && entry.note.trim() === "";
}

export function withToothEntry(
  odontogram: Odontogram,
  tooth: string,
  entry: ToothEntry,
): Odontogram {
  const next = { ...odontogram };
  if (isToothEntryEmpty(entry)) delete next[tooth];
  else next[tooth] = { ...entry, note: entry.note.trim() };
  return next;
}
