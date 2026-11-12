/** Aceita só caminhos internos no ?next= (evita open redirect para outro domínio). */
export function safeNextPath(next: string | null | undefined, fallback = "/painel"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
