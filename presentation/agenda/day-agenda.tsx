"use client";

import { CalendarPlus } from "lucide-react";
import { endsAt, type Appointment } from "@/domain/appointment/appointment";
import { dayTitle, timeLabel } from "./calendar-math";
import { chipColor } from "./chip-color";

interface DayAgendaProps {
  day: Date;
  items: Appointment[];
  patientName: (id: string | null) => string;
  onOpen: (appointment: Appointment) => void;
  onAdd: () => void;
}

/** Lista do dia como no Calendário do iPhone: hora à esquerda, barra de cor e título. */
export function DayAgenda({ day, items, patientName, onOpen, onAdd }: DayAgendaProps) {
  return (
    <section aria-label="Horários do dia">
      <h3 className="px-1 pb-2 text-[15px] font-bold text-ink first-letter:uppercase">{dayTitle(day)}</h3>

      {items.length === 0 ? (
        <button type="button" onClick={onAdd} className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-5 text-left ring-1 ring-line active:bg-enamel">
          <CalendarPlus className="h-5 w-5 text-accent" />
          <span>
            <span className="block text-[15px] font-semibold text-ink">Nenhum horário</span>
            <span className="block text-sm text-muted">Toque para marcar um paciente neste dia.</span>
          </span>
        </button>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {items.map((item) => {
            const start = new Date(item.startsAt);
            const patient = patientName(item.patientId);
            return (
              <li key={item.id}>
                <button type="button" onClick={() => onOpen(item)} className="flex w-full items-stretch gap-3 px-4 py-3 text-left active:bg-enamel">
                  <span className="w-12 shrink-0 text-right text-[13px] leading-5 tabular-nums">
                    <span className="block font-semibold text-ink">{timeLabel(start)}</span>
                    <span className="block text-muted">{timeLabel(endsAt(item))}</span>
                  </span>
                  <span className="w-1 shrink-0 rounded-full" style={{ background: chipColor(item.patientId ?? item.title).bar }} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{item.title}</span>
                    {patient && <span className="block truncate text-sm text-muted">{patient}</span>}
                    {item.googleEventId && <span className="mt-0.5 block text-xs font-semibold text-accent">No Google Agenda</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
