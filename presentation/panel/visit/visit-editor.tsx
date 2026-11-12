"use client";

import { ArrowLeft, Check, FileDown, Printer, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Patient } from "@/domain/patient/patient";
import type { Visit } from "@/domain/visit/visit";
import { getPatient, getVisit, saveVisit, startNewVisit } from "@/infrastructure/container";
import { formatRecordNumber } from "../../format";
import { OdontogramChart } from "../../odontogram/odontogram-chart";
import { downloadRecordPdf, printRecordPdf } from "../../pdf/pdf-actions";
import { PaperRecordCard } from "../../record-card/paper-record-card";
import { toPaperRecord } from "../../record-card/to-paper-record";
import { Button } from "../../ui/button";
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

export function VisitEditor({ patientId, visitId }: { patientId: string; visitId?: string }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [persisted, setPersisted] = useState(Boolean(visitId));
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<TabKey>("visit");
  const [justSaved, setJustSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loadedPatient = await getPatient.execute(patientId);
      const loadedVisit = visitId ? await getVisit.execute(visitId) : await startNewVisit.execute(patientId);
      if (cancelled) return;
      if (loadedPatient && loadedVisit) {
        setPatient(loadedPatient);
        setVisit(loadedVisit);
      } else setMissing(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId, visitId]);

  if (missing) return <p className="py-10 text-center text-slate-500">Consulta não encontrada.</p>;
  if (!patient || !visit) return <p className="py-10 text-center text-slate-400">Carregando…</p>;

  const edit = (patch: Partial<Visit>) => {
    setVisit({ ...visit, ...patch });
    setJustSaved(false);
  };

  const save = async () => {
    const saved = await saveVisit.execute(visit);
    setVisit(saved);
    setJustSaved(true);
    if (!persisted) {
      setPersisted(true);
      router.replace(`/painel/pacientes/${patientId}/consultas/${saved.id}`);
    }
    return saved;
  };

  // PDF e impressão sempre saem do estado atual da tela (salvando antes, para não perder nada).
  const exportWith = async (action: (p: Patient, v: Visit) => Promise<void>) => {
    setExporting(true);
    try {
      await action(patient, await save());
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

      <div className="safe-bottom fixed inset-x-0 bottom-[60px] z-20 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <Button onClick={save} className="w-full sm:w-auto">
          {justSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {justSaved ? "Salvo" : "Salvar consulta"}
        </Button>
      </div>
    </div>
  );
}
