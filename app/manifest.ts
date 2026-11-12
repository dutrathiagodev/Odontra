import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/painel",
    name: "Odontra — painel odontológico",
    short_name: "Odontra",
    description: "Prontuário odontológico digital",
    start_url: "/painel",
    display: "standalone",
    background_color: "#f5f8fe",
    theme_color: "#071b3f",
    lang: "pt-BR",
    orientation: "any",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
