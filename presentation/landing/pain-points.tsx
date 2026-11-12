import { ClinicPhoto } from "./clinic-photo";
import { Reveal } from "./reveal";

const PAINS = [
  { word: "Ficha perdida", title: "o papel some na hora errada", text: "Ficou na gaveta de outra sala, molhou ou simplesmente sumiu. E o histórico do paciente foi junto." },
  { word: "Letra ilegível", title: "a anotação que ninguém entende", text: "Três meses depois, nem você lembra o que escreveu sobre o dente 36." },
  { word: "Alergia esquecida", title: "o detalhe que não pode passar", text: "A alergia está na página 2, escrita a lápis. Na correria do atendimento, passa despercebida." },
  { word: "Histórico solto", title: "cada consulta numa folha", text: "Para saber o que já foi feito no paciente, você folheia um bloco inteiro." },
  { word: "Tempo perdido", title: "preenchendo em vez de atender", text: "Cabeçalho, dados, anamnese. Tudo à mão, de novo, a cada paciente novo." },
  { word: "Sem cópia", title: "um acidente apaga anos", text: "Infiltração, mudança de sala, uma caixa jogada fora. Papel não tem backup." },
];

export function PainPoints() {
  return (
    <section className="bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <Reveal>
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-5xl">Se o seu consultório ainda é de papel, você conhece esses problemas.</h2>
          </Reveal>
          <Reveal delay={120}>
            <figure className="overflow-hidden rounded-2xl border border-line bg-white">
              <ClinicPhoto photo="mirrorProbe" width={760} height={420} sizes="(min-width: 1024px) 380px, (min-width: 640px) 90vw, 100vw" className="aspect-[16/9] grayscale-[35%] lg:aspect-[19/12]" />
            </figure>
          </Reveal>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PAINS.map((pain, i) => (
            <li key={pain.word}>
              <Reveal delay={(i % 3) * 90} className="h-full">
                <article className="h-full rounded-2xl border border-line bg-white p-6 sm:p-7">
                  <p className="text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[#d93a3f]">{pain.word}</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{pain.title}</p>
                  <p className="mt-3 leading-relaxed text-muted">{pain.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
