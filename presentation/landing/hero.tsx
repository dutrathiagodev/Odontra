/* eslint-disable @next/next/no-img-element */
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { HERO } from "./landing-content";
import { HeroArt, Sparkle } from "./illustrations";

const AVATARS = ["AM", "CR", "JS", "LP"];

export function Hero() {
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 text-white">
      {HERO.image ? <img src={HERO.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" /> : <HeroArt />}

      <div className="relative mx-auto grid min-h-[44rem] max-w-7xl items-center gap-10 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:pb-32">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <Sparkle className="h-4 w-4 text-brand-300" /> Cuidado digital, prontuário sem papel
          </p>
          <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            Prontuário
            <br />
            odontológico <span className="text-brand-300">digital</span>
          </h1>
          <p className="mt-6 max-w-sm text-lg leading-snug text-white/80">Seu painel odontológico para cada paciente, a cada consulta.</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/painel/pacientes/novo" className="inline-flex min-h-14 items-center gap-4 rounded-full border border-white/40 bg-navy-900/60 pl-7 pr-2 text-base font-bold backdrop-blur transition active:scale-95">
              Criar prontuário
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy-900">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
            <a href="#diferenciais" className="inline-flex min-h-14 items-center gap-3 text-base font-bold">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-white/50">
                <Play className="h-4 w-4 fill-white" />
              </span>
              Conhecer
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <div className="flex -space-x-3">
              {AVATARS.map((initials, i) => (
                <span key={initials} className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-xs font-extrabold ring-2 ring-navy-900" style={{ zIndex: AVATARS.length - i }}>
                  {initials}
                </span>
              ))}
            </div>
            <p className="text-sm leading-tight text-white/80">
              <span className="block text-base font-bold text-white">Feito para dentistas</span>
              no celular e no computador
            </p>
          </div>
        </div>

        <aside className="lg:justify-self-end">
          <div className="w-full max-w-xs rounded-3xl border border-white/25 bg-white/10 p-6 shadow-2xl shadow-navy-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-100/90 text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold leading-tight text-white/90">Prontuário completo e organizado</p>
            </div>
            <dl className="mt-5 divide-y divide-white/15">
              {HERO.stats.map((stat) => (
                <div key={stat.label} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-4xl font-extrabold">{stat.value}</dt>
                  <dd className="mt-0.5 text-sm text-white/75">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
