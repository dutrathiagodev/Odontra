import type { SupabaseClient } from "@supabase/supabase-js";
import type { Patient, PatientSummary } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import { archiveRow } from "../supabase/archive-row";

const COLUMNS = "id, record_number, photo, photo_thumb, identification, anamnesis, created_at, updated_at";
/** Lista: sem a foto inteira e sem a anamnese. */
const SUMMARY_COLUMNS = "id, record_number, photo_thumb, has_photo, identification, created_at, updated_at";

interface PatientRow {
  id: string;
  record_number: number;
  photo: string;
  photo_thumb: string;
  identification: Patient["identification"];
  anamnesis: Patient["anamnesis"];
  created_at: string;
  updated_at: string;
}

interface SummaryRow {
  id: string;
  record_number: number;
  photo_thumb: string;
  has_photo: boolean;
  identification: Patient["identification"];
  created_at: string;
  updated_at: string;
}

function toDomain(row: PatientRow): Patient {
  return {
    id: row.id,
    number: row.record_number,
    photo: row.photo,
    photoThumb: row.photo_thumb,
    identification: row.identification,
    anamnesis: row.anamnesis,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSummary(row: SummaryRow, legacyPhotos: Map<string, string>): PatientSummary {
  return {
    id: row.id,
    number: row.record_number,
    thumb: row.photo_thumb || legacyPhotos.get(row.id) || "",
    identification: row.identification,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Pacientes no Supabase. owner_id é preenchido pelo banco (auth.uid()) e a RLS restringe ao dono. */
export class SupabasePatientRepository implements PatientRepository {
  constructor(private readonly db: () => SupabaseClient) {}

  async findAll(): Promise<PatientSummary[]> {
    // A RLS já esconde os arquivados; o filtro explícito deixa a intenção clara e usa o índice parcial.
    const { data, error } = await this.db().from("patients").select(SUMMARY_COLUMNS).is("deleted_at", null);
    if (error) throw error;
    const rows = data as SummaryRow[];
    const legacyPhotos = await this.legacyPhotos(rows);
    return rows.map((row) => toSummary(row, legacyPhotos));
  }

  /**
   * Cadastros antigos têm foto mas ainda não têm miniatura: busca a foto só desses
   * (a miniatura é criada quando a ficha for salva de novo).
   */
  private async legacyPhotos(rows: SummaryRow[]): Promise<Map<string, string>> {
    const ids = rows.filter((row) => row.has_photo && !row.photo_thumb).map((row) => row.id);
    if (ids.length === 0) return new Map();
    const { data, error } = await this.db().from("patients").select("id, photo").in("id", ids);
    if (error) throw error;
    return new Map((data as { id: string; photo: string }[]).map((row) => [row.id, row.photo]));
  }

  async findById(id: string): Promise<Patient | null> {
    const { data, error } = await this.db().from("patients").select(COLUMNS).eq("id", id).is("deleted_at", null).maybeSingle();
    if (error) throw error;
    return data ? toDomain(data as PatientRow) : null;
  }

  async save(patient: Patient): Promise<Patient> {
    // Allowlist de colunas: owner_id e datas não vêm do cliente. O banco decide o Nº em cadastro novo.
    const { data, error } = await this.db().from("patients").upsert({
      id: patient.id,
      record_number: patient.number,
      photo: patient.photo,
      photo_thumb: patient.photoThumb,
      identification: patient.identification,
      anamnesis: patient.anamnesis,
    }).select("record_number, updated_at").single();
    if (error) throw error;
    return { ...patient, number: data.record_number, updatedAt: data.updated_at };
  }

  async delete(id: string): Promise<void> {
    // Um único DELETE, que o banco transforma em arquivamento do paciente e das consultas (tudo ou nada).
    await archiveRow(this.db(), "patients", id);
  }
}
