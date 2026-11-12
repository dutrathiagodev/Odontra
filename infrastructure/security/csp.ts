/**
 * Content Security Policy do Odontra, montada a cada requisição no proxy.ts com um nonce novo.
 *
 * - script-src: só scripts com o nonce da requisição. 'strict-dynamic' deixa esses scripts carregarem
 *   os chunks do Next (e o Turnstile) sem liberar 'unsafe-inline'. 'unsafe-eval' só em desenvolvimento
 *   (o React usa eval para mostrar a pilha de erros do servidor).
 * - style-src continua com 'unsafe-inline': atributos style="" (React, next/image) não aceitam nonce.
 */
export interface CspOptions {
  nonce: string;
  isDev: boolean;
  supabaseUrl: string;
  /** Captcha do login ligado (NEXT_PUBLIC_TURNSTILE_SITE_KEY configurada). */
  turnstile: boolean;
}

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

export function buildCsp({ nonce, isDev, supabaseUrl, turnstile }: CspOptions): string {
  const captcha = turnstile ? [TURNSTILE_ORIGIN] : [];
  const directives: [string, ...string[]][] = [
    ["default-src", "'self'"],
    ["script-src", "'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'wasm-unsafe-eval'", ...(isDev ? ["'unsafe-eval'"] : []), ...captcha],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", "'self'", "data:", "blob:", "https://images.unsplash.com"],
    ["font-src", "'self'", "data:"],
    ["connect-src", "'self'", ...(supabaseUrl ? [supabaseUrl] : []), "https://images.unsplash.com", ...captcha, ...(isDev ? ["ws:", "http://127.0.0.1:54321"] : [])],
    ["frame-src", "'self'", "blob:", ...captcha],
    ["worker-src", "'self'", "blob:"],
    ["frame-ancestors", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
    ["object-src", "'none'"],
  ];
  if (!isDev) directives.push(["upgrade-insecure-requests"]);
  return directives.map((parts) => parts.join(" ")).join("; ");
}

/** Nonce imprevisível de 128 bits em base64 (Web Crypto: funciona no runtime do proxy). */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
