import type { Dentist } from "../visit/visit";

/** Perfil do dentista logado: vira o profissional padrão das consultas e do PDF. */
export interface Profile {
  fullName: string;
  cro: string;
}

export const EMPTY_PROFILE: Profile = { fullName: "", cro: "" };

export const PROFILE_LIMITS = { fullName: 160, cro: 40 } as const;

const UFS = new Set([
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
]);

/**
 * Lê o CRO em qualquer jeito comum de escrever ("CRO-SP 12345", "SP 12345", "12345/SP", "cro sp 12.345")
 * e devolve a UF e o número, ou `null` se não reconhecer.
 */
export function parseCro(raw: string): { uf: string; number: string } | null {
  const text = raw.trim().toUpperCase().replace(/^CRO\b/, "").replace(/\./g, "").trim();
  const ufFirst = /^[-\s/]*([A-Z]{2})[-\s/]*(\d{2,7})$/.exec(text);
  const numberFirst = /^(\d{2,7})[-\s/]*([A-Z]{2})$/.exec(text);
  const uf = ufFirst?.[1] ?? numberFirst?.[2];
  const number = ufFirst?.[2] ?? numberFirst?.[1];
  if (!uf || !number || !UFS.has(uf)) return null;
  return { uf, number };
}

/** Escreve o CRO no padrão "CRO-SP 12345". O que não for reconhecido fica como foi digitado. */
export function formatCro(raw: string): string {
  const parsed = parseCro(raw);
  return parsed ? `CRO-${parsed.uf} ${parsed.number}` : raw.trim();
}

/** Texto do CRO para documentos: sempre com o prefixo "CRO" uma vez só. Vazio quando não há CRO. */
export function croLabel(raw: string): string {
  const formatted = formatCro(raw);
  if (!formatted) return "";
  return /^CRO\b/i.test(formatted) ? formatted : `CRO ${formatted}`;
}

export type ProfileErrors = Partial<Record<keyof Profile, string>>;

/** Validação leve: CRO é opcional, mas quando preenchido precisa ter UF e número. */
export function validateProfile(profile: Profile): ProfileErrors {
  const errors: ProfileErrors = {};
  if (profile.fullName.trim().length > PROFILE_LIMITS.fullName) errors.fullName = "Nome muito longo.";
  const cro = profile.cro.trim();
  if (cro && !parseCro(cro)) errors.cro = "Use a UF e o número do conselho, como em CRO-SP 12345.";
  else if (cro.length > PROFILE_LIMITS.cro) errors.cro = "CRO muito longo.";
  return errors;
}

/** Perfil limpo para gravar: nome sem espaços sobrando e CRO no padrão. */
export function normalizeProfile(profile: Profile): Profile {
  return { fullName: profile.fullName.trim().replace(/\s+/g, " "), cro: formatCro(profile.cro) };
}

export function profileToDentist(profile: Profile): Dentist {
  return { name: profile.fullName, cro: profile.cro };
}

/**
 * Profissional que assina a consulta: o que foi preenchido na consulta;
 * o que faltar (nome ou CRO) vem do perfil, se o perfil for do mesmo profissional ou a consulta estiver sem nome.
 */
export function resolveDentist(dentist: Dentist | undefined, profile: Profile | null): Dentist {
  const name = dentist?.name.trim() ?? "";
  const cro = dentist?.cro.trim() ?? "";
  if (!profile) return { name, cro };
  if (!name) return { name: profile.fullName.trim(), cro: cro || profile.cro.trim() };
  const sameDentist = name.toLowerCase() === profile.fullName.trim().toLowerCase();
  return { name, cro: cro || (sameDentist ? profile.cro.trim() : "") };
}
