import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/presentation/auth/auth-shell";
import { SignInForm } from "@/presentation/auth/sign-in-form";

export const metadata = { title: "Entrar — Odontra" };

export default function SignInPage() {
  return (
    <AuthShell title="Entrar no Odontra" description="Acesse os prontuários dos seus pacientes." footer={<>Ainda não tem conta? <Link href="/cadastro" className="font-medium text-accent hover:underline">Criar conta</Link></>}>
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
