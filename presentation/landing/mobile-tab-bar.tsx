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
    <nav aria-label="Navegação" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-2 lg:hidden">
      {/* Abas numa pílula de vidro, como a barra do iOS 26. */}
      <div className="grid flex-1 grid-cols-3 rounded-full bg-white/75 p-1 shadow-lg shadow-ink/10 ring-1 ring-black/5 backdrop-blur-xl">
        {ITEMS.map(({ id, href, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <a
              key={id}
              href={href}
              aria-current={selected ? "true" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10.5px] font-semibold transition-colors ${selected ? "bg-ink/[0.06] text-accent" : "text-ink/60"}`}
            >
              <Icon className="h-[19px] w-[19px]" strokeWidth={selected ? 2.4 : 2} />
              {label}
            </a>
          );
        })}
      </div>
      {/* Ação principal separada, em círculo, como o botão de busca do iOS. */}
      <Link
        href="/entrar"
        aria-label="Entrar"
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 ring-1 ring-white/30 active:scale-95"
      >
        <LogIn className="h-[22px] w-[22px]" />
      </Link>
    </nav>
  );
}
