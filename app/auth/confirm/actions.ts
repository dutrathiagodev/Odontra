"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/infrastructure/supabase/server-client";
import { parseConfirmLink } from "@/presentation/auth/confirm-link";

const FAILURE = "/entrar?erro=link";

/**
 * Valida o link do e-mail só quando a pessoa toca no botão (POST).
 * Antivírus e filtros de e-mail abrem o link (GET) antes dela; se a validação fosse no GET,
 * o token de uso único seria gasto pelo robô e a pessoa veria "link expirado".
 */
export async function confirmEmailLink(formData: FormData): Promise<void> {
  const link = parseConfirmLink({ get: (name) => formData.get(name)?.toString() ?? null });
  if (!link) redirect(FAILURE);

  let ok = false;
  try {
    const supabase = await getServerSupabase();
    const { error } =
      link.kind === "code"
        ? await supabase.auth.exchangeCodeForSession(link.code)
        : await supabase.auth.verifyOtp({ type: link.type, token_hash: link.tokenHash });
    ok = !error;
  } catch {
    ok = false;
  }

  // redirect() fora do try: ele interrompe a execução lançando um erro próprio do Next.
  redirect(ok ? link.next : FAILURE);
}
