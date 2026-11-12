"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/infrastructure/supabase/browser-client";
import { isSupabaseConfigured } from "@/infrastructure/supabase/env";

export function SignOutButton({ variant }: { variant: "side" | "header" }) {
  const router = useRouter();
  if (!isSupabaseConfigured) return null;

  const signOut = async () => {
    await getBrowserSupabase().auth.signOut();
    router.replace("/entrar");
    router.refresh();
  };

  return variant === "side" ? (
    <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-brand-200/80 transition-colors hover:bg-white/5 hover:text-white">
      <LogOut className="h-[18px] w-[18px]" /> Sair
    </button>
  ) : (
    <button type="button" onClick={signOut} aria-label="Sair" className="grid h-10 w-10 place-items-center rounded-lg text-white/80 hover:bg-white/10">
      <LogOut className="h-5 w-5" />
    </button>
  );
}
