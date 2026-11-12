import { Molar } from "../ui/molar";

/** Dente ilustrado (molar em traço contínuo). Mantido como atalho para o componente Molar. */
export function BigTooth({ className = "", tone = "light", style, hatched = false }: { className?: string; tone?: "light" | "blue" | "ink"; style?: React.CSSProperties; hatched?: boolean }) {
  return <Molar className={className} tone={tone} style={style} hatched={hatched} />;
}

export function Sparkle({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0 L14.500 9.500 L24 12 L14.500 14.500 L12 24 L9.500 14.500 L0 12 L9.500 9.500 Z" />
    </svg>
  );
}

/** Fundo do hero: halos azuis e dentes flutuando. */
export function HeroArt() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="animate-float-slow absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-brand-500/35 blur-3xl" />
      <div className="animate-float-slow absolute bottom-[-10rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-brand-400/20 blur-3xl [animation-delay:-6s]" />
      <div className="absolute right-[6%] top-[14%] hidden h-[30rem] w-[30rem] rounded-full border border-white/10 lg:block" />
      <div className="absolute right-[10%] top-[20%] hidden h-[22rem] w-[22rem] rounded-full border border-white/10 lg:block" />
      <BigTooth style={{ "--r": "14deg" } as React.CSSProperties} className="animate-float-tooth absolute right-[8%] top-[14%] hidden h-72 drop-shadow-[0_30px_60px_rgba(59,130,246,0.55)] xl:block" />
      <BigTooth tone="blue" style={{ "--r": "-18deg", animationDelay: "-3s" } as React.CSSProperties} className="animate-float-tooth absolute left-[46%] top-[58%] hidden h-28 opacity-50 blur-[1px] xl:block" />
      <Sparkle className="absolute right-[30%] top-[18%] hidden h-6 w-6 text-brand-200/80 lg:block" />
    </div>
  );
}
