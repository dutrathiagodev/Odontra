import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";

export class InMemoryPatientRepository implements PatientRepository {
  constructor(private readonly items: Patient[] = []) {}

  async findAll(): Promise<Patient[]> {
    return this.items;
  }

  async findById(id: string): Promise<Patient | null> {
    return this.items.find((p) => p.id === id) ?? null;
  }
}
