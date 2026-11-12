import type { Visit } from "./visit";

export interface VisitRepository {
  findByPatient(patientId: string): Promise<Visit[]>;
  findById(id: string): Promise<Visit | null>;
  /** Grava e devolve a consulta como ficou no banco (o número da consulta é do banco). */
  save(visit: Visit): Promise<Visit>;
  /** Exclui uma consulta. Falha se ela não existir (ou não for do dentista). */
  delete(id: string): Promise<void>;
}
