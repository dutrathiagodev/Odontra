"use client";

import { useCallback, useEffect, useState } from "react";
import type { Appointment } from "@/domain/appointment/appointment";
import { deleteAppointment, listAppointments, saveAppointment } from "@/infrastructure/container";
import { friendlyError, withTimeout } from "../async/with-timeout";
import { addMonths, startOfMonth } from "./calendar-math";

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; items: Appointment[] };

/** Horários do mês visível (com folga da semana anterior e seguinte). Nunca fica em "carregando" para sempre. */
export function useAgenda(month: Date) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [version, setVersion] = useState(0);
  const monthKey = startOfMonth(month).getTime();

  useEffect(() => {
    let cancelled = false;
    const from = new Date(monthKey - 7 * 86_400_000);
    const to = new Date(addMonths(new Date(monthKey), 1).getTime() + 7 * 86_400_000);
    withTimeout(listAppointments.execute(from, to))
      .then((items) => !cancelled && setState({ status: "ready", items }))
      .catch((err) => !cancelled && setState({ status: "error", message: friendlyError(err) }));
    return () => {
      cancelled = true;
    };
  }, [monthKey, version]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setVersion((v) => v + 1);
  }, []);

  const save = useCallback(async (appointment: Appointment) => {
    const saved = await withTimeout(saveAppointment.execute(appointment));
    setVersion((v) => v + 1);
    return saved;
  }, []);

  const remove = useCallback(async (id: string) => {
    await withTimeout(deleteAppointment.execute(id));
    setVersion((v) => v + 1);
  }, []);

  return { state, reload, save, remove };
}
