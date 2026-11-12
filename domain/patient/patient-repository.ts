import type { Patient } from "./patient";

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  save(patient: Patient): Promise<void>;
  delete(id: string): Promise<void>;
}
