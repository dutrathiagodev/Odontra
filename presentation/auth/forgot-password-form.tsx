"use client";

import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/infrastructure/supabase/browser-client";
import { authErrorMessage } from "./auth-errors";
import { AuthField, FormMessage, SubmitButton } from "./auth-field";
import { useAuthSubmit } from "./use-auth-submit";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { busy, error, setError, run } = useAuthSubmit();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return setError("Informe o e-mail da conta.");
    run(async () => {
      const { error: authError } = await getBrowserSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/confirm?next=/redefinir-senha`,
      });
      if (authError) return authErrorMessage(authError);
      setSent(true);
    });
  };

  if (sent) {
    return <FormMessage tone="success">Se houver uma conta com esse e-mail, você vai receber um link para criar uma nova senha. Confira também a caixa de spam.</FormMessage>;
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <AuthField label="E-mail da conta" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <SubmitButton busy={busy}>Enviar link</SubmitButton>
    </form>
  );
}
