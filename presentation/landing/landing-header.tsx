import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "../ui/logo";

const LINKS = [
  { href: "#inicio", label: "Início", active: true },
  { href: "#recursos", label: "Recursos" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#servicos", label: "Painel" },
  { href: "#celular", label: "No celular" },
];

export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-9 text-sm font-semibold text-white/80 lg:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className={`pb-1 transition hover:text-white ${link.active ? "border-b-2 border-white text-white" : ""}`}>
              {link.label}
            </a>
          ))}
        </nav>
        <Link href="/painel" className="flex min-h-12 items-center gap-3 rounded-full bg-white py-1.5 pl-6 pr-1.5 text-sm font-bold text-navy-900 shadow-xl shadow-navy-950/30 transition active:scale-95">
          Acessar painel
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </header>
  );
}
