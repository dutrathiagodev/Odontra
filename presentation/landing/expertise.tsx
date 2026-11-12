/* eslint-disable @next/next/no-img-element */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EXPERTISE } from "./landing-content";
import { BigTooth, Sparkle } from "./illustrations";
import { ToothIcon } from "../ui/logo";

function Art({ kind }: { kind: (typeof EXPERTISE)[number]["art"] }) {
  if (kind === "odontogram") {
    return (
      <div className="grid grid-cols-8 gap-1.5 px-6">
        {Array.from({ length: 16 }, (_, i) => (
          <BigTooth key={i} tone={i % 5 === 2 ? "blue" : "light"} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (kind === "pdf") {
    return (
      <div className="relative h-36 w-28 rounded-lg bg-white p-3 shadow-xl">
        <div className="h-3 w-full rounded bg-brand-600" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="mt-2 h-2 rounded bg-slate-200" style={{ width: `${95 - i * 10}%` }} />
        ))}
        <span className="absolute -right-3 -top-3 rounded-full bg-brand-600 px-2 py-1 text-[10px] font-extrabold text-white">PDF</span>
      </div>
    );
  }
  return (
    <ol className="space-y-2 px-8">
      {[3, 2, 1].map((n) => (
        <li key={n} className="flex items-center gap-3 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold text-navy-900 shadow">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">{n}</span>
          Consulta {n}
        </li>
      ))}
    </ol>
  );
}

export function Expertise() {
  return (
    <section id="recursos" className="bg-navy-900 py-20 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.6fr]">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Sparkle className="h-4 w-4 text-brand-300" /> Nossos recursos
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Cuidado completo
            <br />
            para cada sorriso
          </h2>
          <p className="mt-4 max-w-xs text-white/70">Da ficha do paciente ao PDF final, tudo em um só lugar.</p>
          <Link href="/painel" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full border border-white/40 pl-6 pr-2 text-sm font-bold transition active:scale-95">
            Explorar o painel
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/50">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <ul className="grid gap-5 sm:grid-cols-3">
          {EXPERTISE.map((item, index) => {
            const highlighted = index === 1;
            return (
              <li key={item.title} className={highlighted ? "sm:-my-4" : ""}>
                <Link
                  href={item.href}
                  className={`group relative flex h-full min-h-80 flex-col justify-between overflow-hidden rounded-3xl p-5 ring-1 transition hover:-translate-y-1 ${
                    highlighted ? "bg-gradient-to-b from-brand-300 to-brand-500 ring-white/50 shadow-2xl shadow-brand-500/30" : "bg-gradient-to-b from-navy-700 to-navy-800 ring-white/10"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/25 ring-1 ring-white/60">
                      <ToothIcon className="h-5 w-5" />
                    </span>
                  )}
                  <div className="flex flex-1 items-center justify-center pt-8">
                    {item.image ? <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <Art kind={item.art} />}
                  </div>
                  <div className="relative mt-5 flex items-end justify-between gap-3 rounded-2xl bg-gradient-to-t from-navy-950/60 to-transparent p-1">
                    <div>
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="text-sm text-white/80">{item.text}</p>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-navy-900 transition group-hover:translate-x-1">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
