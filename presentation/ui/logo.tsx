import Link from "next/link";

/** Ícone genérico de dente (usado em listas e botões). */
export function ToothIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" className={className} aria-hidden>
      <path d="M7 3.5c-2.5 0-4 2-4 4.5 0 2 .8 3.6 1.4 5.4.6 1.9.6 4.1 1.2 6 .4 1.2 1.6 1.6 2.3.6 1-1.3.9-3.6 2.1-3.6s1.1 2.3 2.1 3.6c.7 1 1.9.6 2.3-.6.6-1.9.6-4.1 1.2-6C19.2 11.6 20 10 20 8c0-2.5-1.5-4.5-4-4.5-1.5 0-2.3.7-4 .7S8.5 3.5 7 3.5Z" />
    </svg>
  );
}

/**
 * Marca do Odontra: molar em traço contínuo com um "M" no centro.
 * Para usar o arquivo oficial da logo, troque o conteúdo deste componente por
 * <Image src="/logo.svg" ... /> (arquivo em `public/`).
 */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M32 14C19 14 13 25 15 40c1.500 11 6 20 8 33 1.200 8 7.500 11 10.500 3.500C36 70 37 61 41 57.500c3-2.600 15-2.600 18 0C63 61 64 70 66.500 76.500 69.500 84 75.800 81 77 73c2-13 6.500-22 8-33 2-15-4-26-17-26-8 0-12 5-18 5s-10-5-18-5Z" />
      <path d="M37 60V36l13 14 13-14v24" strokeWidth="5" />
    </svg>
  );
}

export function Logo({ tone = "light", href = "/" }: { tone?: "light" | "dark"; href?: string }) {
  const text = tone === "light" ? "text-white" : "text-navy-900";
  return (
    <Link href={href} className={`flex items-center gap-2.5 ${text}`} aria-label="Odontra">
      <LogoMark className="h-10 w-10" />
      <span className="text-2xl font-bold leading-none tracking-tight">Odontra</span>
    </Link>
  );
}
