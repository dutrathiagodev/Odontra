import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BigTooth } from "./illustrations";
import { HeroDemo } from "./hero/hero-demo";

export function Hero() {
  return (
    <section id="inicio" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#06101f] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_80%_30%,rgba(35,87,217,0.28),transparent_70%)]" aria-hidden />
      <BigTooth hatched className="pointer-events-none absolute -left-24 bottom-[-6rem] -z-10 h-[32rem] -rotate-12 opacity-[0.06]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-28 pt-28 sm:px-8 sm:pt-36 lg:grid-cols-[1fr_1.05fr] lg:pb-28">
        <div className="hero-intro">
          <h1 className="text-[2.35rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            Você estudou para cuidar de sorrisos.
            <span className="mt-2 block text-[#9cc0ff]">Não para procurar ficha de papel.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
            O Odontra guarda a ficha, a anamnese e o odontograma de cada paciente no seu celular. <strong className="font-semibold text-white">O prontuário sai em PDF no padrão da ficha impressa, pronto para assinar.</strong>
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/cadastro" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-white px-7 text-base font-semibold text-ink transition-colors hover:bg-[#dfe7f3]">
              Criar minha conta <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#como-funciona" className="inline-flex h-14 items-center justify-center rounded-xl border border-white/25 px-7 text-base font-semibold text-white/90 transition-colors hover:bg-white/10">
              Ver como funciona
            </a>
          </div>
        </div>

        <div className="hero-demo">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}
