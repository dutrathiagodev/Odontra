import type { Patient } from "@/domain/patient/patient";
import type { Visit } from "@/domain/visit/visit";
import { formatDate, formatRecordNumber } from "../format";
import type { PaperRecordData } from "./paper-record-card";

/** Converte paciente + consulta para os campos da ficha de papel. */
export function toPaperRecord(patient: Patient, visit: Visit): PaperRecordData {
  const id = patient.identification;
  return {
    number: formatRecordNumber(patient.number),
    name: id.name,
    address: id.homeAddress,
    homePhone: id.homePhone,
    workAddress: id.workAddress,
    workPhone: id.workPhone,
    occupation: id.occupation,
    birthDate: formatDate(id.birthDate),
    nationality: id.nationality,
    maritalStatus: id.maritalStatus,
    referral: id.referral,
    startDate: formatDate(visit.date),
    notes: visit.findings,
    odontogram: visit.odontogram,
  };
}
