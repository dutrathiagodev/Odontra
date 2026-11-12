import type { NextConfig } from "next";

// A Content-Security-Policy é montada no proxy.ts, com um nonce novo a cada requisição.
// Aqui ficam os demais headers de segurança, que são iguais para todas as respostas.
const securityHeaders = [
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
