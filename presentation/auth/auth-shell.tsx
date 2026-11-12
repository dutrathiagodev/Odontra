/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BigTooth } from "../landing/illustrations";
import { AUTH_ART } from "./auth-art";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/#tour", label: "Como funciona" },
  { href: "/#anatomia", label: "Anatomia" },
];

function Art() {
  if (AUTH_ART.video) {
    return <video src={AUTH_ART.video} poster={AUTH_ART.image || undefined} autoPlay muted loop playsInline className="h-full w-full object-cover" />;
  }
  if (AUTH_ART.image) return <img src={AUTH_ART.image} alt="" className="h-full w-full object-cover" />;
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="absolute h-64 w-64 rounded-full bg-accent/35 blur-3xl" />
      <BigTooth hatched style={{ "--r": "-6deg" } as React.CSSProperties} className="animate-float-tooth relative h-72 drop-shadow-[0_20px_40px_rgba(35,87,217,0.45)] sm:h-96" />
    </div>
  );
}

/**
 * Telas de acesso no estilo da referência: cartão escuro sobre a arte desfocada,
 * menu no topo, arte à esquerda e formulário à direita.
 */
export function AuthShell({ title, description, children, footer, mode = "signin" }: { title: string; description?: string; children: ReactNode; footer?: ReactNode; mode?: "signin" | "signup" | "other" }) {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#06101f] px-3 py-3 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {AUTH_ART.image ? (
          <img src={AUTH_ART.image} alt="" className="h-full w-full scale-125 object-cover opacity-40 blur-2xl" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(60%_50%_at_25%_40%,rgba(35,87,217,0.35),transparent_70%)]" />
        )}
      </div>

      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl overflow-hidden rounded-[28px] border border-white/15 bg-ink/75 text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
        <header className="flex items-center justify-between px-5 pt-5 sm:px-10 sm:pt-8 lg:col-span-2">
          <Link href="/" className="hidden items-center gap-2.5 lg:flex" aria-label="Odontra, página inicial">
            <Image src="/logo-mark.png" alt="" width={292} height={293} className="h-9 w-9" priority />
            <Image src="/logo-wordmark.png" alt="Odontra" width={573} height={118} className="h-5 w-auto" priority />
          </Link>
          <span className="lg:hidden" />
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-white">{item.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/entrar" className={`pb-0.5 ${mode === "signin" ? "border-b-2 border-white font-semibold text-white" : "text-white/70 hover:text-white"}`}>Entrar</Link>
            <Link href="/cadastro" className={`rounded-full px-4 py-1.5 font-semibold ${mode === "signup" ? "bg-accent text-white" : "bg-white text-ink"}`}>Criar conta</Link>
          </div>
        </header>

        <div className="relative hidden lg:block">
          <Art />
        </div>

        <main className="relative flex items-center justify-center overflow-hidden px-5 pb-10 pt-4 sm:px-10 lg:py-10">
          {/* Celular: dente grande e translúcido ao fundo, logo em destaque. */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center lg:hidden" aria-hidden>
            {AUTH_ART.image ? (
              <img src={AUTH_ART.image} alt="" className="h-full w-full object-cover opacity-15" />
            ) : (
              <BigTooth hatched className="h-[30rem] -rotate-6 opacity-[0.12]" />
            )}
          </div>
          <div className="relative w-full max-w-sm">
            <Link href="/" className="mb-8 flex flex-col items-center gap-3 lg:hidden" aria-label="Odontra, página inicial">
              <Image src="/logo-mark.png" alt="" width={292} height={293} className="h-20 w-20" priority />
              <Image src="/logo-wordmark.png" alt="Odontra" width={573} height={118} className="h-8 w-auto" priority />
            </Link>
            <h1 className="text-center text-[1.9rem] font-semibold leading-tight tracking-tight">{title}</h1>
            {description && <p className="mt-2 text-center text-[0.95rem] leading-relaxed text-white/65">{description}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-white/65">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
