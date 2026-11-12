import type { Anamnesis, Identification, Patient } from "./patient";

/**
 * Regras do formulário do paciente: máscaras, limites e validação.
 * Funções puras (sem React), para testar e reaproveitar fora da tela.
 */

/** Um problema num campo. `field` é o caminho no registro (ex.: "identification.cpf"). */
export interface FieldIssue {
  field: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Limites de tamanho (também viram `maxLength` nos campos)
// ---------------------------------------------------------------------------

export const IDENTIFICATION_LIMITS: Record<Exclude<keyof Identification, "sex">, number> = {
  name: 120,
  rg: 20,
  issuingBody: 20,
  cpf: 14,
  birthplace: 60,
  nationality: 40,
  maritalStatus: 30,
  birthDate: 10,
  occupation: 60,
  homeAddress: 200,
  homePhone: 15,
  workAddress: 200,
  workPhone: 15,
  referral: 80,
  insurance: 60,
  insuranceNumber: 30,
  emergencyContact: 120,
  emergencyPhone: 15,
};

type AnamnesisText = {
  [K in keyof Anamnesis]: Anamnesis[K] extends string ? (string extends Anamnesis[K] ? K : never) : never;
}[keyof Anamnesis];

export const ANAMNESIS_LIMITS: Record<AnamnesisText, number> = {
  chiefComplaint: 2000,
  medication: 300,
  bloodPressure: 7,
  allergyDetail: 300,
  diseaseDetail: 300,
  surgeryDetail: 300,
  shortnessFrequency: 100,
  pregnancyWeeks: 2,
  notes: 2000,
  familyHistory: 2000,
};

export const MAX_AGE = 120;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** Tira espaços nas pontas e junta espaços repetidos (bom para nomes). */
export const collapseSpaces = (value: string) => value.trim().replace(/\s+/g, " ");

// ---------------------------------------------------------------------------
// CPF
// ---------------------------------------------------------------------------

/** Máscara progressiva: 123.456.789-09 (aceita digitação parcial). */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** CPF com 11 dígitos e dígitos verificadores corretos. */
export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(9) === Number(d[9]) && digit(10) === Number(d[10]);
}

// ---------------------------------------------------------------------------
// Telefone (Brasil)
// ---------------------------------------------------------------------------

/** Tira o +55 quando a pessoa cola o número completo. */
function phoneDigits(value: string): string {
  let d = onlyDigits(value);
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  return d.slice(0, 11);
}

