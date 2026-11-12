import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Odontra — painel odontológico",
    short_name: "Odontra",
    description: "Prontuário odontológico digital",
    start_url: "/painel",
    display: "standalone",
    background_color: "#f5f8fe",
    theme_color: "#071b3f",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
