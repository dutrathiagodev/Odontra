/** Onde a coleção guarda: localStorage (padrão) ou sessionStorage (modo exemplo, some ao fechar a aba). */
export type BrowserStorageKind = "local" | "session";

/** Chaves e tipo de armazenamento usados pelos repositórios do navegador. */
export interface BrowserStoreConfig {
  kind: BrowserStorageKind;
  patients: string;
  visits: string;
  appointments: string;
}

/** Dados no aparelho, só para desenvolvimento sem Supabase. */
export const DEVICE_STORE: BrowserStoreConfig = {
  kind: "local",
  patients: "pronturario-maju:patients",
  visits: "pronturario-maju:visits",
  appointments: "odontra:appointments",
};

/** Modo exemplo: só nesta aba, nunca vai para o banco. */
export const DEMO_STORE: BrowserStoreConfig = {
  kind: "session",
  patients: "odontra:demo:patients",
  visits: "odontra:demo:visits",
  appointments: "odontra:demo:appointments",
};

function storageOf(kind: BrowserStorageKind): Storage {
  return kind === "session" ? window.sessionStorage : window.localStorage;
}

/** Coleção simples sobre o armazenamento do navegador, compartilhada pelos repositórios. */
export class LocalStorageCollection<T extends { id: string }> {
  constructor(
    private readonly key: string,
    private readonly kind: BrowserStorageKind = "local",
  ) {}

  all(): T[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(storageOf(this.kind).getItem(this.key) ?? "[]");
    } catch {
      return [];
    }
  }

  replaceAll(items: T[]): void {
    storageOf(this.kind).setItem(this.key, JSON.stringify(items));
  }

  upsert(item: T): void {
    this.replaceAll([...this.all().filter((i) => i.id !== item.id), item]);
  }

  remove(predicate: (item: T) => boolean): void {
    this.replaceAll(this.all().filter((i) => !predicate(i)));
  }

  clear(): void {
    if (typeof window === "undefined") return;
    storageOf(this.kind).removeItem(this.key);
  }
}
