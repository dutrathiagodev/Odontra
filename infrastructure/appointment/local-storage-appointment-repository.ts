import type { Appointment } from "@/domain/appointment/appointment";
import type { AppointmentRepository } from "@/domain/appointment/appointment-repository";
import { LocalStorageCollection } from "../local-storage-collection";

/** Agenda no aparelho, só para desenvolvimento sem Supabase. */
export class LocalStorageAppointmentRepository implements AppointmentRepository {
  private readonly collection = new LocalStorageCollection<Appointment>("odontra:appointments");

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
