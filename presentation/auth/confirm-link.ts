import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNextPath } from "@/infrastructure/supabase/safe-next";

export const ALLOWED_OTP_TYPES: readonly EmailOtpType[] = ["email", "signup", "recovery", "email_change", "invite"];

/** O que o link do e-mail trouxe, já validado. `null` quando o link não serve. */
export type ConfirmLink =
  | { kind: "otp"; tokenHash: string; type: EmailOtpType; next: string }
  | { kind: "code"; code: string; next: string };

type ParamSource = { get(name: string): string | null | undefined };

function clean(value: string | null | undefined): string {
  const text = (value ?? "").trim();
  // Token e código do Supabase são curtos; algo enorme ou com espaço não é um link legítimo.
  return text.length > 0 && text.length <= 512 && !/\s/.test(text) ? text : "";
}

/**
 * Lê os parâmetros do link (na URL ou no formulário). Aceita os dois formatos do Supabase:
 * - token_hash + type (templates próprios do Odontra)
 * - code (template padrão do Supabase, fluxo PKCE)
 * O `next` passa sempre por `safeNextPath` (evita open redirect).
 */
export function parseConfirmLink(params: ParamSource): ConfirmLink | null {
  const next = safeNextPath(params.get("next"));
  const code = clean(params.get("code"));
  if (code) return { kind: "code", code, next };

  const tokenHash = clean(params.get("token_hash"));
  const type = params.get("type") as EmailOtpType | null | undefined;
  if (tokenHash && type && ALLOWED_OTP_TYPES.includes(type)) return { kind: "otp", tokenHash, type, next };
  return null;
}

/** Textos da tela de confirmação conforme o tipo do link. */
export function confirmLinkCopy(link: ConfirmLink): { title: string; description: string; button: string } {
  const isRecovery = link.kind === "otp" ? link.type === "recovery" : link.next.startsWith("/redefinir-senha");
  if (isRecovery) {
    return {
      title: "Criar nova senha",
      description: "Toque no botão para confirmar que é você e escolher uma nova senha.",
      button: "Criar nova senha",
    };
  }
  if (link.kind === "otp" && link.type === "email_change") {
    return {
      title: "Confirmar novo e-mail",
      description: "Toque no botão para confirmar a troca do e-mail da sua conta.",
      button: "Confirmar e entrar",
    };
  }
  return {
    title: "Confirmar seu e-mail",
    description: "Falta só um passo: toque no botão para confirmar o e-mail e entrar no painel.",
    button: "Confirmar e entrar",
  };
}
