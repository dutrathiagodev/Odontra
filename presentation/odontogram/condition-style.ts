import type { ToothCondition } from "@/domain/tooth";

export const CONDITION_COLORS: Record<ToothCondition, string> = {
  healthy: "#ffffff",
  caries: "#ef4444",
  restoration: "#3b82f6",
  crown: "#f59e0b",
  endodontics: "#8b5cf6",
  implant: "#14b8a6",
  missing: "#e2e8f0",
  extraction: "#be123c",
};

export const TOOTH_STROKE = "#334e7a";

/** Silhueta de um dente (coroa + raízes) em um viewBox 0 0 24 40. */
export const TOOTH_PATH =
  "M4 9 C4 2 20 2 20 9 C20 17 18 19 17 28 C16.5 36 14 38 13 32 C12.5 28 11.5 28 11 32 C10 38 7.5 36 7 28 C6 19 4 17 4 9 Z";
