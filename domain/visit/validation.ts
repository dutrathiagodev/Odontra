import { collapseSpaces, isIntInRange, nameIssue, parseIsoDate, type FieldIssue } from "../patient/validation";
import type { ClinicalExam, OralHealth, Visit } from "./visit";

/** Limites de tamanho da consulta (também viram `maxLength` nos campos). */
export const VISIT_LIMITS = {
  reason: 300,
  dentistName: 120,
  cro: 20,
  findings: 5000,
} as const;

export const ORAL_HEALTH_LIMITS: Partial<Record<keyof OralHealth, number>> = {
  gumBleedingWhen: 120,
  lastTreatment: 120,
  brushingPerDay: 2,
};

export const CLINICAL_EXAM_LIMITS: Partial<Record<keyof ClinicalExam, number>> = {
  tongue: 200,
  palate: 200,
  mouthFloor: 200,
  lips: 200,
};

/** CRO: número de 1 a 6 dígitos, com UF opcional (ex.: "12345", "CRO-SP 12345", "12345/SP"). */
export function isValidCro(value: string): boolean {
  return /^(CRO[\s-]*)?([A-Z]{2}[\s-]*)?\d{1,6}([\s/-]*[A-Z]{2})?$/i.test(value.trim());
}

/** Problemas da consulta, na ordem das abas (Consulta, Saúde bucal, Exame, Procedimentos). */
export function validateVisit(visit: Visit, today: string): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const add = (field: string, message: string) => issues.push({ field, message });
  const tooLong = (field: string, value: string, limit: number) => value.length > limit && add(field, `Máximo de ${limit} caracteres.`);

  if (!visit.date) add("date", "Informe a data da consulta.");
  else if (!parseIsoDate(visit.date)) add("date", "Data inválida.");
  else if (visit.date > today) add("date", "A data da consulta não pode ser no futuro.");
  else if (visit.date < "1900-01-01") add("date", "Confira o ano da consulta.");

  tooLong("reason", visit.reason, VISIT_LIMITS.reason);

  if (visit.dentist.name.trim()) {
    const issue = nameIssue(visit.dentist.name, "o nome");
    if (issue) add("dentist.name", issue);
  }
  tooLong("dentist.name", visit.dentist.name, VISIT_LIMITS.dentistName);
  if (visit.dentist.cro.trim() && !isValidCro(visit.dentist.cro)) add("dentist.cro", "CRO inválido. Ex.: 12345 ou CRO-SP 12345.");

  const oral = visit.oralHealth;
  if (oral.brushingPerDay.trim() && !isIntInRange(oral.brushingPerDay, 0, 10)) add("oralHealth.brushingPerDay", "Informe um número de 0 a 10.");
  for (const [key, limit] of Object.entries(ORAL_HEALTH_LIMITS)) tooLong(`oralHealth.${key}`, String(oral[key as keyof OralHealth]), limit);
  for (const [key, limit] of Object.entries(CLINICAL_EXAM_LIMITS)) tooLong(`clinicalExam.${key}`, String(visit.clinicalExam[key as keyof ClinicalExam]), limit);

  tooLong("findings", visit.findings, VISIT_LIMITS.findings);

  const seen = new Set<string>();
  return issues.filter((issue) => (seen.has(issue.field) ? false : (seen.add(issue.field), true)));
}

/** Tira espaços sobrando e apaga a resposta de "Quando?" se o sangramento virou "Não". */
export function normalizeVisit(visit: Visit): Visit {
  const trim = <T extends object>(value: T): T => {
    const out = { ...value } as Record<string, unknown>;
    for (const [key, v] of Object.entries(out)) if (typeof v === "string") out[key] = v.trim();
    return out as T;
  };
  const oralHealth = trim(visit.oralHealth);
  if (oralHealth.gumBleeding !== "yes") oralHealth.gumBleedingWhen = "";
  if (/^\d+$/.test(oralHealth.brushingPerDay)) oralHealth.brushingPerDay = String(Number(oralHealth.brushingPerDay));

  return {
    ...visit,
    reason: visit.reason.trim(),
    findings: visit.findings.trim(),
    dentist: { name: collapseSpaces(visit.dentist.name), cro: visit.dentist.cro.trim().toUpperCase() },
    oralHealth,
    clinicalExam: trim(visit.clinicalExam),
  };
}
