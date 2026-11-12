import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Cloudflare Turnstile (captcha do login): só entra na CSP quando a chave do site está configurada.
const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? " https://challenges.cloudflare.com" : "";

// CSP: só o próprio site, o Supabase do projeto, as fotos de exemplo do Unsplash e, com captcha ligado, o Turnstile.
// 'unsafe-inline' em script é exigido pelos scripts inline do Next sem nonce; 'unsafe-eval' só em dev.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}${turnstile}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseUrl} https://images.unsplash.com${turnstile}${isDev ? " ws: http://127.0.0.1:54321" : ""}`.trim(),
  `frame-src 'self' blob:${turnstile}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Esconde o indicador flutuante do Next em desenvolvimento.
  devIndicators: false,
  poweredByHeader: false,
  turbopack: {
    rules: {
      // Tailwind CSS v4 integrado ao Turbopack (sem PostCSS). Sem esta regra o CSS sai sem as classes.
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
