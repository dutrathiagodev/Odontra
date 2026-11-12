import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";

export class SavePatient {
  constructor(private readonly patients: PatientRepository) {}

  async execute(patient: Patient): Promise<Patient> {
    return this.patients.save({ ...patient, updatedAt: new Date().toISOString() });
  }
}
