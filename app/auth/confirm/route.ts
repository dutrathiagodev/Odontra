import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/infrastructure/supabase/safe-next";
import { getServerSupabase } from "@/infrastructure/supabase/server-client";

const ALLOWED_TYPES: EmailOtpType[] = ["email", "signup", "recovery", "email_change", "invite"];

/**
 * Destino dos links dos e-mails (confirmação e redefinição de senha). Aceita os dois formatos do Supabase:
 * - ?token_hash=…&type=…  (templates próprios do Odontra)
 * - ?code=…               (template padrão do Supabase, fluxo PKCE)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNextPath(params.get("next"));
  const failure = new URL("/entrar?erro=link", request.url);

  try {
    const supabase = await getServerSupabase();
    const code = params.get("code");
    const tokenHash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return NextResponse.redirect(failure);
    } else if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (error) return NextResponse.redirect(failure);
    } else {
      return NextResponse.redirect(failure);
    }
  } catch {
    return NextResponse.redirect(failure);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
