import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/presentation/auth/auth-shell";
import { SignInForm } from "@/presentation/auth/sign-in-form";

export const metadata = { title: "Entrar — Odontra" };

export default function SignInPage() {
  return (
    <AuthShell title="Bem-vindo de volta" description="Entre para abrir os prontuários dos seus pacientes." footer={<>Ainda não tem conta? <Link href="/cadastro" className="font-semibold text-white hover:underline">Criar conta</Link></>}>
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
