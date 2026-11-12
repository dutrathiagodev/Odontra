"use client";

import { FileDown, Plus, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Patient } from "@/domain/patient/patient";
import type { Visit } from "@/domain/visit/visit";
import { deleteVisit, listVisits } from "@/infrastructure/container";
import { formatDate } from "../../format";
import { downloadRecordPdf, printRecordPdf } from "../../pdf/pdf-actions";
import { Button, linkButtonClass } from "../../ui/button";
import { useConfirm } from "../../ui/confirm-dialog";

export function VisitHistory({ patient }: { patient: Patient }) {
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    void listVisits.execute(patient.id).then((list) => {
      if (!cancelled) setVisits(list);
    });
    return () => {
      cancelled = true;
    };
  }, [patient.id, version]);

  const run = async (visit: Visit, action: (p: Patient, v: Visit) => Promise<void>) => {
    setBusyId(visit.id);
    try {
      await action(patient, visit);
    } finally {
      setBusyId(null);
    }
  };

  const { confirm, dialog } = useConfirm();

  const remove = async (visit: Visit) => {
    const ok = await confirm({
      title: `Excluir a consulta ${visit.sequence}?`,
      description: "O odontograma, as anotações e os procedimentos desta consulta serão apagados. As outras consultas do paciente continuam.",
      confirmLabel: "Excluir consulta",
    });
    if (!ok) return;
    await deleteVisit.execute(visit.id);
    refresh();
  };

  return (
    <div className="space-y-4">
      {dialog}
      <Link href={`/painel/pacientes/${patient.id}/consultas/nova`} className={`${linkButtonClass()} w-full`}>
        <Plus className="h-4 w-4" /> Nova consulta
      </Link>

      {visits === null ? (
        <p className="py-8 text-center text-slate-400">Carregando…</p>
      ) : visits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-center text-sm text-slate-500">
          Nenhuma consulta registrada. Crie a primeira para montar o odontograma e gerar o prontuário em PDF.
        </div>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-brand-100 pl-4">
          {visits.map((visit) => {
            const marked = Object.keys(visit.odontogram).length;
            const busy = busyId === visit.id;
            return (
              <li key={visit.id} className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <span className="absolute -left-[25px] top-5 h-3 w-3 rounded-full bg-brand-600 ring-4 ring-brand-100" />
                <Link href={`/painel/pacientes/${patient.id}/consultas/${visit.id}`} className="block">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    Consulta {visit.sequence} · {formatDate(visit.date)}
                  </p>
                  <p className="mt-0.5 font-bold text-navy-900">{visit.reason || "Sem motivo informado"}</p>
                  <p className="text-sm text-slate-500">
                    {visit.dentist.name || "Profissional não informado"} · {marked} {marked === 1 ? "dente registrado" : "dentes registrados"}
                  </p>
                  {visit.findings && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{visit.findings}</p>}
                </Link>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" disabled={busy} onClick={() => run(visit, downloadRecordPdf)} className="flex-1">
                    <FileDown className="h-4 w-4" /> PDF
                  </Button>
                  <Button variant="secondary" disabled={busy} onClick={() => run(visit, printRecordPdf)} className="flex-1">
                    <Printer className="h-4 w-4" /> Imprimir
                  </Button>
                  <Button variant="danger" onClick={() => remove(visit)} aria-label="Excluir consulta" className="px-3">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
