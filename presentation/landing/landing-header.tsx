"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../ui/logo";

const LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#tour", label: "Como funciona" },
  { href: "#anatomia", label: "Anatomia" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#celular", label: "No celular" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled || open ? "bg-navy-950/80 shadow-lg shadow-navy-950/30 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all sm:px-8 ${scrolled ? "h-16" : "h-20 sm:h-24"}`}>
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/80 lg:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="relative pb-1 transition hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-300 after:transition hover:after:scale-x-100">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/painel" className="hidden min-h-11 items-center gap-3 rounded-full bg-white py-1 pl-5 pr-1 text-sm font-bold text-navy-900 shadow-xl shadow-navy-950/30 transition active:scale-95 sm:flex">
            Acessar painel
            <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <button type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 active:scale-90 lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-slide-up border-t border-white/10 px-5 pb-6 pt-3 lg:hidden">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 text-base font-bold text-white/90 active:bg-white/10">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/painel" className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-base font-bold text-navy-900">
            Acessar painel <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      )}
    </header>
  );
}
