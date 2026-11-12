import type { SupabaseClient } from "@supabase/supabase-js";
import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";

const COLUMNS = "id, patient_id, sequence, visit_date, dentist, reason, oral_health, clinical_exam, odontogram, findings, created_at, updated_at";

interface VisitRow {
  id: string;
  patient_id: string;
  sequence: number;
  visit_date: string;
  dentist: Visit["dentist"];
  reason: string;
  oral_health: Visit["oralHealth"];
  clinical_exam: Visit["clinicalExam"];
  odontogram: Visit["odontogram"];
  findings: string;
  created_at: string;
  updated_at: string;
}

function toDomain(row: VisitRow): Visit {
  return {
    id: row.id,
    patientId: row.patient_id,
    sequence: row.sequence,
    date: row.visit_date,
    dentist: row.dentist,
    reason: row.reason,
    oralHealth: row.oral_health,
    clinicalExam: row.clinical_exam,
    odontogram: row.odontogram,
    findings: row.findings,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Consultas no Supabase. A RLS garante que a consulta e o paciente pertencem ao mesmo dentista. */
export class SupabaseVisitRepository implements VisitRepository {
  constructor(private readonly db: () => SupabaseClient) {}

  async findByPatient(patientId: string): Promise<Visit[]> {
    const { data, error } = await this.db().from("visits").select(COLUMNS).eq("patient_id", patientId);
    if (error) throw error;
    return (data as VisitRow[]).map(toDomain);
  }

  async findById(id: string): Promise<Visit | null> {
    const { data, error } = await this.db().from("visits").select(COLUMNS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toDomain(data as VisitRow) : null;
  }

  async save(visit: Visit): Promise<Visit> {
    const { data, error } = await this.db().from("visits").upsert({
      id: visit.id,
      patient_id: visit.patientId,
      sequence: visit.sequence,
      visit_date: visit.date,
      dentist: visit.dentist,
      reason: visit.reason,
      oral_health: visit.oralHealth,
      clinical_exam: visit.clinicalExam,
      odontogram: visit.odontogram,
      findings: visit.findings,
    }).select("sequence, updated_at").single();
    if (error) throw error;
    return { ...visit, sequence: data.sequence, updatedAt: data.updated_at };
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db().from("visits").delete().eq("id", id);
    if (error) throw error;
  }

  async deleteByPatient(patientId: string): Promise<void> {
    const { error } = await this.db().from("visits").delete().eq("patient_id", patientId);
    if (error) throw error;
  }
}
