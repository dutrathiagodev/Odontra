/** Horário marcado na agenda do dentista. */
export interface Appointment {
  id: string;
  /** Paciente cadastrado (opcional: dá para marcar um horário só com o nome). */
  patientId: string | null;
  title: string;
  /** Início em ISO 8601 (com fuso). */
  startsAt: string;
  durationMinutes: number;
  notes: string;
  /** Evento correspondente no Google Agenda, quando foi enviado. */
  googleEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DURATIONS = [15, 30, 45, 60, 90, 120] as const;

export function endsAt(appointment: Pick<Appointment, "startsAt" | "durationMinutes">): Date {
  return new Date(new Date(appointment.startsAt).getTime() + appointment.durationMinutes * 60_000);
}

/** Horário novo começando na próxima meia hora do dia escolhido. */
export function createBlankAppointment(day: Date, now = new Date()): Appointment {
  const start = new Date(day);
  const sameDay = start.toDateString() === now.toDateString();
  if (sameDay) {
    start.setHours(now.getHours(), now.getMinutes() < 30 ? 30 : 60, 0, 0);
  } else {
    start.setHours(9, 0, 0, 0);
  }
  const timestamp = now.toISOString();
  return {
    id: crypto.randomUUID(),
    patientId: null,
    title: "",
    startsAt: start.toISOString(),
    durationMinutes: 30,
    notes: "",
    googleEventId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
