/** Mesma regra configurada no Supabase Auth: 12+ caracteres com minúscula, maiúscula e número. */
export const PASSWORD_RULES = [
  { id: "length", label: "12 caracteres ou mais", test: (p: string) => p.length >= 12 },
  { id: "lower", label: "Uma letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { id: "digit", label: "Um número", test: (p: string) => /\d/.test(p) },
] as const;

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
