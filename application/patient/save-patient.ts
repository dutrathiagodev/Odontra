import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import { assertPatientWithinLimits } from "@/domain/record-limits";

export class SavePatient {
  constructor(private readonly patients: PatientRepository) {}

  async execute(patient: Patient): Promise<Patient> {
    // Confere antes de ir à rede, com as mesmas regras do banco, para a mensagem ser clara.
    assertPatientWithinLimits(patient);
    return this.patients.save({ ...patient, updatedAt: new Date().toISOString() });
  }
}
