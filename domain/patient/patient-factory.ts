import type { Patient } from "./patient";

export function createBlankPatient(number: number, now = new Date()): Patient {
  const timestamp = now.toISOString();

  return {
    id: crypto.randomUUID(),
    number,
    createdAt: timestamp,
    updatedAt: timestamp,
    photo: "",
    identification: {
      name: "", rg: "", issuingBody: "", cpf: "", birthplace: "",
      nationality: "", maritalStatus: "", birthDate: "", sex: "",
      occupation: "", homeAddress: "", homePhone: "", workAddress: "",
      workPhone: "", referral: "", insurance: "", insuranceNumber: "",
      emergencyContact: "", emergencyPhone: "",
    },
    anamnesis: {
      chiefComplaint: "", usesMedication: "", medication: "",
      bloodPressure: "", allergy: "", allergyDetail: "", hasDisease: "",
      diseaseCategories: [], diseaseDetail: "", hadSurgery: "",
      surgeryDetail: "", bleeding: "", healing: "", shortnessOfBreath: "",
      shortnessFrequency: "", pregnant: "", pregnancyWeeks: "", notes: "",
      familyHistory: "",
    },
  };
}
