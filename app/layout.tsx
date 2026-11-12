import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

// Grotesca editorial, com personalidade e boa leitura em telas pequenas.
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Aba curta e legível: "Agenda | Odontra". A home mostra só "Odontra".
  applicationName: "Odontra",
  description:
    "Painel para criar e acompanhar o prontuário odontológico dos seus pacientes, com odontograma interativo e geração de PDF.",
  applicationName: "Odontra",
  appleWebApp: { capable: true, title: "Odontra", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#071b3f",
  width: "device-width",
  initialScale: 1,
  // Ocupa a tela toda no iPhone com notch; as margens seguras ficam por conta do CSS (env(safe-area-inset-*)).
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${schibsted.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
