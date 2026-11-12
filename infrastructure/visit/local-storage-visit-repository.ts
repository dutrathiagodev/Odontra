import { RecordNotFoundError } from "@/domain/errors";
import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";
import { DEVICE_STORE, LocalStorageCollection, type BrowserStoreConfig } from "../local-storage-collection";

export class LocalStorageVisitRepository implements VisitRepository {
  private readonly store: LocalStorageCollection<Visit>;

  constructor(config: BrowserStoreConfig = DEVICE_STORE) {
    this.store = new LocalStorageCollection<Visit>(config.visits, config.kind);
  }

  async findByPatient(patientId: string) {
    return this.store.all().filter((v) => v.patientId === patientId);
  }

  async findById(id: string) {
    return this.store.all().find((v) => v.id === id) ?? null;
  }

  async save(visit: Visit) {
    this.store.upsert(visit);
    return visit;
  }

  async delete(id: string) {
    if (!this.store.all().some((v) => v.id === id)) throw new RecordNotFoundError();
    this.store.remove((v) => v.id === id);
  }
}
