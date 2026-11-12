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
    date: timestamp.slice(0, 10),
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
