"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { DURATIONS, type Appointment } from "@/domain/appointment/appointment";
import type { Patient } from "@/domain/patient/patient";
import { friendlyError } from "../async/with-timeout";
import { BottomSheet } from "../ui/bottom-sheet";
import { Button } from "../ui/button";
import { useConfirm } from "../ui/confirm-dialog";
import { toLocalInput } from "./calendar-math";
import { googleCalendarUrl } from "./google-calendar";

interface AppointmentSheetProps {
  appointment: Appointment;
  isNew: boolean;
  patients: Patient[];
  onSave: (appointment: Appointment) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const rowInput = "w-full bg-transparent py-3 text-[16px] text-ink outline-none placeholder:text-muted/60";

/** Linha de grupo no estilo dos Ajustes do iOS. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-h-12 items-center gap-3 px-4">
      <span className="w-24 shrink-0 text-[15px] text-ink">{label}</span>
      <span className="min-w-0 flex-1 text-right">{children}</span>
    </label>
  );
}

/** Criar ou editar um horário. Abre por baixo no iPhone e centralizado no iPad. */
export function AppointmentSheet({ appointment, isNew, patients, onSave, onDelete, onClose }: AppointmentSheetProps) {
  const [draft, setDraft] = useState(appointment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { confirm, dialog } = useConfirm();
  const set = <K extends keyof Appointment>(key: K, value: Appointment[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const choosePatient = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    setDraft((d) => ({
      ...d,
      patientId: id || null,
      // Sugere o título com o nome do paciente, sem apagar o que já foi escrito.
      title: d.title || (patient ? `Consulta — ${patient.identification.name}` : d.title),
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return setError("Dê um título ao horário, por exemplo: Consulta — Ana Souza.");
    setBusy(true);
    setError("");
    try {
      await onSave(draft);
      onClose();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: "Apagar este horário?",
      description: "Ele sai da agenda do Odontra. Se você adicionou ao Google Agenda, apague lá também.",
      confirmLabel: "Apagar horário",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await onDelete(draft.id);
      onClose();
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <BottomSheet open title={isNew ? "Novo horário" : "Horário"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5 pb-4" noValidate>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

        <div className="divide-y divide-line overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
          <div className="px-4">
            <input aria-label="Título" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Título" maxLength={160} className={rowInput} />
          </div>
          <Row label="Paciente">
            <select value={draft.patientId ?? ""} onChange={(e) => choosePatient(e.target.value)} className={`${rowInput} text-right text-muted`}>
              <option value="">Nenhum</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.identification.name || `Paciente ${p.number}`}</option>
              ))}
            </select>
          </Row>
        </div>

        <div className="divide-y divide-line overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
          <Row label="Início">
            <input
              type="datetime-local"
              value={toLocalInput(draft.startsAt)}
              onChange={(e) => e.target.value && set("startsAt", new Date(e.target.value).toISOString())}
              className={`${rowInput} text-right`}
            />
          </Row>
          <Row label="Duração">
            <select value={draft.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} className={`${rowInput} text-right`}>
              {DURATIONS.map((m) => (
                <option key={m} value={m}>{durationLabel(m)}</option>
              ))}
            </select>
          </Row>
        </div>

        <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
          <textarea aria-label="Observações" value={draft.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Observações" rows={3} maxLength={2000} className={`${rowInput} resize-none px-4`} />
        </div>

        <Button type="submit" disabled={busy} className="w-full">{busy ? "Salvando…" : isNew ? "Marcar horário" : "Salvar alterações"}</Button>

        {!isNew && (
          <div className="grid gap-2 sm:grid-cols-2">
            <a href={googleCalendarUrl(draft)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-ink ring-1 ring-line hover:bg-enamel">
              <ExternalLink className="h-4 w-4" /> Adicionar ao Google Agenda
            </a>
            <Button type="button" variant="danger" onClick={remove} disabled={busy}>
              <Trash2 className="h-4 w-4" /> Apagar horário
            </Button>
          </div>
        )}
      </form>
      {dialog}
    </BottomSheet>
  );
}
