import { ArrowRight, Camera, ClipboardList, FileDown, History, Users } from "lucide-react";
import Link from "next/link";
import { ToothIcon } from "../ui/logo";
import { SERVICES } from "./landing-content";

const ICONS = { users: Users, clipboard: ClipboardList, tooth: ToothIcon, history: History, camera: Camera, pdf: FileDown };

export function Services() {
  return (
    <section id="servicos" className="bg-white pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-navy-900">Tudo no seu painel</h2>
          <Link href="/painel" className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            Abrir painel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICES.map(({ icon, label }) => {
            const Icon = ICONS[icon];
            return (
              <li key={label}>
                <Link href="/painel" className="flex h-full min-h-36 flex-col justify-between rounded-2xl bg-gradient-to-b from-brand-50 to-white p-4 ring-1 ring-brand-100 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-600/10">
                  <Icon className="h-9 w-9 text-navy-800" />
                  <span className="flex items-end justify-between gap-2">
                    <span className="text-sm font-bold leading-tight text-navy-900">{label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-900" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
