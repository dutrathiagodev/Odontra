import "server-only";
import nodemailer from "nodemailer";

interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

type Result = "sent" | "skipped" | "failed";

/**
 * Envio de e-mail transacional. Credenciais só no servidor (nunca NEXT_PUBLIC_).
 * Ordem: SMTP (ex.: Gmail com senha de app, funciona sem domínio próprio) → Resend → não envia e avisa no log.
 */
export async function sendEmail(email: Email): Promise<Result> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return sendViaSmtp(email);
  if (process.env.RESEND_API_KEY) return sendViaResend(email);
  console.warn("[email] sem SMTP_* nem RESEND_API_KEY: e-mail não enviado.");
  return "skipped";
}

function sender(): string {
  return process.env.EMAIL_FROM ?? `Odontra <${process.env.SMTP_USER ?? "onboarding@resend.dev"}>`;
}

async function sendViaSmtp(email: Email): Promise<Result> {
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  try {
    await transport.sendMail({ from: sender(), to: email.to, subject: email.subject, html: email.html, text: email.text });
    return "sent";
  } catch (error) {
    console.error("[email] falha no SMTP", (error as { code?: string }).code ?? "erro");
    return "failed";
  }
}

async function sendViaResend(email: Email): Promise<Result> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: sender(), to: [email.to], subject: email.subject, html: email.html, text: email.text }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!response?.ok) {
    console.error("[email] falha no Resend", response?.status);
    return "failed";
  }
  return "sent";
}