/** Máscara progressiva: (11) 98765-4321 para celular, (11) 3456-7890 para fixo. */
export function formatPhone(value: string): string {
  const d = phoneDigits(value);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = d.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** Fixo: DDD + 8 dígitos começando de 2 a 5. Celular: DDD + 9 + 8 dígitos. */
export function isValidPhone(value: string): boolean {
  const d = phoneDigits(value);
  if (!/^[1-9]{2}/.test(d)) return false;
  if (d.length === 11) return d[2] === "9";
  if (d.length === 10) return /[2-5]/.test(d[2]);
  return false;
}

// ---------------------------------------------------------------------------
// Datas
// ---------------------------------------------------------------------------

/** Lê AAAA-MM-DD sem fuso. `null` se a data não existe (ex.: 2025-02-30). */
export function parseIsoDate(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return { y, m, d };
}

/** AAAA-MM-DD no fuso local do aparelho. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Idade em anos completos na data `today` (AAAA-MM-DD). */
export function ageOn(birthDate: string, today: string): number | null {
  const b = parseIsoDate(birthDate);
  const t = parseIsoDate(today);
  if (!b || !t) return null;
  let age = t.y - b.y;
  if (t.m < b.m || (t.m === b.m && t.d < b.d)) age -= 1;
  return age;
}

/** Menor data de nascimento aceita (hoje menos 120 anos), para o `min` do campo. */
export function minBirthDate(today: string): string {
  const t = parseIsoDate(today);
  if (!t) return "";
  return `${t.y - MAX_AGE}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Pressão arterial e números
// ---------------------------------------------------------------------------

/**
 * Deixa só dígitos e uma barra, e põe a barra sozinha (o teclado numérico do iPhone não tem "/"):
 * "12080" vira "120/80" e "9060" vira "90/60" (sistólica começando com 1 ou 2 tem 3 dígitos).
 */
export function formatBloodPressure(value: string): string {
  const cleaned = value.replace(/[xX]/g, "/").replace(/[^\d/]/g, "");
  if (cleaned.includes("/")) {
    const [sys = "", ...restParts] = cleaned.split("/");
    return `${sys.slice(0, 3)}/${restParts.join("").slice(0, 3)}`;
  }
  const sysLength = /^[12]/.test(cleaned) ? 3 : 2;
  if (cleaned.length <= sysLength) return cleaned;
  return `${cleaned.slice(0, sysLength)}/${cleaned.slice(sysLength, sysLength + 3)}`;
}

/** Sistólica 60–260, diastólica 30–160 e sistólica maior que a diastólica. */
export function isValidBloodPressure(value: string): boolean {
  const match = /^(\d{2,3})\/(\d{2,3})$/.exec(value.trim());
  if (!match) return false;
  const sys = Number(match[1]);
  const dia = Number(match[2]);
  return sys >= 60 && sys <= 260 && dia >= 30 && dia <= 160 && sys > dia;
}

/** Só dígitos, com no máximo `max` caracteres. */
export const digitsOnly = (value: string, max: number) => onlyDigits(value).slice(0, max);

/** Inteiro entre `min` e `max` (texto vazio não passa). */
export function isIntInRange(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value.trim())) return false;
  const n = Number(value);
  return n >= min && n <= max;
}

// ---------------------------------------------------------------------------
// Nome e RG
// ---------------------------------------------------------------------------

/** Letras (com acento), espaço, apóstrofo, hífen e ponto. */
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}' .-]*$/u;

export function nameIssue(value: string, label = "o nome"): string | null {
  const name = collapseSpaces(value);
  if (!name) return `Informe ${label}.`;
  if (!NAME_PATTERN.test(name)) return "Use só letras, espaço, hífen ou apóstrofo.";
  if (name.replace(/[^\p{L}]/gu, "").length < 3) return "Mínimo de 3 letras.";
  return null;
}

/** RG muda de estado para estado: 5 a 14 letras/números, com pontos e traço opcionais. */
export function isValidRg(value: string): boolean {
  if (!/^[\dA-Za-z.\-/ ]+$/.test(value.trim())) return false;
  const core = value.replace(/[^\dA-Za-z]/g, "");
  return core.length >= 5 && core.length <= 14 && /\d/.test(core);
}

// ---------------------------------------------------------------------------
// Validação do paciente
// ---------------------------------------------------------------------------

function checkLengths<T extends object>(prefix: string, value: T, limits: Partial<Record<keyof T, number>>, issues: FieldIssue[]) {
  for (const key of Object.keys(limits) as (keyof T)[]) {
    const limit = limits[key];
    const v = value[key];
    if (typeof v === "string" && limit !== undefined && v.length > limit) {
      issues.push({ field: `${prefix}.${String(key)}`, message: `Máximo de ${limit} caracteres.` });
    }
  }
}

/** Ordem dos campos na tela: a lista de problemas segue essa ordem (o primeiro recebe o foco). */
export function validateIdentification(value: Identification, today: string): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const add = (key: keyof Identification, message: string) => issues.push({ field: `identification.${key}`, message });

  const name = nameIssue(value.name, "o nome completo");
  if (name) add("name", name);

  if (value.birthDate) {
    const age = ageOn(value.birthDate, today);
    if (age === null) add("birthDate", "Data inválida.");
    else if (value.birthDate > today) add("birthDate", "A data de nascimento não pode ser no futuro.");
    else if (age > MAX_AGE) add("birthDate", `Confira o ano: idade acima de ${MAX_AGE} anos.`);
  }

  if (value.cpf.trim() && !isValidCpf(value.cpf)) {
    add("cpf", onlyDigits(value.cpf).length === 11 ? "CPF inválido: confira os dígitos." : "O CPF tem 11 dígitos.");
  }
  if (value.rg.trim() && !isValidRg(value.rg)) add("rg", "RG deve ter de 5 a 14 letras ou números.");

  if (value.homePhone.trim() && !isValidPhone(value.homePhone)) add("homePhone", "Telefone inválido. Ex.: (11) 98765-4321.");
  if (value.workPhone.trim() && !isValidPhone(value.workPhone)) add("workPhone", "Telefone inválido. Ex.: (11) 3456-7890.");

  const hasContact = value.emergencyContact.trim() !== "";
  const hasPhone = value.emergencyPhone.trim() !== "";
  if (hasContact) {
    const contact = nameIssue(value.emergencyContact, "o nome do contato");
    if (contact) add("emergencyContact", contact);
  } else if (hasPhone) {
    add("emergencyContact", "Informe o nome de quem atende esse telefone.");
  }
  if (hasPhone && !isValidPhone(value.emergencyPhone)) add("emergencyPhone", "Telefone inválido. Ex.: (11) 98765-4321.");
  else if (hasContact && !hasPhone) add("emergencyPhone", "Informe o telefone do contato de emergência.");

  const { sex: _sex, ...texts } = value;
  void _sex;
  checkLengths("identification", texts, IDENTIFICATION_LIMITS, issues);
  return dedupe(issues);
}

export function validateAnamnesis(value: Anamnesis, sex: Identification["sex"] = ""): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const add = (key: keyof Anamnesis, message: string) => issues.push({ field: `anamnesis.${key}`, message });
  const filled = (s: string) => s.trim() !== "";

  if (value.usesMedication === "yes" && !filled(value.medication)) add("medication", "Informe qual medicação.");
  if (filled(value.bloodPressure) && !isValidBloodPressure(value.bloodPressure)) add("bloodPressure", "Use o formato 120/80.");
  if (value.allergy === "yes" && !filled(value.allergyDetail)) add("allergyDetail", "Informe a que tem alergia.");
  if (value.hasDisease === "yes" && value.diseaseCategories.length === 0 && !filled(value.diseaseDetail)) {
    add("diseaseDetail", "Marque o tipo ou especifique a doença.");
  }
  if (value.hadSurgery === "yes" && !filled(value.surgeryDetail)) add("surgeryDetail", "Informe qual cirurgia.");
  if (value.pregnant === "yes" && sex !== "M" && !isIntInRange(value.pregnancyWeeks, 1, 42)) {
    add("pregnancyWeeks", "Informe as semanas de gestação (1 a 42).");
  }

  checkLengths("anamnesis", value, ANAMNESIS_LIMITS, issues);
  return dedupe(issues);
}

/** Todos os problemas do paciente, na ordem da tela (Dados, depois Anamnese). */
export function validatePatient(patient: Patient, today: string): FieldIssue[] {
  return [...validateIdentification(patient.identification, today), ...validateAnamnesis(patient.anamnesis, patient.identification.sex)];
}

/** Um problema por campo (o primeiro, que é o mais importante). */
function dedupe(issues: FieldIssue[]): FieldIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => (seen.has(issue.field) ? false : (seen.add(issue.field), true)));
}

// ---------------------------------------------------------------------------
// Normalização antes de gravar
// ---------------------------------------------------------------------------

function trimAll<T extends object>(value: T): T {
  const out = { ...value } as Record<string, unknown>;
  for (const [key, v] of Object.entries(out)) if (typeof v === "string") out[key] = v.trim();
  return out as T;
}

/**
 * Deixa o registro limpo para gravar: tira espaços sobrando, padroniza CPF, telefones e pressão,
 * e apaga respostas de perguntas que deixaram de valer (ex.: "Qual medicação?" quando a resposta virou "Não").
 */
export function normalizePatient(patient: Patient): Patient {
  const id = trimAll(patient.identification);
  id.name = collapseSpaces(id.name);
  id.emergencyContact = collapseSpaces(id.emergencyContact);
  if (isValidCpf(id.cpf)) id.cpf = formatCpf(id.cpf);
  for (const key of ["homePhone", "workPhone", "emergencyPhone"] as const) {
    if (isValidPhone(id[key])) id[key] = formatPhone(id[key]);
  }

  const an = trimAll(patient.anamnesis);
  if (an.usesMedication !== "yes") an.medication = "";
  if (an.allergy !== "yes") an.allergyDetail = "";
  if (an.hasDisease !== "yes") {
    an.diseaseCategories = [];
    an.diseaseDetail = "";
  }
  if (an.hadSurgery !== "yes") an.surgeryDetail = "";
  if (an.shortnessOfBreath !== "yes") an.shortnessFrequency = "";
  if (id.sex === "M") an.pregnant = "";
  if (an.pregnant !== "yes") an.pregnancyWeeks = "";
  if (/^\d+$/.test(an.pregnancyWeeks)) an.pregnancyWeeks = String(Number(an.pregnancyWeeks));

  return { ...patient, identification: id, anamnesis: an };
}
