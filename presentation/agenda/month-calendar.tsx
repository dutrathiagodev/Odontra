"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "@/domain/appointment/appointment";
import { dayKey, monthGrid, monthTitle, sameDay, timeLabel, WEEKDAYS_SHORT } from "./calendar-math";
import { chipColor } from "./chip-color";

interface MonthCalendarProps {
  month: Date;
  selected: Date;
  today: Date;
  /** Horários de cada dia (chave AAAA-MM-DD), já em ordem. */
  byDay: Map<string, Appointment[]>;
  onSelect: (day: Date) => void;
  onMonthChange: (delta: number) => void;
}

const MAX_CHIPS = 2;

/**
 * Mês no estilo do Calendário do iOS 26: título grande, semanas separadas por linha,
 * horários como etiquetas coloridas dentro do dia e "+N" quando não cabem.
 */
export function MonthCalendar({ month, selected, today, byDay, onSelect, onMonthChange }: MonthCalendarProps) {
  // Só as semanas que tocam o mês (5 ou 6), como no iPhone.
  const days = monthGrid(month);
  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7)).filter((week) =>
    week.some((d) => d.getMonth() === month.getMonth()),
  );

  return (
    <section aria-label="Calendário do mês">
      <header className="flex items-center justify-between px-3 pb-2 pt-1">
        <h2 className="text-[34px] font-extrabold capitalize leading-none tracking-tight text-ink">{monthTitle(month)}</h2>
        <div className="flex rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-line backdrop-blur">
          <button type="button" onClick={() => onMonthChange(-1)} aria-label="Mês anterior" className="grid h-9 w-9 place-items-center rounded-full text-ink active:bg-enamel">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => onMonthChange(1)} aria-label="Próximo mês" className="grid h-9 w-9 place-items-center rounded-full text-ink active:bg-enamel">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 pb-1 text-center text-[11px] font-semibold text-muted" aria-hidden>
        {WEEKDAYS_SHORT.map((d, i) => (
          <span key={i} className={i === 0 || i === 6 ? "text-muted/60" : ""}>{d}</span>
        ))}
      </div>

      <div role="grid">
        {weeks.map((week) => (
          <div key={week[0].toISOString()} role="row" className="grid grid-cols-7 border-t border-line">
            {week.map((day) => {
              const inMonth = day.getMonth() === month.getMonth();
              const weekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = sameDay(day, today);
              const isSelected = sameDay(day, selected);
              const items = byDay.get(dayKey(day)) ?? [];
              const extra = items.length - MAX_CHIPS;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${day.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}${items.length ? `, ${items.length} horário${items.length > 1 ? "s" : ""}` : ""}`}
                  onClick={() => onSelect(day)}
                  className={`flex min-h-[104px] min-w-0 flex-col items-center gap-1 px-0.5 pb-1.5 pt-1.5 text-left transition sm:min-h-[118px] ${isSelected && !isToday ? "bg-enamel/70" : ""} ${inMonth ? "" : "opacity-0 pointer-events-none"}`}
                  tabIndex={inMonth ? 0 : -1}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[20px] font-bold tabular-nums ${
                      isToday ? "bg-[#ff3b30] text-white" : isSelected ? "bg-ink text-white" : weekend ? "text-muted/70" : "text-ink"
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {items.slice(0, MAX_CHIPS).map((item) => {
                    const color = chipColor(item.patientId ?? item.title);
                    return (
                      <span
                        key={item.id}
                        title={`${timeLabel(new Date(item.startsAt))} ${item.title}`}
                        className="block w-full truncate rounded-md px-1 py-[3px] text-[10px] font-semibold leading-tight sm:text-[11px]"
                        style={{ background: color.bg, color: color.fg }}
                      >
                        {item.title.replace(/^Consulta\s+—\s+/, "")}
                      </span>
                    );
                  })}
                  {extra > 0 && <span className="text-[10px] font-semibold text-muted">+{extra}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
