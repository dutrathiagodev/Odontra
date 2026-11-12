import Link from "next/link";
import { AuthShell } from "@/presentation/auth/auth-shell";
import { ForgotPasswordForm } from "@/presentation/auth/forgot-password-form";

export const metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell mode="other" title="Recuperar senha" description="Informe o e-mail da conta e enviamos um link para criar uma nova senha." footer={<Link href="/entrar" className="font-semibold text-white hover:underline">Voltar para o login</Link>}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
