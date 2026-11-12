"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/infrastructure/supabase/browser-client";
import { authErrorMessage } from "./auth-errors";
import { AuthField, FormMessage, SubmitButton } from "./auth-field";
import { useCaptcha } from "./captcha";
import { PasswordChecklist } from "./password-checklist";
import { isPasswordValid } from "./password-policy";
import { useAuthSubmit } from "./use-auth-submit";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sentTo, setSentTo] = useState("");
  const { busy, error, setError, run } = useAuthSubmit();
  const captcha = useCaptcha();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError("Informe seu nome como aparece no prontuário.");
    if (!email.trim()) return setError("Informe seu e-mail.");
    if (!isPasswordValid(password)) return setError("A senha ainda não atende aos requisitos abaixo.");
    if (captcha.missing) return setError(captcha.missing);

    run(async () => {
      const { data, error: authError } = await getBrowserSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() }, captchaToken: captcha.token },
      });
      captcha.reset();
      if (authError) return authErrorMessage(authError);
      // Conta criada já com sessão: entra direto no painel.
      if (data.session) {
        // Boas-vindas por e-mail em segundo plano: não segura a entrada no painel.
        void fetch("/api/boas-vindas", { method: "POST" }).catch(() => undefined);
        router.replace("/painel");
        router.refresh();
        return;
      }
      // Projeto exigindo confirmação por e-mail: mesma resposta para e-mail novo ou já cadastrado.
      setSentTo(email.trim());
    });
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
      {captcha.field}
      <SubmitButton busy={busy}>Criar conta</SubmitButton>
    </form>
  );
}
