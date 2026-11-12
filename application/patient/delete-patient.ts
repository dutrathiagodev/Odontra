import type { PatientRepository } from "@/domain/patient/patient-repository";
import type { VisitRepository } from "@/domain/visit/visit-repository";

/** Remover o paciente remove também todo o seu histórico de consultas. */
export class DeletePatient {
  constructor(
    private readonly patients: PatientRepository,
    private readonly visits: VisitRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.visits.deleteByPatient(id);
    await this.patients.delete(id);
  }
}
