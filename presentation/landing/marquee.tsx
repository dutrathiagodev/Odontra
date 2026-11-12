import { Sparkle } from "./illustrations";

const ITEMS = ["Odontograma interativo", "Anamnese completa", "Histórico de consultas", "Foto do paciente", "PDF e impressão", "Alertas de saúde", "Feito para o celular", "Anatomia do dente"];

/** Faixa de recursos em rolagem contínua (duplicada para o loop ficar sem emendas). */
export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-white/10 bg-navy-950 py-4" aria-hidden>
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap text-sm font-bold text-brand-100/80">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            {item}
            <Sparkle className="h-3 w-3 text-brand-400" />
          </span>
        ))}
      </div>
    </div>
  );
}
