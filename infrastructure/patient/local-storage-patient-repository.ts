import type { Appointment } from "@/domain/appointment/appointment";
import { RecordNotFoundError } from "@/domain/errors";
import type { Patient, PatientSummary } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import type { Visit } from "@/domain/visit/visit";
import { DEVICE_STORE, LocalStorageCollection, type BrowserStoreConfig } from "../local-storage-collection";

export class LocalStoragePatientRepository implements PatientRepository {
  private readonly store: LocalStorageCollection<Patient>;
  private readonly visits: LocalStorageCollection<Visit>;
  private readonly appointments: LocalStorageCollection<Appointment>;

  constructor(config: BrowserStoreConfig = DEVICE_STORE) {
    this.store = new LocalStorageCollection<Patient>(config.patients, config.kind);
    this.visits = new LocalStorageCollection<Visit>(config.visits, config.kind);
    this.appointments = new LocalStorageCollection<Appointment>(config.appointments, config.kind);
  }

  async findAll(): Promise<PatientSummary[]> {
    return this.store.all().map((p) => ({
      id: p.id,
      number: p.number,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      thumb: p.photoThumb || p.photo,
      identification: p.identification,
    }));
  }

  async findById(id: string) {
    const found = this.store.all().find((p) => p.id === id);
    // Registros gravados antes da miniatura não têm o campo.
    return found ? { ...found, photoThumb: found.photoThumb ?? "" } : null;
  }

  async save(patient: Patient) {
    this.store.upsert(patient);
    return patient;
  }

  /**
   * Mesmo efeito visível do banco: as consultas saem junto e a agenda perde só o vínculo.
   * Aqui (só desenvolvimento, dados no aparelho) apaga de fato; no Supabase é arquivamento.
   */
  async delete(id: string) {
    if (!this.store.all().some((p) => p.id === id)) throw new RecordNotFoundError();
    this.visits.remove((v) => v.patientId === id);
    this.appointments.replaceAll(
      this.appointments.all().map((a) => (a.patientId === id ? { ...a, patientId: null } : a)),
    );
    this.store.remove((p) => p.id === id);
  }
}
