import { ToothAnatomy } from "../anatomy/tooth-anatomy";
import { Sparkle } from "./illustrations";
import { Reveal } from "./reveal";

export function AnatomySection() {
  return (
    <section id="anatomia" className="bg-gradient-to-b from-white to-brand-50 py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1fr]">
        <Reveal>
          <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            <Sparkle className="h-4 w-4 text-brand-600" /> Explore o dente
          </p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-5xl">
            Mostre ao paciente o que está <span className="text-brand-500">por dentro</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-600">Toque em cada parte do dente para ver o nome e a explicação, ligue e desligue camadas e revele o interior. Um apoio visual para explicar o tratamento com clareza.</p>
          <ul className="mt-6 grid gap-2 text-sm font-semibold text-navy-900 sm:grid-cols-2">
            {["Esmalte, dentina e polpa", "Cemento e ligamento", "Gengiva e osso alveolar", "Nervo e vasos"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-[10px] text-brand-700">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <ToothAnatomy />
        </Reveal>
      </div>
    </section>
  );
}
