"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Anamnesis, Identification, Patient } from "@/domain/patient/patient";
import { normalizePatient, validatePatient, type FieldIssue } from "@/domain/patient/validation";
import { getPatient, savePatient, startNewPatient } from "@/infrastructure/container";
import { formatRecordNumber } from "../../format";
import { useRecordEditor } from "../../hooks/use-record-editor";
import { useToday } from "../../hooks/use-today";
import { Avatar } from "../../ui/avatar";
import { FormErrorsProvider, useFocusField, useFormValidation } from "../../ui/form-errors";
import { LoadState } from "../../ui/load-state";
import { SaveBar } from "../../ui/save-bar";
import { Tabs } from "../../ui/tabs";
import { AnamnesisSection } from "./anamnesis-section";
import { HealthAlerts } from "./health-alerts";
import { IdentificationSection } from "./identification-section";
import { PhotoField } from "./photo-field";
import { VisitHistory } from "./visit-history";

type TabKey = "data" | "anamnesis" | "history";

/** O banco decide o Nº e as datas; o resto é o que está na tela. */
const mergeSaved = (current: Patient, saved: Patient): Patient => ({ ...current, id: saved.id, number: saved.number, updatedAt: saved.updatedAt });

/** Aba onde fica cada campo validado. */
const tabOf = (field: string): TabKey => (field.startsWith("anamnesis.") ? "anamnesis" : "data");

const NO_ISSUES: FieldIssue[] = [];

export function PatientEditor({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [persisted, setPersisted] = useState(Boolean(patientId));
  const [tab, setTab] = useState<TabKey>("data");
  const editor = useRecordEditor<Patient>({
    load: () => (patientId ? getPatient.execute(patientId) : startNewPatient.execute()),
    // Grava sem espaços sobrando, com máscaras padronizadas e sem respostas que deixaram de valer.
    persist: (p) => savePatient.execute(normalizePatient(p)),
    mergeSaved,
    deps: [patientId],
  });
  const { value: patient, edit } = editor;
  const today = useToday();
  const issues = useMemo(() => (patient ? validatePatient(patient, today) : NO_ISSUES), [patient, today]);
  const form = useFormValidation(issues);
  const focusField = useFocusField();

  if (editor.loadState !== "ready" || !patient) {
    return <LoadState state={editor.loadState === "ready" ? "loading" : editor.loadState} error={editor.loadError} missingText="Paciente não encontrado." onRetry={editor.retry} />;
  }

  const editIdentification = (patch: Partial<Identification>) => edit({ identification: { ...patient.identification, ...patch } });
  const editAnamnesis = (patch: Partial<Anamnesis>) => edit({ anamnesis: { ...patient.anamnesis, ...patch } });

  /** Abre a aba do campo com problema e leva o foco até ele. */
  const review = (issue: FieldIssue | undefined = issues[0]) => {
    if (!issue) return;
    setTab(tabOf(issue.field));
    focusField(issue.field);
  };

  const save = async () => {
    const firstIssue = form.submit();
    if (firstIssue) {
      review(firstIssue);
      return;
    }
    const saved = await editor.save();
    if (saved && !persisted) {
      setPersisted(true);
      router.replace(`/painel/pacientes/${saved.id}`);
    }
  };

  const tabs = [
    { key: "data" as const, label: "Dados", alert: form.submitted && issues.some((i) => tabOf(i.field) === "data") },
    { key: "anamnesis" as const, label: "Anamnese", alert: form.submitted && issues.some((i) => tabOf(i.field) === "anamnesis") },
    ...(persisted ? [{ key: "history" as const, label: "Histórico" }] : []),
  ];

  const name = patient.identification.name.trim();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={name || "Novo"} photo={patient.photo} size="h-14 w-14" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold text-navy-900">{name || "Novo paciente"}</h1>
          <p className="text-sm font-semibold text-brand-600">
            {persisted ? `Prontuário Nº ${formatRecordNumber(patient.number)}` : "Nº do prontuário definido ao cadastrar"}
          </p>
        </div>
      </div>

      {persisted && <HealthAlerts anamnesis={patient.anamnesis} />}

      <Tabs items={tabs} active={tab} onChange={setTab} />

      <FormErrorsProvider value={form.context}>
        {tab === "data" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <PhotoField name={name} photo={patient.photo} onChange={(photo) => edit({ photo })} />
            </div>
            <IdentificationSection value={patient.identification} onChange={editIdentification} today={today} />
          </div>
        )}
        {tab === "anamnesis" && <AnamnesisSection value={patient.anamnesis} onChange={editAnamnesis} sex={patient.identification.sex} />}
      </FormErrorsProvider>
      {tab === "history" && persisted && <VisitHistory patient={patient} />}

      {tab !== "history" && (
        <SaveBar
          state={editor.saveState}
          error={editor.saveError}
          label={persisted ? "Salvar alterações" : "Cadastrar paciente"}
          onSave={save}
          issueCount={form.submitted ? issues.length : 0}
          onReview={() => review()}
        />
      )}
    </div>
  );
}
