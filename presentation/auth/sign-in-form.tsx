"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/infrastructure/supabase/browser-client";
import { safeNextPath } from "@/infrastructure/supabase/safe-next";
import { authErrorMessage } from "./auth-errors";
import { AuthField, FormMessage, SubmitButton } from "./auth-field";
import { useAuthSubmit } from "./use-auth-submit";

const LINK_EXPIRED = "O link expirou ou já foi usado. Entre com sua senha ou peça um novo link.";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { busy, error, setError, run } = useAuthSubmit(params.get("erro") === "link" ? LINK_EXPIRED : "");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return setError("Informe e-mail e senha.");
    run(async () => {
      const { error: authError } = await getBrowserSupabase().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) return authErrorMessage(authError);
      router.replace(safeNextPath(params.get("next")));
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <AuthField label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <div>
        <AuthField label="Senha" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        <Link href="/recuperar-senha" className="mt-2 block text-right text-sm text-white/70 hover:text-white">Esqueci minha senha</Link>
      </div>
      <SubmitButton busy={busy}>Entrar</SubmitButton>
    </form>
  );
}
