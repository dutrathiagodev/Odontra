import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/infrastructure/supabase/safe-next";
import { getServerSupabase } from "@/infrastructure/supabase/server-client";

const ALLOWED_TYPES: EmailOtpType[] = ["email", "signup", "recovery", "email_change", "invite"];

/** Destino dos links dos e-mails: valida o token (uso único) e abre a sessão. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = safeNextPath(params.get("next"));

  const failure = new URL("/entrar?erro=link", request.url);
  if (!tokenHash || !type || !ALLOWED_TYPES.includes(type)) return NextResponse.redirect(failure);

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(failure);

  return NextResponse.redirect(new URL(next, request.url));
}
