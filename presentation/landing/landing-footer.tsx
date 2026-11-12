import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "../ui/logo";
import { BigTooth } from "./illustrations";

export function LandingFooter() {
  return (
    <>
      <section className="bg-paper px-5 pb-16 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#06101f] px-6 py-12 text-white sm:px-14 sm:py-16">
          <BigTooth hatched className="pointer-events-none absolute -right-10 -top-10 h-80 rotate-12 opacity-30 sm:h-96" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">Seu próximo paciente já pode sair com o prontuário pronto.</h2>
            <p className="mt-3 text-white/65">Crie a conta, cadastre o paciente e gere o PDF ainda nesta consulta.</p>
            <Link href="/cadastro" className="mt-7 inline-flex h-14 items-center gap-2 rounded-xl bg-white px-7 font-semibold text-ink transition-colors hover:bg-[#dfe7f3]">
              Criar minha conta <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      <footer className="has-tab-bar bg-[#06101f]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-8 text-sm text-white/55 sm:flex-row sm:items-center sm:px-8">
          <Logo />
          <p className="max-w-md sm:text-right">Prontuário odontológico digital. Fotos de exemplo: Unsplash.</p>
        </div>
      </footer>
    </>
  );
}
