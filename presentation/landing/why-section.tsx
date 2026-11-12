/* eslint-disable @next/next/no-img-element */
import { FileDown, Heart, ShieldCheck, Smile } from "lucide-react";
import type { Odontogram } from "@/domain/tooth";
import { OdontogramChart } from "../odontogram/odontogram-chart";
import { ToothIcon } from "../ui/logo";
import { Sparkle } from "./illustrations";
import { WHY } from "./landing-content";

const ICONS = { tooth: ToothIcon, heart: Heart, shield: ShieldCheck };

const SAMPLE: Odontogram = {
  "16": { condition: "restoration", note: "" },
  "26": { condition: "caries", note: "Sensibilidade ao frio" },
  "36": { condition: "endodontics", note: "" },
  "46": { condition: "crown", note: "" },
  "11": { condition: "implant", note: "" },
  "38": { condition: "missing", note: "" },
  "28": { condition: "extraction", note: "" },
};

export function WhySection() {
  return (
    <section id="diferenciais" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            <Sparkle className="h-4 w-4 text-brand-600" /> Por que o Odontra
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-5xl">
            Seu consultório,
            <br />
            <span className="text-brand-500">sem papel</span>
          </h2>
          <p className="mt-5 max-w-md text-slate-600">Reunimos tecnologia e praticidade para você registrar o atendimento com rapidez e entregar um prontuário impecável.</p>

          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {WHY.items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <li key={item.title}>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-100/70 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3 font-bold text-navy-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-100 via-brand-50 to-white p-4 ring-1 ring-brand-100 sm:p-8">
            {WHY.image ? (
              <img src={WHY.image} alt="" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <div className="mx-auto max-w-lg rounded-3xl bg-white p-4 shadow-2xl shadow-brand-600/20">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-extrabold text-navy-900">Odontograma</p>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">Exemplo</span>
                </div>
                <OdontogramChart value={SAMPLE} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-5 right-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 sm:right-8">
            <div>
              <p className="text-xs font-semibold text-slate-500">Prontuário</p>
              <p className="flex items-center gap-1.5 text-lg font-extrabold text-navy-900">
                <FileDown className="h-5 w-5 text-brand-600" /> PDF em 1 toque
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-600">
              <Smile className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
