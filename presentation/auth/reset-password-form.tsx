"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/infrastructure/supabase/browser-client";
import { authErrorMessage } from "./auth-errors";
import { AuthField, FormMessage, SubmitButton } from "./auth-field";
import { PasswordChecklist } from "./password-checklist";
import { isPasswordValid } from "./password-policy";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!isPasswordValid(password)) return setError("A senha ainda não atende aos requisitos abaixo.");
    if (password !== confirm) return setError("As duas senhas não são iguais.");

    setBusy(true);
    const supabase = getBrowserSupabase();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setBusy(false);
      return setError("O link de redefinição expirou. Peça um novo em Esqueci minha senha.");
    }
    const { error: authError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (authError) return setError(authErrorMessage(authError));
    // Encerra as outras sessões abertas com a senha antiga.
    await supabase.auth.signOut({ scope: "others" });
    router.replace("/painel");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <div>
        <AuthField label="Nova senha" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <PasswordChecklist password={password} />
      </div>
      <AuthField label="Repita a nova senha" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <SubmitButton busy={busy}>Salvar nova senha</SubmitButton>
    </form>
  );
}
