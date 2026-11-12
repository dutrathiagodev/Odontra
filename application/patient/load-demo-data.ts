import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";

/**
 * Grava um conjunto de pacientes e consultas de demonstração.
 * Recebe os repositórios do modo exemplo (só na aba do navegador), nunca os do banco.
 */
export class LoadDemoData {
  constructor(
    private readonly patients: PatientRepository,
    private readonly visits: VisitRepository,
  ) {}

  async execute(data: { patients: Patient[]; visits: Visit[] }): Promise<void> {
    for (const patient of data.patients) await this.patients.save(patient);
    for (const visit of data.visits) await this.visits.save(visit);
  }
}
