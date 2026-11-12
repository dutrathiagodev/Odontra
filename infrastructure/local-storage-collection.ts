/** Coleção simples sobre localStorage, compartilhada pelos repositórios. */
export class LocalStorageCollection<T extends { id: string }> {
  constructor(private readonly key: string) {}

  all(): T[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(this.key) ?? "[]");
    } catch {
      return [];
    }
  }

  replaceAll(items: T[]): void {
    window.localStorage.setItem(this.key, JSON.stringify(items));
  }

  upsert(item: T): void {
    this.replaceAll([...this.all().filter((i) => i.id !== item.id), item]);
  }

  remove(predicate: (item: T) => boolean): void {
    this.replaceAll(this.all().filter((i) => !predicate(i)));
  }
}
