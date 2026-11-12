import { NextResponse, type NextRequest } from "next/server";
import { sendEmail } from "@/infrastructure/email/send-email";
import { welcomeEmail } from "@/infrastructure/email/welcome-email";
import { getServerSupabase } from "@/infrastructure/supabase/server-client";

const WINDOW_MS = 15 * 60_000;

/**
 * Boas-vindas logo após o cadastro. Só para a própria pessoa logada, uma vez, e só nos
 * primeiros 15 minutos da conta: não dá para usar a rota para mandar e-mail a terceiros.
 */
export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;
  if (error || !user?.email) return NextResponse.json({ status: "unauthorized" }, { status: 401 });

  const fresh = Date.now() - new Date(user.created_at).getTime() < WINDOW_MS;
  if (!fresh || user.user_metadata?.welcome_sent) return NextResponse.json({ status: "already" });

  // Marca antes de enviar: chamadas repetidas não duplicam o e-mail.
  await supabase.auth.updateUser({ data: { welcome_sent: true } });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const message = welcomeEmail({ name: String(user.user_metadata?.full_name ?? ""), siteUrl });
  const status = await sendEmail({ to: user.email, ...message });
  return NextResponse.json({ status });
}
