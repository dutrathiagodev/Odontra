"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/infrastructure/supabase/browser-client";
import { safeNextPath } from "@/infrastructure/supabase/safe-next";
import { authErrorMessage, isInvalidCredentials } from "./auth-errors";
import { AuthField, FormMessage, SubmitButton } from "./auth-field";
import { useCaptcha } from "./captcha";
import { formatCountdown } from "./login-throttle";
import { useAuthSubmit } from "./use-auth-submit";
import { useLoginThrottle } from "./use-login-throttle";

const LINK_EXPIRED = "O link expirou ou já foi usado. Entre com sua senha ou peça um novo link.";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { busy, error, setError, run } = useAuthSubmit(params.get("erro") === "link" ? LINK_EXPIRED : "");
  const captcha = useCaptcha();
  const throttle = useLoginThrottle();
  const locked = throttle.secondsLeft > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (locked) return;
    if (!email.trim() || !password) return setError("Informe e-mail e senha.");
    if (captcha.missing) return setError(captcha.missing);
    run(async () => {
      const { error: authError } = await getBrowserSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
        options: { captchaToken: captcha.token },
      });
      captcha.reset();
      if (authError) {
        if (isInvalidCredentials(authError)) {
          const wait = throttle.fail();
          if (wait > 0) return `E-mail ou senha incorretos. Por segurança, aguarde ${formatCountdown(wait)} para tentar de novo, ou use Esqueci minha senha.`;
        }
        return authErrorMessage(authError);
      }
      throttle.reset();
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
      {captcha.field}
      <SubmitButton busy={busy} disabled={locked}>
        {locked ? `Tente de novo em ${formatCountdown(throttle.secondsLeft)}` : "Entrar"}
      </SubmitButton>
      {locked && (
        <p className="text-center text-sm text-white/60" aria-live="polite">
          Muitas tentativas com senha errada. O botão volta a funcionar quando a contagem terminar.
        </p>
      )}
    </form>
  );
}
