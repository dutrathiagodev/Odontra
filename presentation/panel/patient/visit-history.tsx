"use client";

import { FileDown, Plus, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Patient } from "@/domain/patient/patient";
import type { Visit } from "@/domain/visit/visit";
import { deleteVisit, listVisits } from "@/infrastructure/container";
import { deleteErrorMessage } from "../../async/delete-error";
import { withTimeout } from "../../async/with-timeout";
import { formatDate } from "../../format";
import { useAsync } from "../../hooks/use-async";
import { downloadRecordPdf, printRecordPdf } from "../../pdf/pdf-actions";
import { Button, linkButtonClass } from "../../ui/button";
import { useConfirm } from "../../ui/confirm-dialog";

export function VisitHistory({ patient }: { patient: Patient }) {
  const { state, reload, retry } = useAsync(() => listVisits.execute(patient.id), [patient.id]);
  const visits = state.status === "ready" ? state.data : null;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const run = async (visit: Visit, action: (p: Patient, v: Visit) => Promise<void>) => {
    setBusyId(visit.id);
    setActionError("");
    try {
      await action(patient, visit);
    } catch {
      setActionError("Não foi possível gerar o PDF agora. Tente de novo.");
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
    setActionError("");
    setBusyId(visit.id);
    try {
      await withTimeout(deleteVisit.execute(visit.id));
    } catch (err) {
      setActionError(deleteErrorMessage(err, "a consulta"));
    } finally {
      setBusyId(null);
      // Recarrega mesmo na falha: o histórico mostra o que de fato ficou no banco.
      reload();
    }
  };

  return (
    <div className="space-y-4">
      {dialog}
      <Link href={`/painel/pacientes/${patient.id}/consultas/nova`} className={`${linkButtonClass()} w-full`}>
        <Plus className="h-4 w-4" /> Nova consulta
      </Link>

      {actionError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">{actionError}</p>}
      {state.status === "error" ? (
        <div role="alert" className="rounded-2xl bg-rose-50 p-5 text-center text-sm text-rose-800 ring-1 ring-rose-200">
          <p className="font-semibold">Não deu para carregar o histórico.</p>
          <p className="mt-1">{state.message}</p>
          <Button variant="secondary" onClick={retry} className="mt-3">Tentar de novo</Button>
        </div>
      ) : visits === null ? (
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
                  <Button variant="danger" disabled={busy} onClick={() => remove(visit)} aria-label="Excluir consulta" className="px-3">
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
