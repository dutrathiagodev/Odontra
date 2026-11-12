import type { YesNo } from "../patient/patient";
import type { Odontogram } from "../tooth";

export interface Dentist {
  name: string;
  cro: string;
}

export interface OralHealth {
  anesthesiaReaction: YesNo;
  gumBleeding: YesNo;
  gumBleedingWhen: string;
  bruxism: YesNo;
  lastTreatment: string;
  brushingPerDay: string;
  toothOrGumPain: YesNo;
  badTaste: YesNo;
  jawOrEarPain: YesNo;
  smoker: YesNo;
  flosses: YesNo;
}

export interface ClinicalExam {
  hygiene: "normal" | "regular" | "bad" | "";
  halitosis: "absent" | "moderate" | "strong" | "";
  tartar: "absent" | "little" | "much" | "";
  gingiva: "normal" | "gingivitis" | "periodontitis" | "";
  mucosa: "normal" | "altered" | "";
  tongue: string;
  palate: string;
  mouthFloor: string;
  lips: string;
}

/** Uma consulta/atendimento do paciente: compõe o histórico. */
export interface Visit {
  id: string;
  patientId: string;
  /** Sequência da consulta dentro do paciente (1, 2, 3…). */
  sequence: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  dentist: Dentist;
  reason: string;
  oralHealth: OralHealth;
  clinicalExam: ClinicalExam;
  odontogram: Odontogram;
  /** Alterações / procedimentos realizados. */
  findings: string;
}
