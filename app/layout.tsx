import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

// Grotesca editorial, com personalidade e boa leitura em telas pequenas.
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Aba curta e legível: "Agenda | Odontra". A home mostra só "Odontra".
  title: { default: "Odontra", template: "%s | Odontra" },
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

/**
 * CSP com nonce (proxy.ts): o Next só coloca o nonce nos scripts quando gera o HTML com a requisição
 * em mãos. Uma página ou "casca estática" pré-gerada no build sairia com scripts sem nonce, que o
 * navegador bloquearia (a página nem hidrataria). Por isso o layout raiz espera a requisição antes de
 * renderizar: todas as rotas passam a ser geradas por requisição (ƒ no build), sem casca estática.
 * `instant = false` avisa o Cache Components que esse bloqueio é intencional.
 */
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="pt-BR" className={`${schibsted.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
