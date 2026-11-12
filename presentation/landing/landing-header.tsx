"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../ui/logo";

const LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#tour", label: "Na prática" },
  { href: "#anatomia", label: "Anatomia" },
  { href: "#celular", label: "No celular" },
];

/** No celular a navegação fica na barra inferior; aqui só a marca e o acesso. */
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${scrolled ? "bg-[#06101f]/85 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">{link.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/entrar" className="hidden h-10 items-center rounded-lg px-4 text-sm font-semibold text-white/85 hover:text-white sm:flex">Entrar</Link>
          <Link href="/cadastro" className="flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-[#dfe7f3]">Criar conta</Link>
        </div>
      </div>
    </header>
  );
}
