"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FieldIssue } from "@/domain/patient/validation";

/** `id` do campo na página, a partir do caminho no registro ("identification.cpf" vira "campo-identification-cpf"). */
export const fieldId = (field: string) => `campo-${field.replace(/\./g, "-")}`;

interface FormErrors {
  /** Mensagem do campo, só quando já deve aparecer (campo visitado ou tentativa de salvar). */
  errorFor: (field: string) => string | undefined;
  /** Marca o campo como visitado (ao sair dele). */
  touch: (field: string) => void;
}

const FormErrorsContext = createContext<FormErrors | null>(null);

/**
 * Estado de validação de um formulário.
 * O erro de um campo aparece quando a pessoa sai dele ou tenta salvar, e some sozinho quando ela corrige.
 */
export function useFormValidation(issues: FieldIssue[]) {
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);

  const messages = useMemo(() => new Map(issues.map((issue) => [issue.field, issue.message])), [issues]);

  const touch = useCallback((field: string) => {
    setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
  }, []);

  const errorFor = useCallback(
    (field: string) => (submitted || touched.has(field) ? messages.get(field) : undefined),
    [messages, submitted, touched],
  );

  const context = useMemo<FormErrors>(() => ({ errorFor, touch }), [errorFor, touch]);

  /** Mostra todos os erros. Devolve o primeiro problema (ou `null` se está tudo certo). */
  const submit = useCallback((): FieldIssue | null => {
    setSubmitted(true);
    return issues[0] ?? null;
  }, [issues]);

  return { context, submit, submitted, issues };
}

export function FormErrorsProvider({ value, children }: { value: FormErrors; children: ReactNode }) {
  return <FormErrorsContext.Provider value={value}>{children}</FormErrorsContext.Provider>;
}

/**
 * Leva o foco a um campo depois do próximo render (ex.: depois de trocar de aba),
 * rolando a tela para ele ficar no meio, acima da barra de salvar.
 */
export function useFocusField() {
  const pending = useRef<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const field = pending.current;
    if (!field) return;
    pending.current = null;
    const el = document.getElementById(fieldId(field));
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [tick]);

  return useCallback((field: string) => {
    pending.current = field;
    setTick((n) => n + 1);
  }, []);
}

/** Erro do campo vindo do formulário em volta (vazio fora de um formulário com validação). */
export function useFieldError(field: string | undefined) {
  const form = useContext(FormErrorsContext);
  return {
    error: field && form ? form.errorFor(field) : undefined,
    touch: () => field && form?.touch(field),
  };
}
