/**
 * CPF mascarado para listas e busca: mostra só os 6 dígitos do meio (***.456.789-**).
 * Mesmo formato da função private.mask_cpf do banco.
 */
export function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits === "") return "";
  if (digits.length !== 11) return "***";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

/**
 * A busca da lista bate com o CPF mascarado: pedaço dos dígitos visíveis, ou o CPF inteiro
 * (11 dígitos), comparando os 6 do meio.
 */
export function cpfMatches(masked: string, queryDigits: string): boolean {
  const visible = masked.replace(/\D/g, "");
  if (!visible || !queryDigits) return false;
  if (queryDigits.length === 11) return visible === queryDigits.slice(3, 9);
  return visible.includes(queryDigits);
}
