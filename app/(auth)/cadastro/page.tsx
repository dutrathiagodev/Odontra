import Link from "next/link";
import { AuthShell } from "@/presentation/auth/auth-shell";
import { SignUpForm } from "@/presentation/auth/sign-up-form";

export const metadata = { title: "Criar conta — Odontra" };

export default function SignUpPage() {
  return (
    <AuthShell mode="signup" title="Criar conta" description="Uma conta por dentista. Os pacientes que você cadastrar ficam visíveis só para você." footer={<>Já tem conta? <Link href="/entrar" className="font-semibold text-white hover:underline">Entrar</Link></>}>
      <SignUpForm />
    </AuthShell>
  );
}
