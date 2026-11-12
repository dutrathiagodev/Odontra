import { Bell, Camera, ClipboardList, FileDown, History, Printer, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ToothIcon } from "../ui/logo";
import { Reveal } from "./reveal";
import { ToothMascot } from "./tooth-mascot";

const INPUTS: { icon: LucideIcon | typeof ToothIcon; title: string; text: string }[] = [
  { icon: UserRound, title: "Dados do paciente", text: "identificação e contato" },
  { icon: ClipboardList, title: "Anamnese", text: "saúde geral e bucal" },
  { icon: ToothIcon, title: "Odontograma", text: "condição de cada dente" },
  { icon: Camera, title: "Foto", text: "direto da câmera" },
];

const OUTPUTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: FileDown, title: "Prontuário em PDF", text: "no padrão da ficha impressa" },
  { icon: Printer, title: "Impressão", text: "em um toque" },
  { icon: History, title: "Histórico", text: "consulta por consulta" },
  { icon: Bell, title: "Alertas de saúde", text: "alergia, gestação, medicação" },
];

function Item({ icon: Icon, title, text }: { icon: LucideIcon | typeof ToothIcon; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-[#9cc0ff]">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="block text-sm text-white/55">{text}</span>
      </span>
    </div>
  );
}

/** Linhas tracejadas que "correm" das entradas para o dente e do dente para as saídas. */
function Wires({ side }: { side: "in" | "out" }) {
  const ys = [12.5, 37.5, 62.5, 87.5];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hidden h-full w-full lg:block" aria-hidden>
      {ys.map((y) => (
        <path
          key={y}
          d={side === "in" ? `M0 ${y} C50 ${y} 50 50 100 50` : `M0 50 C50 50 50 ${y} 100 ${y}`}
          className="flow-wire"
          fill="none"
          stroke="#2357d9"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function FlowSection() {
  return (
    <section id="como-funciona" className="bg-[#06101f] py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-center text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">Você atende. O Odontra organiza o resto.</h2>
        </Reveal>

        <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.02] p-4 sm:p-8">
          <div className="grid items-center gap-6 md:grid-cols-2 lg:grid-cols-[1fr_120px_auto_120px_1fr] lg:gap-0">
            <div className="md:order-2 lg:order-none">
              <p className="mb-3 text-sm text-white/50">Do atendimento</p>
              <div className="space-y-3">{INPUTS.map((item) => <Item key={item.title} {...item} />)}</div>
            </div>
            <div className="hidden h-full lg:block"><Wires side="in" /></div>
            <div className="flex justify-center py-2 md:order-1 md:col-span-2 lg:order-none lg:col-span-1"><ToothMascot /></div>
            <div className="hidden h-full lg:block"><Wires side="out" /></div>
            <div className="md:order-3 lg:order-none">
              <p className="mb-3 text-sm text-white/50">Para o seu consultório</p>
              <div className="space-y-3">{OUTPUTS.map((item) => <Item key={item.title} {...item} />)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
