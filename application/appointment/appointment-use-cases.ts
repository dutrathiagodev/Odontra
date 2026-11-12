import type { Appointment } from "@/domain/appointment/appointment";
import type { AppointmentRepository } from "@/domain/appointment/appointment-repository";

/** Agenda de um período, em ordem de horário. */
export class ListAppointments {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(from: Date, to: Date): Promise<Appointment[]> {
    const list = await this.appointments.findBetween(from, to);
    return [...list].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
}

export class SaveAppointment {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    const title = appointment.title.trim();
    if (!title) throw new Error("appointment-title-required");
    const saved = { ...appointment, title, notes: appointment.notes.trim(), updatedAt: new Date().toISOString() };
    await this.appointments.save(saved);
    return saved;
  }
}

export class DeleteAppointment {
  constructor(private readonly appointments: AppointmentRepository) {}

  execute(id: string): Promise<void> {
    return this.appointments.delete(id);
  }
}
