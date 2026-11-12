/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowRight, MousePointerClick, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Odontogram } from "@/domain/tooth";
import { OdontogramChart } from "../odontogram/odontogram-chart";
import { PROFILE_PHOTOS, profilePhotoUrl } from "../profile-photos";
import { CountUp } from "./count-up";
import { HeroArt, Sparkle } from "./illustrations";
import { Reveal } from "./reveal";
import { TiltCard } from "./tilt-card";

const INITIAL: Odontogram = {
  "16": { condition: "restoration", note: "" },
  "26": { condition: "caries", note: "Sensibilidade ao frio" },
  "36": { condition: "endodontics", note: "" },
  "46": { condition: "crown", note: "" },
  "11": { condition: "implant", note: "" },
  "38": { condition: "missing", note: "" },
  "28": { condition: "extraction", note: "" },
};

const STATS = [
  { to: 32, label: "dentes no odontograma" },
  { to: 8, label: "condições clínicas" },
  { to: 1, label: "toque para gerar o PDF" },
];

export function Hero() {
  const [teeth, setTeeth] = useState<Odontogram>(INITIAL);
  const patient = PROFILE_PHOTOS[0];

  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 text-white">
      <HeroArt />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-28 sm:px-8 sm:pt-36 lg:grid-cols-[1fr_1.05fr] lg:pb-28">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-brand-100 ring-1 ring-white/15 backdrop-blur">
              <Sparkle className="h-3.5 w-3.5 text-brand-300" /> Seu painel odontológico
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Prontuário
              <br />
              odontológico <span className="bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">digital</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-md text-lg leading-snug text-white/80">Cadastre pacientes, marque os dentes com um toque e gere o prontuário em PDF, direto do celular.</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/painel/pacientes/novo" className="inline-flex min-h-14 items-center justify-between gap-4 rounded-full border border-white/40 bg-white/10 pl-7 pr-2 text-base font-bold backdrop-blur transition hover:bg-white/20 active:scale-95">
                Criar prontuário
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy-900">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <a href="#tour" className="inline-flex min-h-14 items-center justify-center gap-3 text-base font-bold">
                <span className="relative grid h-12 w-12 place-items-center rounded-full border border-white/50">
                  <span className="animate-pulse-ring absolute inset-0 rounded-full border border-white/60" />
                  <Play className="h-4 w-4 fill-white" />
                </span>
                Ver como funciona
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-3">
                {PROFILE_PHOTOS.slice(0, 5).map((p, i) => (
                  <img key={p.id} src={profilePhotoUrl(p.id, 96)} alt={p.name} width={44} height={44} loading="lazy" className="h-11 w-11 rounded-full object-cover ring-2 ring-navy-900" style={{ zIndex: 5 - i }} />
                ))}
              </div>
              <p className="text-sm leading-tight text-white/80">
                <span className="block text-base font-bold text-white">Feito para o dia a dia</span>
                do consultório
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <TiltCard>
            <div className="relative rounded-[1.75rem] border border-white/40 bg-white/90 p-3 shadow-2xl shadow-navy-950/50 backdrop-blur-xl sm:p-5">
              <div className="mb-3 flex items-center gap-3">
                <img src={profilePhotoUrl(patient.id, 96)} alt={patient.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-100" />
                <div className="min-w-0 flex-1 text-navy-900">
                  <p className="truncate text-sm font-extrabold">{patient.name}</p>
                  <p className="text-xs font-semibold text-slate-500">Consulta 3 · exemplo</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">Odontograma</span>
              </div>
              <div className="text-navy-900">
                <OdontogramChart value={teeth} onChange={setTeeth} animated showList={false} />
              </div>
              <p className="pointer-events-none absolute -top-3 right-4 flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-brand-600/40">
                <MousePointerClick className="h-3.5 w-3.5" /> Toque num dente
              </p>
            </div>
          </TiltCard>
        </Reveal>
      </div>

      <Reveal className="relative mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <dl className="grid grid-cols-3 divide-x divide-white/15 rounded-3xl border border-white/20 bg-white/10 py-5 backdrop-blur-xl">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-3 text-center sm:px-8">
              <dt className="text-3xl font-extrabold sm:text-5xl">
                <CountUp to={stat.to} />
              </dt>
              <dd className="mt-1 text-[11px] leading-tight text-white/75 sm:text-sm">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
