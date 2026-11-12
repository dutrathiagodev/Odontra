import type { Appointment } from "./appointment";

export interface AppointmentRepository {
  /** Horários que começam no intervalo [from, to). */
  findBetween(from: Date, to: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
  delete(id: string): Promise<void>;
}
