"use client";

import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/painel", label: "Pacientes", icon: Users, match: (p: string) => p === "/painel" || (p.startsWith("/painel/pacientes") && !p.endsWith("/pacientes/novo")) },
  { href: "/painel/pacientes/novo", label: "Novo paciente", icon: Plus, match: (p: string) => p.endsWith("/pacientes/novo") },
];

/** Barra lateral no desktop; barra inferior (alcance do polegar) no celular. */
export function PanelNav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "side") {
    return (
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} href={href} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${active ? "bg-white/10 text-white shadow-inner" : "text-brand-200/80 hover:bg-white/5 hover:text-white"}`}>
              <Icon className="h-[18px] w-[18px]" />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white/95 pt-2 backdrop-blur lg:hidden">
      {NAV.map(({ href, label, icon: Icon, match }) => (
        <Link key={href} href={href} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${match(pathname) ? "text-brand-700" : "text-slate-400"}`}>
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
