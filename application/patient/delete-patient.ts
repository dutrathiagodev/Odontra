import type { PatientRepository } from "@/domain/patient/patient-repository";

/**
 * Remove o paciente numa única operação. As consultas saem junto, no próprio banco
 * (chave estrangeira com cascata), então não sobra histórico pela metade se a rede cair no meio.
 * Horários da agenda continuam, apenas sem o vínculo com o paciente.
 */
export class DeletePatient {
  constructor(private readonly patients: PatientRepository) {}

  execute(id: string): Promise<void> {
    return this.patients.delete(id);
  }
}
