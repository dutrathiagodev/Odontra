/** Traduz erros do Supabase Auth para mensagens que dizem o que fazer. */
export function authErrorMessage(error: { message?: string; code?: string } | null): string {
  if (!error) return "";
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "captcha_failed" || message.includes("captcha")) return "A verificação de segurança falhou ou expirou. Refaça a verificação e tente de novo.";
  if (code === "invalid_credentials" || message.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (code === "user_already_exists" || code === "email_exists" || message.includes("already registered")) return "Já existe uma conta com esse e-mail. Entre com a senha ou use Esqueci minha senha.";
  if (code === "weak_password" || message.includes("password")) return "A senha precisa ter 12 caracteres ou mais, com letra minúscula, maiúscula e número.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || message.includes("rate limit")) return "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.";
  if (code === "same_password") return "A nova senha precisa ser diferente da atual.";
  return "Não foi possível concluir agora. Verifique a conexão e tente de novo.";
}

/** Senha errada (conta para a espera progressiva do login). */
export function isInvalidCredentials(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  return error.code === "invalid_credentials" || (error.message ?? "").toLowerCase().includes("invalid login credentials");
}
