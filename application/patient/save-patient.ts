import type { Patient } from "@/domain/patient/patient";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import type { ThumbnailMaker } from "@/domain/patient/photo";
import { assertPatientWithinLimits } from "@/domain/record-limits";

const noThumbnail: ThumbnailMaker = async () => "";

export class SavePatient {
  constructor(
    private readonly patients: PatientRepository,
    private readonly makeThumbnail: ThumbnailMaker = noThumbnail,
  ) {}

  async execute(patient: Patient): Promise<Patient> {
    // A miniatura da lista sai sempre da foto atual (e some junto com ela).
    // Cadastros antigos sem miniatura ganham uma na próxima vez que forem salvos.
    const photoThumb = patient.photo ? await this.makeThumbnail(patient.photo) : "";
    const next = { ...patient, photoThumb, updatedAt: new Date().toISOString() };
    // Confere antes de ir à rede, com as mesmas regras do banco, para a mensagem ser clara.
    assertPatientWithinLimits(next);
    return this.patients.save(next);
  }
}
