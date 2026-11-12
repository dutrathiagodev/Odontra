"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { createBlankAppointment, type Appointment } from "@/domain/appointment/appointment";
import { usePatients } from "../hooks/use-patients";
import { Button } from "../ui/button";
import { AppointmentSheet } from "./appointment-sheet";
import { addMonths, dayKey, sameDay, startOfDay, startOfMonth } from "./calendar-math";
import { DayAgenda } from "./day-agenda";
import { GoogleCalendarCard } from "./google-calendar-card";
import { MonthCalendar } from "./month-calendar";
import { useAgenda } from "./use-agenda";

interface Editing {
  appointment: Appointment;
  isNew: boolean;
}

/**
 * Agenda no estilo do Calendário do iPhone e do iPad.
 * iPhone: mês em cima, horários do dia embaixo. iPad e desktop: mês e dia lado a lado.
 */
export function AgendaView() {
  const [today] = useState(() => startOfDay(new Date()));
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState<Editing | null>(null);
  const { state, reload, save, remove } = useAgenda(month);
  const { patients } = usePatients();

  const items = useMemo(() => (state.status === "ready" ? state.items : []), [state]);
  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const item of items) {
      const key = dayKey(new Date(item.startsAt));
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
  }, [items]);
  const dayItems = items.filter((item) => sameDay(new Date(item.startsAt), selected));

  const patientName = (id: string | null) => (id ? patients?.find((p) => p.id === id)?.identification.name ?? "" : "");

  const selectDay = (day: Date) => {
    setSelected(day);
    if (day.getMonth() !== month.getMonth()) setMonth(startOfMonth(day));
  };
  const changeMonth = (delta: number) => {
    const next = addMonths(month, delta);
    setMonth(next);
    setSelected(sameDay(startOfMonth(today), next) ? today : next);
  };
  const goToday = () => {
    setMonth(startOfMonth(today));
    setSelected(today);
  };
  const add = () => setEditing({ appointment: createBlankAppointment(selected), isNew: true });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="sr-only">Agenda</h1>
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex min-h-11 items-center rounded-full bg-white/80 px-4 text-[15px] font-semibold text-ink shadow-sm ring-1 ring-line backdrop-blur">
          {month.getFullYear()}
        </span>
        <button type="button" onClick={add} aria-label="Novo horário" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/80 px-3.5 text-[15px] font-semibold text-ink shadow-sm ring-1 ring-line backdrop-blur active:scale-95">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Novo horário</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        <div className="-mx-4 bg-white py-2 sm:mx-0 sm:rounded-3xl sm:px-2 sm:ring-1 sm:ring-line">
          <MonthCalendar month={month} selected={selected} today={today} byDay={byDay} onSelect={selectDay} onMonthChange={changeMonth} />
        </div>

        <div className="space-y-5">
          {state.status === "loading" && <p className="rounded-2xl bg-white px-4 py-5 text-sm text-muted ring-1 ring-line">Carregando horários…</p>}
          {state.status === "error" && (
            <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-800 ring-1 ring-rose-200">
              <p className="font-semibold">Não deu para abrir a agenda.</p>
              <p className="mt-1">{state.message}</p>
              <Button variant="secondary" onClick={reload} className="mt-3">Tentar de novo</Button>
            </div>
          )}
          {state.status === "ready" && (
            <DayAgenda day={selected} items={dayItems} patientName={patientName} onOpen={(a) => setEditing({ appointment: a, isNew: false })} onAdd={add} />
          )}
          <GoogleCalendarCard />
        </div>
      </div>

      {/* Botão flutuante "Hoje", como no rodapé do Calendário do iPhone. */}
      <button
        type="button"
        onClick={goToday}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] left-4 z-20 min-h-11 rounded-full bg-white/85 px-5 text-[15px] font-semibold text-ink shadow-lg ring-1 ring-line backdrop-blur active:scale-95 lg:bottom-6 lg:left-auto lg:right-8"
      >
        Hoje
      </button>

      {editing && (
        <AppointmentSheet
          key={editing.appointment.id}
          appointment={editing.appointment}
          isNew={editing.isNew}
          patients={patients ?? []}
          onSave={save}
          onDelete={remove}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
