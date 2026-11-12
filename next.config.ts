import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Esconde o indicador flutuante do Next em desenvolvimento.
  devIndicators: false,
  turbopack: {
    rules: {
      // Tailwind CSS v4 integrado ao Turbopack (sem PostCSS). Sem esta regra o CSS sai sem as classes.
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
