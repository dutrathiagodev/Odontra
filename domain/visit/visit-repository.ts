import type { Visit } from "./visit";

export interface VisitRepository {
  findByPatient(patientId: string): Promise<Visit[]>;
  findById(id: string): Promise<Visit | null>;
  /** Grava e devolve a consulta como ficou no banco (o número da consulta é do banco). */
  save(visit: Visit): Promise<Visit>;
  delete(id: string): Promise<void>;
  deleteByPatient(patientId: string): Promise<void>;
}
