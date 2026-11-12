import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";

export class GetPatient {
  constructor(private readonly patients: PatientRepository) {}

  execute(id: string): Promise<Patient | null> {
    return this.patients.findById(id);
  }
}
