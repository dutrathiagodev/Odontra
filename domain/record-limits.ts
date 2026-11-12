import { InvalidRecordError } from "./errors";
import type { Patient } from "./patient/patient";
import { isValidPhoto, isValidThumb } from "./patient/photo";
import type { Visit } from "./visit/visit";

/**
 * Limites de tamanho dos blocos JSON, iguais aos CHECK do banco (octet_length(coluna::text)).
 * Folgados para o uso normal; servem para barrar abuso e erro de programa.
 */
export const JSON_LIMITS = {
  identification: 16 * 1024,
  anamnesis: 32 * 1024,
  visitBlock: 64 * 1024,
} as const;

/** Tamanho em bytes do JSON como texto (UTF-8). */
export function jsonBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

const TOO_LONG = "Algum campo ficou longo demais para salvar. Encurte os textos maiores e tente de novo.";

export function assertPatientWithinLimits(patient: Patient): void {
  if (!isValidPhoto(patient.photo) || !isValidThumb(patient.photoThumb)) {
    throw new InvalidRecordError("A foto está num formato inválido ou grande demais. Remova a foto ou escolha outra e tente de novo.");
  }
  if (jsonBytes(patient.identification) > JSON_LIMITS.identification || jsonBytes(patient.anamnesis) > JSON_LIMITS.anamnesis) {
    throw new InvalidRecordError(TOO_LONG);
  }
}

export function assertVisitWithinLimits(visit: Visit): void {
  const blocks = [visit.dentist, visit.oralHealth, visit.clinicalExam, visit.odontogram];
  if (blocks.some((block) => jsonBytes(block) > JSON_LIMITS.visitBlock)) throw new InvalidRecordError(TOO_LONG);
}
