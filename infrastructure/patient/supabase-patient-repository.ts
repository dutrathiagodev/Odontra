import type { SupabaseClient } from "@supabase/supabase-js";
import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";

const COLUMNS = "id, record_number, photo, identification, anamnesis, created_at, updated_at";

interface PatientRow {
  id: string;
  record_number: number;
  photo: string;
  identification: Patient["identification"];
  anamnesis: Patient["anamnesis"];
  created_at: string;
  updated_at: string;
}

function toDomain(row: PatientRow): Patient {
  return {
    id: row.id,
    number: row.record_number,
    photo: row.photo,
    identification: row.identification,
    anamnesis: row.anamnesis,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Pacientes no Supabase. owner_id é preenchido pelo banco (auth.uid()) e a RLS restringe ao dono. */
export class SupabasePatientRepository implements PatientRepository {
  constructor(private readonly db: () => SupabaseClient) {}

  async findAll(): Promise<Patient[]> {
    const { data, error } = await this.db().from("patients").select(COLUMNS);
    if (error) throw error;
    return (data as PatientRow[]).map(toDomain);
  }

  async findById(id: string): Promise<Patient | null> {
    const { data, error } = await this.db().from("patients").select(COLUMNS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toDomain(data as PatientRow) : null;
  }

  async save(patient: Patient): Promise<Patient> {
    // Allowlist de colunas: owner_id e datas não vêm do cliente. O banco decide o Nº em cadastro novo.
    const { data, error } = await this.db().from("patients").upsert({
      id: patient.id,
      record_number: patient.number,
      photo: patient.photo,
      identification: patient.identification,
      anamnesis: patient.anamnesis,
    }).select("record_number, updated_at").single();
    if (error) throw error;
    return { ...patient, number: data.record_number, updatedAt: data.updated_at };
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db().from("patients").delete().eq("id", id);
    if (error) throw error;
  }
}
