import "server-only";

interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Envio de e-mail transacional pelo Resend (API HTTP, sem dependência extra).
 * Chave só no servidor (RESEND_API_KEY, nunca NEXT_PUBLIC_). Sem chave, não envia e avisa no log.
 */
export async function sendEmail(email: Email): Promise<"sent" | "skipped" | "failed"> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Odontra <onboarding@resend.dev>";
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY ausente: e-mail não enviado.");
    return "skipped";
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email.to], subject: email.subject, html: email.html, text: email.text }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!response?.ok) {
    console.error("[email] falha no envio", response?.status);
    return "failed";
  }
  return "sent";
}
