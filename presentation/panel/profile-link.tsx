"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HREF = "/painel/perfil";

/** Acesso ao "Meu perfil": junto do "Sair" na barra lateral e no topo do celular (fora da barra inferior). */
export function ProfileLink({ variant }: { variant: "side" | "header" }) {
  const active = usePathname().startsWith(HREF);

  return variant === "side" ? (
    <Link href={HREF} aria-current={active ? "page" : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${active ? "bg-white/10 text-white" : "text-brand-200/80 hover:bg-white/5 hover:text-white"}`}>
      <UserRound className="h-[18px] w-[18px]" /> Meu perfil
    </Link>
  ) : (
    <Link href={HREF} aria-label="Meu perfil" aria-current={active ? "page" : undefined} className={`grid h-10 w-10 place-items-center rounded-lg ${active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"}`}>
      <UserRound className="h-5 w-5" />
    </Link>
  );
}
