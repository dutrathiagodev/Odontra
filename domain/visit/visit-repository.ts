import type { Visit } from "./visit";

export interface VisitRepository {
  findByPatient(patientId: string): Promise<Visit[]>;
  findById(id: string): Promise<Visit | null>;
  save(visit: Visit): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByPatient(patientId: string): Promise<void>;
}
