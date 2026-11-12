import { ToothAnatomy } from "../anatomy/tooth-anatomy";
import { Reveal } from "./reveal";

export function AnatomySection() {
  return (
    <section id="anatomia" className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1fr]">
        <Reveal>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-5xl">Mostre ao paciente o que acontece por dentro do dente.</h2>
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
