import { TOOTH_PATH } from "../odontogram/condition-style";

/** Dente grande em estilo de ilustração, usado quando não há foto. */
export function BigTooth({ className = "", tone = "light", style }: { className?: string; tone?: "light" | "blue"; style?: React.CSSProperties }) {
  const fill = tone === "light" ? "#ffffff" : "#dbeafe";
  return (
    <svg viewBox="0 0 24 40" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id={`tooth-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fill} />
          <stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>
      <path d={TOOTH_PATH} fill={`url(#tooth-${tone})`} stroke="#93c5fd" strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M8 8 C9 6 12 5.500 14 6.200" stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.9} />
    </svg>
  );
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
