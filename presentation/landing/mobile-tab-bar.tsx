"use client";

import { Home, LogIn, ScanSearch, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ITEMS = [
  { id: "inicio", href: "#inicio", label: "Início", icon: Home },
  { id: "como-funciona", href: "#como-funciona", label: "Como funciona", icon: Workflow },
  { id: "anatomia", href: "#anatomia", label: "Anatomia", icon: ScanSearch },
];

/** Barra de navegação inferior para iPhone, Android e iPad em pé (some no desktop). */
export function MobileTabBar() {
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const sections = ITEMS.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Navegação" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-4 rounded-2xl border border-white/10 bg-ink/90 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl lg:hidden">
      {ITEMS.map(({ id, href, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <a key={id} href={href} aria-current={selected ? "true" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors ${selected ? "bg-white/10 text-white" : "text-white/55"}`}>
            <Icon className="h-5 w-5" />
            {label}
          </a>
        );
      })}
      <Link href="/entrar" className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-white text-[11px] font-semibold text-ink">
        <LogIn className="h-5 w-5" />
        Entrar
      </Link>
    </nav>
  );
}
