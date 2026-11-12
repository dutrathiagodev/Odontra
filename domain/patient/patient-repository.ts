import type { Patient } from "./patient";

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  /** Grava e devolve o registro como ficou no banco (o Nº do prontuário é do banco). */
  save(patient: Patient): Promise<Patient>;
  delete(id: string): Promise<void>;
}
