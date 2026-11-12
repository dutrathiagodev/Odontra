import type { PatientRepository } from "@/domain/patient/patient-repository";

/**
 * Tira o paciente do app numa única operação. No banco é arquivamento (Lei 13.787/2018:
 * prontuário guardado por 20 anos): paciente e consultas são arquivados juntos, então não sobra
 * histórico pela metade se a rede cair no meio. Horários da agenda continuam, sem o vínculo.
 */
export class DeletePatient {
  constructor(private readonly patients: PatientRepository) {}

  execute(id: string): Promise<void> {
    return this.patients.delete(id);
  }
}
