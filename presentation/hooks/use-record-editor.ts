"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { friendlyError, withTimeout } from "../async/with-timeout";

type LoadState = "loading" | "ready" | "missing" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";

interface Options<T> {
  /** Carrega o registro (ou cria um em branco). `null` = não encontrado. */
  load: () => Promise<T | null>;
  /** Grava e devolve o registro como ficou no banco. */
  persist: (value: T) => Promise<T>;
  /**
   * Junta o que o banco devolveu com o que a pessoa digitou enquanto salvava.
   * Deve copiar só os campos que o banco decide (id, número, datas).
   */
  mergeSaved: (current: T, saved: T) => T;
  deps: unknown[];
}

/**
 * Estado de uma tela de edição (paciente, consulta).
 * - Carregar nunca fica em "Carregando…" para sempre: tem tempo limite, erro e "Tentar de novo".
 * - Salvar mostra erro claro e não apaga o que foi digitado durante o salvamento.
 */
export function useRecordEditor<T>({ load, persist, mergeSaved, deps }: Options<T>) {
  const [value, setValue] = useState<T | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const editVersion = useRef(0);
  const current = useRef<T | null>(null);

  useEffect(() => {
    let cancelled = false;
    withTimeout(load())
      .then((loaded) => {
        if (cancelled) return;
        current.current = loaded;
        setValue(loaded);
        setLoadState(loaded ? "ready" : "missing");
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(friendlyError(err));
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => {
    setLoadState("loading");
    setAttempt((n) => n + 1);
  }, []);

  const edit = useCallback((patch: Partial<T>) => {
    editVersion.current += 1;
    setValue((prev) => {
      const next = prev ? { ...prev, ...patch } : prev;
      current.current = next;
      return next;
    });
    setSaveState((s) => (s === "saved" ? "idle" : s));
  }, []);

  /** Salva o estado atual. Devolve o registro salvo, ou `null` se deu erro (a mensagem fica em `saveError`). */
  const save = useCallback(async (): Promise<T | null> => {
    const snapshot = current.current;
    if (!snapshot) return null;
    const versionAtStart = editVersion.current;
    setSaveState("saving");
    setSaveError("");
    try {
      const saved = await withTimeout(persist(snapshot));
      const changedWhileSaving = editVersion.current !== versionAtStart;
      const next = changedWhileSaving && current.current ? mergeSaved(current.current, saved) : saved;
      current.current = next;
      setValue(next);
      setSaveState(changedWhileSaving ? "idle" : "saved");
      return next;
    } catch (err) {
      setSaveError(`Não foi salvo. ${friendlyError(err)} O que você digitou continua aqui.`);
      setSaveState("error");
      return null;
    }
  }, [persist, mergeSaved]);

  return { value, loadState, loadError, retry, edit, save, saveState, saveError };
}
