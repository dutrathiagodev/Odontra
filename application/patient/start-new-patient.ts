import type { Patient } from "@/domain/patient/patient";
import { createBlankPatient } from "@/domain/patient/patient-factory";
import type { PatientRepository } from "@/domain/patient/patient-repository";

export class StartNewPatient {
  constructor(private readonly patients: PatientRepository) {}

  async execute(): Promise<Patient> {
    const all = await this.patients.findAll();
    const lastNumber = all.reduce((max, p) => Math.max(max, p.number), 0);
    return createBlankPatient(lastNumber + 1);
  }
}
