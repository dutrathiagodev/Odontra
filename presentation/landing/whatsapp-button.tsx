"use client";

import { useEffect, useState } from "react";

const PHONE = "5543999737688";
const MESSAGE = "Olá! Vim pelo site do Odontra e tenho uma dúvida.";
const HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

/** Quando o balão aparece sozinho e por quanto tempo fica (celular). */
const PEEK_DELAY_MS = 3500;
const PEEK_DURATION_MS = 5000;

/**
 * Atalho para falar no WhatsApp: balão "Dúvida? Fale com a gente" + avatar com o dente do Odontra.
 * No computador o balão fica sempre visível. No celular ele aparece sozinho uns segundos depois de abrir
 * a página e some em seguida, para não cobrir o conteúdo.
 */
export function WhatsAppButton() {
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setPeek(true), PEEK_DELAY_MS);
    const hide = setTimeout(() => setPeek(false), PEEK_DELAY_MS + PEEK_DURATION_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tirar dúvidas pelo WhatsApp"
      className="group fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] right-3 z-40 flex items-center gap-3 lg:bottom-6 lg:right-6"
    >
      <span
        aria-hidden
        className={`rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-xl shadow-black/15 ring-1 ring-black/5 transition-all duration-500 ease-out motion-reduce:transition-none sm:pointer-events-auto sm:translate-x-0 sm:opacity-100 sm:group-hover:-translate-x-1 ${
          peek ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"
        }`}
      >
        Dúvida? Fale com a gente
      </span>
      {/* Avatar: o dente 3D do Odontra numa bolinha azul-escura, com o ponto verde de "online". */}
      <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#2a4a80,#0e2240_70%)] shadow-xl shadow-black/30 ring-2 ring-white/80 transition group-hover:scale-105 group-active:scale-95 sm:h-16 sm:w-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth/dente-poster.webp" alt="" width={387} height={440} className="h-11 w-auto drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)] sm:h-12" />
        <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
      </span>
    </a>
  );
}
