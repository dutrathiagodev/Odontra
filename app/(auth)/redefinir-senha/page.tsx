import { AuthShell } from "@/presentation/auth/auth-shell";
import { ResetPasswordForm } from "@/presentation/auth/reset-password-form";

export const metadata = { title: "Nova senha — Odontra" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Criar nova senha" description="Depois de salvar, as outras sessões abertas com a senha antiga são encerradas.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
