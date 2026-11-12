"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { parseThrottle, registerFailure, secondsLeft, THROTTLE_STORAGE_KEY, type ThrottleState } from "./login-throttle";

// Avisa os componentes da própria aba quando o estado muda (o evento "storage" só chega às outras abas).
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(THROTTLE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function save(state: ThrottleState | null) {
  try {
    if (state) window.sessionStorage.setItem(THROTTLE_STORAGE_KEY, JSON.stringify(state));
    else window.sessionStorage.removeItem(THROTTLE_STORAGE_KEY);
  } catch {
    // Navegação privada sem armazenamento: a espera vale só enquanto a página estiver aberta.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/** Espera progressiva do botão Entrar, guardada no sessionStorage da aba. */
export function useLoginThrottle() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const state = parseThrottle(raw);
  const [now, setNow] = useState(() => Date.now());
  const remaining = secondsLeft(state, now);

  // Relógio da contagem regressiva: só roda enquanto há espera.
  useEffect(() => {
    if (state.lockedUntil <= Date.now()) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= state.lockedUntil) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.lockedUntil]);

  /** Conta uma senha errada; devolve os segundos de espera que começaram agora (0 se nenhum). */
  const fail = (): number => {
    const current = Date.now();
    const next = registerFailure(parseThrottle(readRaw()), current);
    save(next);
    setNow(current);
    return secondsLeft(next, current);
  };

  const reset = () => save(null);

  return { secondsLeft: remaining, fail, reset };
}
