import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";

export class ListPatients {
  constructor(private readonly patients: PatientRepository) {}

  async execute(): Promise<Patient[]> {
    const all = await this.patients.findAll();
    return [...all].sort((a, b) =>
      a.identification.name.localeCompare(b.identification.name, "pt-BR"),
    );
  }
}
