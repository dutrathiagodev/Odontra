import Image from "next/image";
import Link from "next/link";

/** Ícone genérico de dente (usado em listas e botões). */
export function ToothIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" className={className} aria-hidden>
      <path d="M7 3.5c-2.5 0-4 2-4 4.5 0 2 .8 3.6 1.4 5.4.6 1.9.6 4.1 1.2 6 .4 1.2 1.6 1.6 2.3.6 1-1.3.9-3.6 2.1-3.6s1.1 2.3 2.1 3.6c.7 1 1.9.6 2.3-.6.6-1.9.6-4.1 1.2-6C19.2 11.6 20 10 20 8c0-2.5-1.5-4.5-4-4.5-1.5 0-2.3.7-4 .7S8.5 3.5 7 3.5Z" />
    </svg>
  );
}

export function Logo({ tone = "light", href = "/" }: { tone?: "light" | "dark"; href?: string }) {
  // Os arquivos da logo são brancos; no tom escuro eles são escurecidos por CSS.
  const filter = tone === "dark" ? "brightness-0" : "";
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="Odontra">
      <Image src="/logo-mark.png" alt="" width={292} height={293} className={`h-11 w-11 object-contain ${filter}`} priority />
      <Image src="/logo-wordmark.png" alt="Odontra" width={573} height={118} className={`h-[22px] w-auto object-contain ${filter}`} priority />
    </Link>
  );
}
