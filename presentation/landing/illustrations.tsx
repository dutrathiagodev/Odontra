import { Molar } from "../ui/molar";

/** Dente ilustrado (molar em traço contínuo). Mantido como atalho para o componente Molar. */
export function BigTooth({ className = "", tone = "light", style, hatched = false }: { className?: string; tone?: "light" | "blue" | "ink"; style?: React.CSSProperties; hatched?: boolean }) {
  return <Molar className={className} tone={tone} style={style} hatched={hatched} />;
}
