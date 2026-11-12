import { DEMO_STORE } from "../local-storage-collection";

/**
 * Modo exemplo: pacientes fictícios só nesta aba do navegador (sessionStorage).
 * Enquanto ativo, os repositórios do app leem e gravam aqui, nunca no Supabase.
 * Fechar a aba ou "Sair do exemplo" apaga tudo.
 */
const FLAG = "odontra:demo:active";
const listeners = new Set<() => void>();

function session(): Storage | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function notify() {
  for (const listener of listeners) listener();
}

function clearData(storage: Storage) {
  storage.removeItem(DEMO_STORE.patients);
  storage.removeItem(DEMO_STORE.visits);
  storage.removeItem(DEMO_STORE.appointments);
}

export const demoMode = {
  isActive(): boolean {
    try {
      return session()?.getItem(FLAG) === "1";
    } catch {
      return false;
    }
  },

  /** Liga o modo exemplo com os dados já gravados pela LoadDemoData (na aba). */
  activate(): void {
    session()?.setItem(FLAG, "1");
    notify();
  },

  /** Começa do zero: apaga exemplos anteriores desta aba (sem ligar o modo). */
  reset(): void {
    const storage = session();
    if (storage) clearData(storage);
  },

  /** Sai do exemplo e apaga os dados fictícios desta aba. */
  leave(): void {
    const storage = session();
    if (!storage) return;
    storage.removeItem(FLAG);
    clearData(storage);
    notify();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/**
 * Repositório que, a cada chamada, usa o de exemplo (modo exemplo ligado) ou o real.
 * Assim todas as telas (lista, ficha, consultas, agenda, PDF) funcionam no exemplo sem mudança.
 */
export function demoAware<T extends object>(real: T, demo: T): T {
  return new Proxy(real, {
    get(_target, property) {
      const target = demoMode.isActive() ? demo : real;
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
