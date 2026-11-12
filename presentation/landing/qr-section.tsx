"use client";

/* eslint-disable @next/next/no-img-element */
import { useSiteQrCode } from "../hooks/use-qr-code";

export function QrSection() {
  const { dataUrl, url } = useSiteQrCode(320);

  return (
    <section id="celular" className="bg-paper py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Aponte a câmera e abra o Odontra no celular.</h2>
          <p className="mt-3 max-w-lg text-slate-600">
            Leia o QR code para abrir o painel no seu celular. Depois, adicione à tela inicial e use como um aplicativo. O mesmo QR code vai no rodapé de cada PDF gerado.
          </p>
        </div>
        <div className="mx-auto w-fit rounded-3xl bg-gradient-to-br from-brand-50 to-white p-5 shadow-xl shadow-brand-600/10 ring-1 ring-brand-100">
          {dataUrl ? (
            <img src={dataUrl} alt="QR code para abrir o Odontra" className="h-56 w-56" />
          ) : (
            <div className="h-56 w-56 animate-pulse rounded-2xl bg-brand-50" />
          )}
          <p className="mt-2 max-w-56 break-all text-center text-xs font-semibold text-slate-500">{url}</p>
        </div>
      </div>
    </section>
  );
}
