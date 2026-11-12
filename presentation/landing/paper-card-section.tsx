"use client";

import { useState } from "react";
import { TOOTH_CONDITION_LABELS, type Odontogram, type ToothCondition } from "@/domain/tooth";
import { PaperRecordCard, type PaperRecordData } from "../record-card/paper-record-card";
import { ClinicPhoto } from "./clinic-photo";
import { Reveal } from "./reveal";

const SAMPLE: PaperRecordData = {
  number: "0127",
  name: "Mariana Costa",
  address: "Rua das Acácias, 214 — Centro",
  homePhone: "(11) 3456-7788",
  workAddress: "Av. Paulista, 1000 — sala 82",
  workPhone: "(11) 3000-1200",
  occupation: "Arquiteta",
  birthDate: "14/03/1991",
  nationality: "Brasileira",
  maritalStatus: "Casada",
  referral: "Dr. Paulo Mendes",
  startDate: "12/11/2026",
  notes: "",
  odontogram: {
    "16": { condition: "restoration", note: "" },
    "26": { condition: "caries", note: "oclusal" },
    "11": { condition: "implant", note: "" },
    "36": { condition: "endodontics", note: "" },
    "48": { condition: "extraction", note: "" },
  },
};

/** Ciclo de condições ao tocar no dente da demonstração. */
const CYCLE: ToothCondition[] = ["healthy", "caries", "restoration", "crown", "endodontics", "implant", "missing", "extraction"];

/** A ficha de papel do consultório, na tela e interativa. */
export function PaperCardSection() {
  const [odontogram, setOdontogram] = useState<Odontogram>(SAMPLE.odontogram);
  const [last, setLast] = useState("");

  const toggle = (fdi: string) => {
    const current = odontogram[fdi]?.condition ?? "healthy";
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    setOdontogram((o) => ({ ...o, [fdi]: { condition: next, note: "" } }));
    setLast(`Dente ${fdi}: ${TOOTH_CONDITION_LABELS[next]}`);
  };

  return (
    <section id="ficha" className="bg-paper py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-5xl">A ficha que você já usa, agora no celular.</h2>
          <p className="mt-4 max-w-md text-slate-600">
            Mesmos campos, mesmo odontograma em vermelho, mesmo arco com radiografias. Só que preenchida em segundos, legível e guardada com segurança. Toque num dente para marcar.
          </p>
          <p aria-live="polite" className="mt-5 h-6 text-sm font-semibold text-accent">{last}</p>
          <figure className="mt-6 max-w-md overflow-hidden rounded-2xl border border-line bg-white">
            <ClinicPhoto photo="xrayReview" width={720} height={440} sizes="(min-width: 640px) 448px, 100vw" className="aspect-[18/11]" />
            <figcaption className="px-4 py-3 text-sm text-muted">As radiografias continuam no arco da ficha, ao lado do dente certo.</figcaption>
          </figure>
        </Reveal>
        <Reveal delay={120}>
          <div className="-rotate-[0.6deg] transition-transform duration-500 hover:rotate-0">
            <PaperRecordCard data={{ ...SAMPLE, odontogram }} onToothClick={toggle} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
