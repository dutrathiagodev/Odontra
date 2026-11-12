import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odontra — seu painel odontológico",
  description:
    "Painel para criar e acompanhar o prontuário odontológico dos seus pacientes, com odontograma interativo e geração de PDF.",
  applicationName: "Odontra",
  appleWebApp: { capable: true, title: "Odontra", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#071b3f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
