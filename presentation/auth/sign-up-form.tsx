"use client";

import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/infrastructure/supabase/browser-client";
import { authErrorMessage } from "./auth-errors";
import { AuthField, FormMessage, SubmitButton } from "./auth-field";
import { PasswordChecklist } from "./password-checklist";
import { isPasswordValid } from "./password-policy";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) return setError("Informe seu nome como aparece no prontuário.");
    if (!isPasswordValid(password)) return setError("A senha ainda não atende aos requisitos abaixo.");

    setBusy(true);
    const { error: authError } = await getBrowserSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/painel`,
      },
    });
    setBusy(false);
    if (authError) return setError(authErrorMessage(authError));
    // Mesma resposta para e-mail novo ou já cadastrado: não revela quem tem conta.
    setSentTo(email.trim());
  };

  if (sentTo) {
    return (
      <FormMessage tone="success">
        Enviamos um link de confirmação para <strong>{sentTo}</strong>. Abra o e-mail e confirme para entrar no painel. O link vale por 1 hora.
      </FormMessage>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <AuthField label="Nome completo" value={name} onChange={setName} autoComplete="name" hint="Sai no cabeçalho dos prontuários em PDF." />
      <AuthField label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <div>
        <AuthField label="Senha" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <PasswordChecklist password={password} />
      </div>
      <SubmitButton busy={busy}>Criar conta</SubmitButton>
    </form>
  );
}
