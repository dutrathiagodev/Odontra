import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import { LocalStorageCollection } from "../local-storage-collection";

export class LocalStoragePatientRepository implements PatientRepository {
  private readonly store = new LocalStorageCollection<Patient>("pronturario-maju:patients");

  async findAll() {
    return this.store.all();
  }

  async findById(id: string) {
    return this.store.all().find((p) => p.id === id) ?? null;
  }

  async save(patient: Patient) {
    this.store.upsert(patient);
  }

  async delete(id: string) {
    this.store.remove((p) => p.id === id);
  }
}
