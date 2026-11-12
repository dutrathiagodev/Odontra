"use client";

import { ArrowLeft, FileDown, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Patient } from "@/domain/patient/patient";
import type { Visit } from "@/domain/visit/visit";
import { getPatient, getVisit, saveVisit, startNewVisit } from "@/infrastructure/container";
import { formatRecordNumber } from "../../format";
import { useLeaveGuard } from "../../hooks/use-leave-guard";
import { useRecordEditor } from "../../hooks/use-record-editor";
import { OdontogramChart } from "../../odontogram/odontogram-chart";
import { downloadRecordPdf, printRecordPdf } from "../../pdf/pdf-actions";
import { PaperRecordCard } from "../../record-card/paper-record-card";
import { toPaperRecord } from "../../record-card/to-paper-record";
import { Button } from "../../ui/button";
import { LoadState } from "../../ui/load-state";
import { SaveBar } from "../../ui/save-bar";
import { SectionCard } from "../../ui/section-card";
import { Tabs } from "../../ui/tabs";
import { HealthAlerts } from "../patient/health-alerts";
import { ClinicalExamSection, ConsultationSection, FindingsSection, OralHealthSection } from "./visit-sections";

type TabKey = "visit" | "oral" | "exam" | "teeth" | "findings" | "card";

const TABS = [
  { key: "visit" as const, label: "Consulta" },
  { key: "oral" as const, label: "Saúde bucal" },
  { key: "exam" as const, label: "Exame" },
  { key: "teeth" as const, label: "Odontograma" },
  { key: "findings" as const, label: "Procedimentos" },
  { key: "card" as const, label: "Ficha" },
];

/** O banco decide o número da consulta e as datas; o resto é o que está na tela. */
const mergeSaved = (current: Visit, saved: Visit): Visit => ({ ...current, id: saved.id, sequence: saved.sequence, updatedAt: saved.updatedAt });

interface Loaded {
  patient: Patient;
  visit: Visit;
}

/** Paciente + consulta; a consulta precisa ser deste paciente (não abre a de outro pelo endereço). */
async function loadVisit(patientId: string, visitId?: string): Promise<Loaded | null> {
  const patient = await getPatient.execute(patientId);
  if (!patient) return null;
  const visit = visitId ? await getVisit.execute(visitId) : await startNewVisit.execute(patientId);
  if (!visit || visit.patientId !== patientId) return null;
  return { patient, visit };
}

export function VisitEditor({ patientId, visitId }: { patientId: string; visitId?: string }) {
  const router = useRouter();
  const [persisted, setPersisted] = useState(Boolean(visitId));
  const [tab, setTab] = useState<TabKey>("visit");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const editor = useRecordEditor<Loaded>({
    load: () => loadVisit(patientId, visitId),
    persist: async ({ patient, visit }) => ({ patient, visit: await saveVisit.execute(visit) }),
    mergeSaved: (current, saved) => ({ ...current, visit: mergeSaved(current.visit, saved.visit) }),
    deps: [patientId, visitId],
  });
  const leaveDialog = useLeaveGuard(editor.dirty);

  if (editor.loadState !== "ready" || !editor.value) {
    return <LoadState state={editor.loadState === "ready" ? "loading" : editor.loadState} error={editor.loadError} missingText="Consulta não encontrada." onRetry={editor.retry} />;
  }

  const { patient, visit } = editor.value;
  const edit = (patch: Partial<Visit>) => editor.edit({ visit: { ...visit, ...patch } });

  const save = async () => {
    const saved = await editor.save();
    if (saved && !persisted) {
      setPersisted(true);
      router.replace(`/painel/pacientes/${patientId}/consultas/${saved.visit.id}`);
    }
    return saved;
  };

  // PDF e impressão sempre saem do estado atual da tela (salvando antes, para não perder nada).
  const exportWith = async (action: (p: Patient, v: Visit) => Promise<void>) => {
    setExporting(true);
    setExportError("");
    try {
      const saved = await save();
      if (!saved) return; // o erro de salvar já aparece na barra de salvar
      await action(saved.patient, saved.visit);
    } catch {
      setExportError("Não foi possível gerar o PDF agora. Tente de novo.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link href={`/painel/pacientes/${patientId}`} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-brand-700">
        <ArrowLeft className="h-4 w-4" /> {patient.identification.name || "Paciente"}
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-navy-900">Consulta {visit.sequence}</h1>
        <p className="text-sm text-slate-500">Prontuário Nº {formatRecordNumber(patient.number)}</p>
      </div>

      <HealthAlerts anamnesis={patient.anamnesis} />
      {exportError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">{exportError}</p>}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" disabled={exporting} onClick={() => exportWith(downloadRecordPdf)}>
          <FileDown className="h-4 w-4" /> Gerar PDF
        </Button>
        <Button variant="secondary" disabled={exporting} onClick={() => exportWith(printRecordPdf)}>
          <Printer className="h-4 w-4" /> Imprimir
        </Button>
      </div>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === "visit" && <ConsultationSection visit={visit} onChange={edit} />}
      {tab === "oral" && <OralHealthSection value={visit.oralHealth} onChange={(patch) => edit({ oralHealth: { ...visit.oralHealth, ...patch } })} />}
      {tab === "exam" && <ClinicalExamSection value={visit.clinicalExam} onChange={(patch) => edit({ clinicalExam: { ...visit.clinicalExam, ...patch } })} />}
      {tab === "teeth" && (
        <SectionCard title="Odontograma" description="Parte do odontograma da consulta anterior.">
          <OdontogramChart value={visit.odontogram} onChange={(odontogram) => edit({ odontogram })} />
        </SectionCard>
      )}
      {tab === "findings" && <FindingsSection value={visit.findings} onChange={(findings) => edit({ findings })} />}
      {tab === "card" && <PaperRecordCard data={toPaperRecord(patient, visit)} onToothClick={() => setTab("teeth")} />}

      <SaveBar state={editor.saveState} error={editor.saveError} label="Salvar consulta" onSave={save} />
      {leaveDialog}
    </div>
  );
}
