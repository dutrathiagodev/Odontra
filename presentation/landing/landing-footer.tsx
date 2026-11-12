import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "../ui/logo";
import { BigTooth, Sparkle } from "./illustrations";

export function LandingFooter() {
  return (
    <>
      <section className="bg-white px-5 pb-16 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-navy-900 via-navy-800 to-brand-600 px-8 py-12 text-white sm:px-14">
          <BigTooth className="absolute -right-4 -top-6 hidden h-72 rotate-12 opacity-90 drop-shadow-2xl md:block" />
          <Sparkle className="absolute right-64 top-10 hidden h-5 w-5 text-brand-200 md:block" />
          <div className="relative max-w-xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Sparkle className="h-4 w-4 text-brand-300" /> Comece agora
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Seu primeiro prontuário em poucos minutos</h2>
            <Link href="/painel/pacientes/novo" className="mt-7 inline-flex min-h-14 items-center gap-4 rounded-full bg-white pl-7 pr-2 font-bold text-navy-900 shadow-xl transition active:scale-95">
              Cadastrar paciente
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-900 text-white">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
      <footer className="bg-navy-950 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 text-sm text-brand-200/70 sm:flex-row sm:items-center sm:px-8">
          <Logo />
          <p className="max-w-md sm:text-right">Os dados ficam salvos apenas neste dispositivo. Fotos de exemplo: Unsplash.</p>
        </div>
      </footer>
    </>
  );
}
