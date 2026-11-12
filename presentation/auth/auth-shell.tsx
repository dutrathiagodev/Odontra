import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Moldura das telas de acesso: marca à esquerda no desktop, formulário em foco no celular. */
export function AuthShell({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3" aria-label="Odontra, página inicial">
          <Image src="/logo-mark.png" alt="" width={292} height={293} className="h-11 w-11" priority />
          <Image src="/logo-wordmark.png" alt="Odontra" width={573} height={118} className="h-6 w-auto" priority />
        </Link>
        <div className="max-w-sm">
          <p className="text-3xl font-semibold leading-tight tracking-tight">Os prontuários dos seus pacientes, organizados e seguros.</p>
          <p className="mt-4 text-base leading-relaxed text-white/70">Cada conta enxerga só os próprios pacientes. Os dados ficam protegidos no banco e o acesso exige e-mail confirmado.</p>
        </div>
        <p className="text-sm text-white/50">Odontra, prontuário odontológico digital</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center lg:px-16">
        <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden" aria-label="Odontra, página inicial">
          <Image src="/logo-mark.png" alt="" width={292} height={293} className="h-9 w-9 brightness-0" priority />
          <Image src="/logo-wordmark.png" alt="Odontra" width={573} height={118} className="h-5 w-auto brightness-0" priority />
        </Link>
        <div className="w-full max-w-md">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
          {description && <p className="mt-2 text-base leading-relaxed text-muted">{description}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
