"use client";

import { Home, LogIn, ScanSearch, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ITEMS = [
  { id: "inicio", href: "#inicio", label: "Início", icon: Home },
  { id: "como-funciona", href: "#como-funciona", label: "Como funciona", icon: Workflow },
  { id: "anatomia", href: "#anatomia", label: "Anatomia", icon: ScanSearch },
];

const tabClass = "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10.5px] font-semibold transition-colors";

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
    <nav aria-label="Navegação" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden">
      {/* Uma pílula de vidro só, como a barra do iOS 26; "Entrar" é a última aba, em destaque discreto. */}
      <div className="grid grid-cols-4 rounded-full bg-white/80 p-1 shadow-lg shadow-ink/10 ring-1 ring-black/5 backdrop-blur-xl">
        {ITEMS.map(({ id, href, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <a key={id} href={href} aria-current={selected ? "true" : undefined} className={`${tabClass} ${selected ? "bg-ink/[0.06] text-accent" : "text-ink/60"}`}>
              <Icon className="h-[19px] w-[19px]" strokeWidth={selected ? 2.4 : 2} />
              {label}
            </a>
          );
        })}
        <Link href="/entrar" className={`${tabClass} text-accent`}>
          <LogIn className="h-[19px] w-[19px]" strokeWidth={2.4} />
          Entrar
        </Link>
      </div>
    </nav>
  );
}
