import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ActionSubmitButton, FormMessage } from "@/presentation/auth/auth-field";
import { AuthShell } from "@/presentation/auth/auth-shell";
import { confirmLinkCopy, parseConfirmLink } from "@/presentation/auth/confirm-link";
import { confirmEmailLink } from "./actions";

export const metadata: Metadata = {
  title: "Confirmar acesso",
  // A URL carrega o token do e-mail: nunca indexar.
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

/**
 * Destino dos links dos e-mails (confirmação de cadastro, troca de e-mail e nova senha).
 * O GET só mostra a tela; o token é validado no POST do botão (ver actions.ts).
 */
async function ConfirmContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const link = parseConfirmLink({ get: (name) => first(params[name]) });

  if (!link) {
    return (
      <AuthShell mode="other" title="Link inválido" description="Este link está incompleto ou não é mais válido.">
        <div className="space-y-5">
          <FormMessage tone="error">Abra o link mais recente que enviamos por e-mail ou peça um novo.</FormMessage>
          <Link href="/entrar" className="grid h-12 w-full place-items-center rounded-lg bg-white text-base font-semibold text-ink hover:bg-[#dfe7f3]">Ir para o login</Link>
        </div>
      </AuthShell>
    );
  }

  const copy = confirmLinkCopy(link);
  return (
    <AuthShell mode="other" title={copy.title} description={copy.description}>
      <form action={confirmEmailLink} className="space-y-5">
        {link.kind === "code" ? (
          <input type="hidden" name="code" value={link.code} />
        ) : (
          <>
            <input type="hidden" name="token_hash" value={link.tokenHash} />
            <input type="hidden" name="type" value={link.type} />
          </>
        )}
        <input type="hidden" name="next" value={link.next} />
        <ActionSubmitButton>{copy.button}</ActionSubmitButton>
        <p className="text-center text-sm text-white/55">O link vale uma única vez. Se não foi você quem pediu, é só fechar esta página.</p>
      </form>
    </AuthShell>
  );
}

export default function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  return (
    <Suspense fallback={<AuthShell mode="other" title="Abrindo o link…">{null}</AuthShell>}>
      <ConfirmContent searchParams={searchParams} />
    </Suspense>
  );
}
