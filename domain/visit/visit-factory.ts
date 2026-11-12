import type { Odontogram } from "../tooth";
import type { Dentist, Visit } from "./visit";

interface BlankVisitParams {
  patientId: string;
  sequence: number;
  dentist?: Dentist;
  /** Parte do odontograma da consulta anterior, para dar continuidade ao histórico. */
  odontogram?: Odontogram;
  now?: Date;
}

/** AAAA-MM-DD no fuso local do aparelho. */
export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function createBlankVisit({
  patientId,
  sequence,
  dentist = { name: "", cro: "" },
  odontogram = {},
  now = new Date(),
}: BlankVisitParams): Visit {
  const timestamp = now.toISOString();

  return {
    id: crypto.randomUUID(),
    patientId,
    sequence,
    date: localDate(now),
    createdAt: timestamp,
    updatedAt: timestamp,
    dentist,
    reason: "",
    oralHealth: {
      anesthesiaReaction: "", gumBleeding: "", gumBleedingWhen: "",
      bruxism: "", lastTreatment: "", brushingPerDay: "", toothOrGumPain: "",
      badTaste: "", jawOrEarPain: "", smoker: "", flosses: "",
    },
    clinicalExam: {
      hygiene: "", halitosis: "", tartar: "", gingiva: "", mucosa: "",
      tongue: "", palate: "", mouthFloor: "", lips: "",
    },
    odontogram: structuredClone(odontogram),
    findings: "",
  };
}
