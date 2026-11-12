"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Anamnesis, Identification, Patient } from "@/domain/patient/patient";
import { getPatient, savePatient, startNewPatient } from "@/infrastructure/container";
import { formatRecordNumber } from "../../format";
import { useRecordEditor } from "../../hooks/use-record-editor";
import { Avatar } from "../../ui/avatar";
import { LoadState } from "../../ui/load-state";
import { SaveBar } from "../../ui/save-bar";
import { TabPanel, Tabs } from "../../ui/tabs";
import { AnamnesisSection } from "./anamnesis-section";
import { HealthAlerts } from "./health-alerts";
import { IdentificationSection } from "./identification-section";
import { PhotoField } from "./photo-field";
import { VisitHistory } from "./visit-history";

type TabKey = "data" | "anamnesis" | "history";

/** O banco decide o Nº e as datas; o resto é o que está na tela. */
const mergeSaved = (current: Patient, saved: Patient): Patient => ({ ...current, id: saved.id, number: saved.number, updatedAt: saved.updatedAt });

export function PatientEditor({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [persisted, setPersisted] = useState(Boolean(patientId));
  const [tab, setTab] = useState<TabKey>("data");
  const editor = useRecordEditor<Patient>({
    load: () => (patientId ? getPatient.execute(patientId) : startNewPatient.execute()),
    persist: (p) => savePatient.execute(p),
    mergeSaved,
    deps: [patientId],
  });
  const { value: patient, edit } = editor;

  if (editor.loadState !== "ready" || !patient) {
    return <LoadState state={editor.loadState === "ready" ? "loading" : editor.loadState} error={editor.loadError} missingText="Paciente não encontrado." onRetry={editor.retry} />;
  }

  const editIdentification = (patch: Partial<Identification>) => edit({ identification: { ...patient.identification, ...patch } });
  const editAnamnesis = (patch: Partial<Anamnesis>) => edit({ anamnesis: { ...patient.anamnesis, ...patch } });

  const save = async () => {
    const saved = await editor.save();
    if (saved && !persisted) {
      setPersisted(true);
      router.replace(`/painel/pacientes/${saved.id}`);
    }
  };

  const tabs = [
    { key: "data" as const, label: "Dados" },
    { key: "anamnesis" as const, label: "Anamnese" },
    ...(persisted ? [{ key: "history" as const, label: "Histórico" }] : []),
  ];

  const name = patient.identification.name;

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

      <Tabs items={tabs} active={tab} onChange={setTab} idBase="paciente" label="Seções do paciente" />

      <TabPanel idBase="paciente" active={tab}>
        {tab === "data" && (
          <>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <PhotoField name={name} photo={patient.photo} onChange={(photo) => edit({ photo })} />
            </div>
            <IdentificationSection value={patient.identification} onChange={editIdentification} />
          </>
        )}
        {tab === "anamnesis" && <AnamnesisSection value={patient.anamnesis} onChange={editAnamnesis} />}
        {tab === "history" && persisted && <VisitHistory patient={patient} />}
      </TabPanel>

      {tab !== "history" && (
        <SaveBar
          state={editor.saveState}
          error={editor.saveError}
          label={persisted ? "Salvar alterações" : "Cadastrar paciente"}
          onSave={save}
          disabled={!name.trim()}
        />
      )}
    </div>
  );
}
