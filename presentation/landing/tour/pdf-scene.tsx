"use client";

/* eslint-disable @next/next/no-img-element */
import { FileDown, Printer } from "lucide-react";
import { useSiteQrCode } from "../../hooks/use-qr-code";
import { BigTooth } from "../illustrations";

export function PdfScene() {
  const { dataUrl } = useSiteQrCode(120);

  return (
    <div className="grid items-center gap-5 text-navy-900 sm:grid-cols-[1fr_0.8fr]">
      <div className="animate-slide-up mx-auto w-full max-w-xs rounded-lg bg-white p-4 shadow-2xl shadow-navy-900/20 ring-1 ring-slate-200 [transform:perspective(900px)_rotateY(-8deg)_rotateX(3deg)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-extrabold">Dra. Denise Silva</p>
            <p className="text-[9px] text-slate-400">CRO SP 12345</p>
          </div>
          <p className="text-[9px] font-extrabold text-navy-800">PRONTUÁRIO ODONTOLÓGICO</p>
        </div>
        {["Identificação do Paciente", "Anamnese", "Odontograma"].map((title) => (
          <div key={title} className="mt-2.5">
            <div className="rounded bg-navy-800 px-2 py-0.5 text-[8px] font-bold text-white">{title}</div>
            {title === "Odontograma" ? (
              <div className="mt-1.5 grid grid-cols-8 gap-0.5">
                {Array.from({ length: 16 }, (_, i) => (
                  <BigTooth key={i} tone="ink" className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <div className="mt-1 space-y-1">
                <div className="h-1.5 w-full rounded bg-slate-100" />
                <div className="h-1.5 w-3/4 rounded bg-slate-100" />
              </div>
            )}
          </div>
        ))}
        <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-2">
          <p className="text-[8px] text-slate-400">Página 1/2</p>
          {dataUrl ? <img src={dataUrl} alt="QR code do Odontra" className="h-9 w-9" /> : <span className="h-9 w-9 rounded bg-slate-100" />}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-lg font-extrabold leading-tight">Pronto para guardar ou imprimir.</p>
        <p className="text-sm text-slate-600">Documento A4 no modelo clássico, com foto do paciente, odontograma colorido e QR code do sistema.</p>
        <span className="relative flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/30">
          <span className="animate-pulse-ring absolute inset-0 rounded-xl border-2 border-brand-400" />
          <FileDown className="h-4 w-4" /> Gerar PDF
        </span>
        <span className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold ring-1 ring-slate-200">
          <Printer className="h-4 w-4" /> Imprimir
        </span>
      </div>
    </div>
  );
}
