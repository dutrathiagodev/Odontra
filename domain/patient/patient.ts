export type YesNo = "yes" | "no" | "";

export const DISEASE_CATEGORIES = [
  "Metabólica", "Cardíaca", "Respiratória", "Vascular", "Neurológica",
  "Endócrina", "Dermatológica", "Gastrointestinal", "Visual",
  "Doença hereditária", "Diabetes", "Hipertensão", "Neoplasias", "Outras",
] as const;

export interface Identification {
  name: string;
  rg: string;
  issuingBody: string;
  cpf: string;
  birthplace: string;
  nationality: string;
  maritalStatus: string;
  birthDate: string;
  sex: "M" | "F" | "";
  occupation: string;
  homeAddress: string;
  homePhone: string;
  workAddress: string;
  workPhone: string;
  referral: string;
  insurance: string;
  insuranceNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface Anamnesis {
  chiefComplaint: string;
  usesMedication: YesNo;
  medication: string;
  bloodPressure: string;
  allergy: YesNo;
  allergyDetail: string;
  hasDisease: YesNo;
  diseaseCategories: string[];
  diseaseDetail: string;
  hadSurgery: YesNo;
  surgeryDetail: string;
  bleeding: "normal" | "excessive" | "";
  healing: "normal" | "complicated" | "";
  shortnessOfBreath: YesNo;
  shortnessFrequency: string;
  pregnant: YesNo;
  pregnancyWeeks: string;
  notes: string;
  familyHistory: string;
}

export interface Patient {
  id: string;
  /** Nº do prontuário. */
  number: number;
  createdAt: string;
  updatedAt: string;
  /** Foto do paciente (data URL JPEG reduzida). Vazio quando não há foto. */
  photo: string;
  identification: Identification;
  anamnesis: Anamnesis;
}
