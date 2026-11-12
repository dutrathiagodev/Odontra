"use client";

import { useSyncExternalStore } from "react";
import { toIsoDate } from "@/domain/patient/validation";

const noopSubscribe = () => () => {};

/**
 * Hoje (AAAA-MM-DD) no fuso do aparelho.
 * Lido só no navegador: no pré-render do servidor devolve "" (o Next não deixa ler a hora durante o render no servidor).
 */
export function useToday(): string {
  return useSyncExternalStore(noopSubscribe, () => toIsoDate(new Date()), () => "");
}
