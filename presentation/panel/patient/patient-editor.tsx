"use client";

import { Check, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Anamnesis, Identification, Patient } from "@/domain/patient/patient";
import { getPatient, savePatient, startNewPatient } from "@/infrastructure/container";
import { formatRecordNumber } from "../../format";
import { Avatar } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Tabs } from "../../ui/tabs";
import { AnamnesisSection } from "./anamnesis-section";
import { HealthAlerts } from "./health-alerts";
import { IdentificationSection } from "./identification-section";
import { PhotoField } from "./photo-field";
import { VisitHistory } from "./visit-history";

type TabKey = "data" | "anamnesis" | "history";

export function PatientEditor({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [persisted, setPersisted] = useState(Boolean(patientId));
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<TabKey>("data");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = patientId ? await getPatient.execute(patientId) : await startNewPatient.execute();
      if (cancelled) return;
      if (loaded) setPatient(loaded);
      else setMissing(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (missing) return <p className="py-10 text-center text-slate-500">Paciente não encontrado.</p>;
  if (!patient) return <p className="py-10 text-center text-slate-400">Carregando…</p>;

  const edit = (next: Partial<Patient>) => {
    setPatient({ ...patient, ...next });
    setJustSaved(false);
  };
  const editIdentification = (patch: Partial<Identification>) => edit({ identification: { ...patient.identification, ...patch } });
  const editAnamnesis = (patch: Partial<Anamnesis>) => edit({ anamnesis: { ...patient.anamnesis, ...patch } });

  const save = async () => {
    const saved = await savePatient.execute(patient);
    setPatient(saved);
    setJustSaved(true);
    if (!persisted) {
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
          <p className="text-sm font-semibold text-brand-600">Prontuário Nº {formatRecordNumber(patient.number)}</p>
        </div>
      </div>

      {persisted && <HealthAlerts anamnesis={patient.anamnesis} />}

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === "data" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <PhotoField name={name} photo={patient.photo} onChange={(photo) => edit({ photo })} />
          </div>
          <IdentificationSection value={patient.identification} onChange={editIdentification} />
        </div>
      )}
      {tab === "anamnesis" && <AnamnesisSection value={patient.anamnesis} onChange={editAnamnesis} />}
      {tab === "history" && persisted && <VisitHistory patient={patient} />}

      {tab !== "history" && (
        <div className="safe-bottom fixed inset-x-0 bottom-[60px] z-20 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button onClick={save} disabled={!name.trim()} className="w-full sm:w-auto">
            {justSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {justSaved ? "Salvo" : persisted ? "Salvar alterações" : "Cadastrar paciente"}
          </Button>
        </div>
      )}
    </div>
  );
}
