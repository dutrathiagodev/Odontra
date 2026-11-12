import type { SupabaseClient } from "@supabase/supabase-js";
import type { Appointment } from "@/domain/appointment/appointment";
import type { AppointmentRepository } from "@/domain/appointment/appointment-repository";

const COLUMNS = "id, patient_id, title, starts_at, duration_minutes, notes, google_event_id, created_at, updated_at";

interface AppointmentRow {
  id: string;
  patient_id: string | null;
  title: string;
  starts_at: string;
  duration_minutes: number;
  notes: string;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

function toDomain(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    title: row.title,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    notes: row.notes,
    googleEventId: row.google_event_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Agenda no Supabase. A RLS limita cada dentista à própria agenda. */
export class SupabaseAppointmentRepository implements AppointmentRepository {
  constructor(private readonly db: () => SupabaseClient) {}

  async findBetween(from: Date, to: Date): Promise<Appointment[]> {
    const { data, error } = await this.db()
      .from("appointments")
      .select(COLUMNS)
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString());
    if (error) throw error;
    return (data as AppointmentRow[]).map(toDomain);
  }

  async save(appointment: Appointment): Promise<void> {
    // Allowlist de colunas: o dono vem do banco (auth.uid()), nunca do cliente.
    const { error } = await this.db().from("appointments").upsert({
      id: appointment.id,
      patient_id: appointment.patientId,
      title: appointment.title,
      starts_at: appointment.startsAt,
      duration_minutes: appointment.durationMinutes,
      notes: appointment.notes,
      google_event_id: appointment.googleEventId,
    });
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db().from("appointments").delete().eq("id", id);
    if (error) throw error;
  }
}
