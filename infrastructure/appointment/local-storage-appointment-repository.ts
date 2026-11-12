import type { Appointment } from "@/domain/appointment/appointment";
import type { AppointmentRepository } from "@/domain/appointment/appointment-repository";
import { DEVICE_STORE, LocalStorageCollection, type BrowserStoreConfig } from "../local-storage-collection";

/** Agenda no navegador: no aparelho (desenvolvimento sem Supabase) ou na aba (modo exemplo). */
export class LocalStorageAppointmentRepository implements AppointmentRepository {
  private readonly collection: LocalStorageCollection<Appointment>;

  constructor(config: BrowserStoreConfig = DEVICE_STORE) {
    this.collection = new LocalStorageCollection<Appointment>(config.appointments, config.kind);
  }

  async findBetween(from: Date, to: Date): Promise<Appointment[]> {
    return this.collection.all().filter((a) => {
      const start = new Date(a.startsAt).getTime();
      return start >= from.getTime() && start < to.getTime();
    });
  }

  async save(appointment: Appointment): Promise<void> {
    this.collection.upsert(appointment);
  }

  async delete(id: string): Promise<void> {
    this.collection.remove((a) => a.id === id);
  }
}
