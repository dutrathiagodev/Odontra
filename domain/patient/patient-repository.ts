import type { Patient } from "./patient";

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  /** Grava e devolve o registro como ficou no banco (o Nº do prontuário é do banco). */
  save(patient: Patient): Promise<Patient>;
  /**
   * Exclui o paciente do app e, na mesma operação, as consultas dele.
   * No banco é exclusão lógica: o prontuário fica arquivado por 20 anos (Lei 13.787/2018).
   * Falha se o paciente não existir (ou não for do dentista).
   */
  delete(id: string): Promise<void>;
}
