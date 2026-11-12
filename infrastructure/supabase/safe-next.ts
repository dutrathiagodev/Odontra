/**
 * Aceita só caminhos do próprio site no ?next= (evita open redirect).
 * Resolve contra uma origem fictícia: qualquer truque que troque a origem (//, /\, tab, espaço) é recusado.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/painel"): string {
  if (!next || !next.startsWith("/")) return fallback;
  try {
    const base = "http://odontra.local";
    const url = new URL(next, base);
    if (url.origin !== base) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
