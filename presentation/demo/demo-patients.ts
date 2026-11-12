import type { Patient } from "@/domain/patient/patient";
import { createBlankPatient } from "@/domain/patient/patient-factory";
import type { Odontogram } from "@/domain/tooth";
import type { Visit } from "@/domain/visit/visit";
import { createBlankVisit } from "@/domain/visit/visit-factory";
import { PROFILE_PHOTOS, profilePhotoUrl, shuffled } from "../profile-photos";

interface DemoSeed {
  photoIndex: number;
  cpf: string;
  phone: string;
  birthDate: string;
  alert?: Partial<Patient["anamnesis"]>;
  complaint: string;
  visits: { reason: string; findings: string; teeth: Odontogram }[];
}

const DENTIST = { name: "Dra. Denise Silva", cro: "SP 12345" };

const SEEDS: DemoSeed[] = [
  {
    photoIndex: 0, cpf: "123.456.789-00", phone: "(11) 98888-7777", birthDate: "1990-05-12",
    alert: { allergy: "yes", allergyDetail: "Dipirona" },
    complaint: "Dor ao mastigar do lado esquerdo há 3 dias.",
    visits: [
      { reason: "Avaliação inicial", findings: "Anamnese, exame clínico e odontograma inicial.", teeth: { "26": { condition: "caries", note: "Cárie profunda, face oclusal" }, "38": { condition: "missing", note: "" } } },
      { reason: "Restauração do 26", findings: "Anestesia infiltrativa, remoção de cárie e restauração em resina composta.", teeth: { "26": { condition: "restoration", note: "Resina composta" }, "38": { condition: "missing", note: "" } } },
    ],
  },
  {
    photoIndex: 4, cpf: "987.654.321-00", phone: "(21) 97777-1212", birthDate: "1985-11-03",
    alert: { usesMedication: "yes", medication: "Losartana", hasDisease: "yes", diseaseCategories: ["Hipertensão"] },
    complaint: "Sangramento na gengiva ao escovar.",
    visits: [{ reason: "Limpeza e avaliação periodontal", findings: "Profilaxia e orientação de higiene. Retorno em 6 meses.", teeth: { "46": { condition: "crown", note: "Coroa cerâmica antiga" }, "11": { condition: "implant", note: "Implante de 2022" } } }],
  },
  {
    photoIndex: 1, cpf: "321.654.987-00", phone: "(31) 96666-3434", birthDate: "1998-02-27",
    alert: { pregnant: "yes", pregnancyWeeks: "20" },
    complaint: "Sensibilidade ao frio.",
    visits: [{ reason: "Sensibilidade dentária", findings: "Aplicação de dessensibilizante. Acompanhar na gestação.", teeth: { "14": { condition: "caries", note: "Cárie incipiente" } } }],
  },
  {
    photoIndex: 5, cpf: "456.789.123-00", phone: "(41) 95555-5656", birthDate: "1979-08-19",
    complaint: "Dente quebrado.",
    visits: [{ reason: "Fratura dentária", findings: "Tratamento de canal iniciado no 36.", teeth: { "36": { condition: "endodontics", note: "Canal em andamento" }, "28": { condition: "extraction", note: "Indicada extração" } } }],
  },
];

async function fetchAsDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url; // sem rede/CORS: usa o endereço da foto direto
  }
}

export interface DemoData {
  patients: Patient[];
  visits: Visit[];
}

/** Monta pacientes fictícios com fotos de perfil sorteadas do Unsplash. */
export async function buildDemoData(startNumber: number): Promise<DemoData> {
  const photos = shuffled(PROFILE_PHOTOS);
  const patients: Patient[] = [];
  const visits: Visit[] = [];

  for (const [index, seed] of SEEDS.entries()) {
    const photo = photos[index % photos.length];
    const patient = createBlankPatient(startNumber + index);
    patient.photo = await fetchAsDataUrl(profilePhotoUrl(photo.id, 240));
    patient.identification = { ...patient.identification, name: photo.name, cpf: seed.cpf, homePhone: seed.phone, birthDate: seed.birthDate, sex: photo.sex, nationality: "Brasileira" };
    patient.anamnesis = { ...patient.anamnesis, chiefComplaint: seed.complaint, ...seed.alert };
    patients.push(patient);

    let previous: Odontogram = {};
    seed.visits.forEach((v, i) => {
      const visit = createBlankVisit({ patientId: patient.id, sequence: i + 1, dentist: DENTIST, odontogram: previous });
      visit.reason = v.reason;
      visit.findings = v.findings;
      visit.odontogram = v.teeth;
      previous = v.teeth;
      visits.push(visit);
    });
  }
  return { patients, visits };
}
