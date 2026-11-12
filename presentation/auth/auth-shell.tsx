 
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AUTH_ART } from "./auth-art";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/#tour", label: "Como funciona" },
  { href: "/#anatomia", label: "Anatomia" },
];

/** Dente sem fundo girando em loop; parado para quem prefere menos movimento. */
function SpinningTooth({ className }: { className: string }) {
  return (
    <picture>
      <source srcSet={AUTH_ART.poster} media="(prefers-reduced-motion: reduce)" />
      <img src={AUTH_ART.tooth} alt="" width={390} height={440} decoding="async" fetchPriority="high" className={className} />
    </picture>
  );
}

function Art() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      {/* Brilho azul atrás do dente, sem caixa nem fundo. */}
      <div className="absolute h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <SpinningTooth className="relative h-auto w-[min(78%,360px)] drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]" />
      <div className="absolute inset-x-8 bottom-8 text-center">
        <p className="text-lg font-semibold leading-snug">Cada dente, do jeito que você examina.</p>
        <p className="mt-1 text-sm text-white/65">Odontograma, ficha e PDF no mesmo lugar.</p>
      </div>
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
        <div className="h-full w-full bg-[radial-gradient(60%_50%_at_25%_40%,rgba(35,87,217,0.35),transparent_70%)]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl overflow-hidden rounded-[28px] border border-white/15 bg-ink/90 text-white shadow-2xl shadow-black/50 sm:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
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
            {/* Mesmo tamanho e cor nas duas telas: só o sublinhado indica onde você está (sem pular de lugar). */}
            <Link href="/entrar" aria-current={mode === "signin" ? "page" : undefined} className={`border-b-2 pb-0.5 font-semibold transition-colors ${mode === "signin" ? "border-white text-white" : "border-transparent text-white/70 hover:text-white"}`}>Entrar</Link>
            <Link href="/cadastro" aria-current={mode === "signup" ? "page" : undefined} className="rounded-full bg-white px-4 py-1.5 font-semibold text-ink transition-colors hover:bg-[#dfe7f3]">Criar conta</Link>
          </div>
        </header>

        <div className="relative hidden lg:block">
          <Art />
        </div>

        <main className="relative flex items-center justify-center overflow-hidden px-5 pb-10 pt-4 sm:px-10 lg:py-10">
          {/* Celular: dente grande e translúcido ao fundo, logo em destaque. */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center lg:hidden" aria-hidden>
            <SpinningTooth className="absolute top-6 h-auto w-56 opacity-25 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
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
