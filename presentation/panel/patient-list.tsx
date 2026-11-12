"use client";

import { CalendarClock, ChevronRight, Search, Sparkles, Trash2, UserPlus, Users, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { deleteErrorMessage } from "../async/delete-error";
import { formatDate, formatRecordNumber } from "../format";
import { usePatients } from "../hooks/use-patients";
import { Avatar } from "../ui/avatar";
import { linkButtonClass } from "../ui/button";
import { useConfirm } from "../ui/confirm-dialog";
import { PageHeader } from "../ui/page-header";

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>
      <div>
        <p className="text-2xl font-extrabold leading-none text-navy-900">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function PatientList() {
  const { patients, error, retry, remove, loadDemo } = usePatients();
  const [actionError, setActionError] = useState("");
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!patients) return [];
    if (!q) return patients;
    const digits = q.replace(/\D/g, "");
    const onlyDigits = (v: string) => v.replace(/\D/g, "");
    return patients.filter(
      (p) =>
        p.identification.name.toLowerCase().includes(q) ||
        (digits.length > 0 && (onlyDigits(p.identification.cpf).includes(digits) || onlyDigits(p.identification.homePhone).includes(digits))),
    );
  }, [patients, query]);

  const stats = useMemo(() => {
    // Só calcula depois de carregar no navegador (evita data instável na pré-renderização).
    if (!patients) return { total: 0, newThisMonth: 0, updatedToday: 0 };
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    return {
      total: patients.length,
      newThisMonth: patients.filter((p) => p.createdAt.startsWith(month)).length,
      updatedToday: patients.filter((p) => p.updatedAt.startsWith(today)).length,
    };
  }, [patients]);

  const { confirm, dialog } = useConfirm();

  const confirmRemove = async (id: string, name: string) => {
    const ok = await confirm({
      title: `Excluir ${name || "este paciente"}?`,
      description: "A ficha, a foto e todo o histórico de consultas serão apagados. Essa ação não pode ser desfeita.",
      confirmLabel: "Excluir paciente",
    });
    if (!ok) return;
    setActionError("");
    setDeletingId(id);
    try {
      await remove(id);
    } catch (err) {
      setActionError(deleteErrorMessage(err, "o paciente"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {dialog}
      <PageHeader
        title="Pacientes"
        subtitle="Acompanhe prontuários, consultas e histórico de cada paciente."
        actions={
          <Link href="/painel/pacientes/novo" className={`${linkButtonClass()} hidden sm:inline-flex`}>
            <UserPlus className="h-4 w-4" /> Novo paciente
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={<Users className="h-5 w-5" />} label="Pacientes" value={patients ? stats.total : "–"} />
        <Stat icon={<UserRoundPlus className="h-5 w-5" />} label="Novos no mês" value={patients ? stats.newThisMonth : "–"} />
        <Stat icon={<CalendarClock className="h-5 w-5" />} label="Atualizados hoje" value={patients ? stats.updatedToday : "–"} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, CPF ou telefone"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-base outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </label>
        </div>

        {actionError && (
          <p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{actionError}</p>
        )}
        {patients === null ? (
          error ? (
            <div role="alert" className="p-10 text-center">
              <p className="font-bold text-navy-900">Não deu para carregar os pacientes.</p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <button type="button" onClick={retry} className={`${linkButtonClass("secondary")} mt-4`}>Tentar de novo</button>
            </div>
          ) : (
            <p className="p-10 text-center text-slate-400">Carregando…</p>
          )
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-bold text-navy-900">{patients.length === 0 ? "Nenhum paciente cadastrado" : "Nenhum resultado"}</p>
            <p className="mt-1 text-sm text-slate-500">{patients.length === 0 ? "Cadastre o primeiro paciente para iniciar o prontuário." : "Tente outro nome, CPF ou telefone."}</p>
            {patients.length === 0 && (
              <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Link href="/painel/pacientes/novo" className={linkButtonClass()}>
                  <UserPlus className="h-4 w-4" /> Cadastrar paciente
                </Link>
                <button
                  type="button"
                  disabled={loadingDemo}
                  onClick={async () => {
                    setLoadingDemo(true);
                    setActionError("");
                    try {
                      await loadDemo();
                    } catch {
                      setActionError("Não foi possível carregar os exemplos agora. Tente de novo.");
                    } finally {
                      setLoadingDemo(false);
                    }
                  }}
                  className={linkButtonClass("secondary")}
                >
                  <Sparkles className="h-4 w-4" /> {loadingDemo ? "Carregando…" : "Ver com pacientes de exemplo"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[2.2fr_0.8fr_1.2fr_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 md:grid">
              <span>Paciente</span>
              <span>Prontuário</span>
              <span>Telefone</span>
              <span>Atualizado</span>
              <span className="w-20" />
            </div>
            <ul className="divide-y divide-slate-100">
              {filtered.map((patient) => {
                const { name, homePhone } = patient.identification;
                return (
                  <li key={patient.id} className="group relative">
                    <Link href={`/painel/pacientes/${patient.id}`} className="grid items-center gap-x-4 gap-y-0.5 px-4 py-3.5 pr-14 transition hover:bg-brand-50/50 md:grid-cols-[2.2fr_0.8fr_1.2fr_1fr_auto] md:pr-4">
                      <span className="flex min-w-0 items-center gap-3">
                        <Avatar name={name} photo={patient.photo} size="h-11 w-11" />
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-navy-900">{name || "Sem nome"}</span>
                          <span className="block text-xs text-slate-500 md:hidden">Nº {formatRecordNumber(patient.number)} · {formatDate(patient.updatedAt)}</span>
                        </span>
                      </span>
                      <span className="hidden text-sm font-semibold text-brand-700 md:block">Nº {formatRecordNumber(patient.number)}</span>
                      <span className="hidden text-sm text-slate-600 md:block">{homePhone || "—"}</span>
                      <span className="hidden text-sm text-slate-600 md:block">{formatDate(patient.updatedAt)}</span>
                      <span className="hidden w-20 items-center justify-end text-slate-300 md:flex">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </Link>
                    <button
                      onClick={() => confirmRemove(patient.id, name)}
                      disabled={deletingId !== null}
                      aria-busy={deletingId === patient.id}
                      aria-label={`Excluir ${name}`}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 md:right-14"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
