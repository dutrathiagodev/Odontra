"use client";

import { useCallback } from "react";
import type { Patient } from "@/domain/patient/patient";
import { deletePatient, listPatients, loadDemoData } from "@/infrastructure/container";
import { withTimeout } from "../async/with-timeout";
import { buildDemoData } from "../demo/demo-patients";
import { useAsync } from "./use-async";

export function usePatients() {
  const { state, reload, retry } = useAsync(() => listPatients.execute(), []);
  const patients: Patient[] | null = state.status === "ready" ? state.data : null;

  /** Exclui e recarrega. Lança erro (com tempo limite) para a tela avisar. */
  const remove = useCallback(
    async (id: string) => {
      await withTimeout(deletePatient.execute(id));
      reload();
    },
    [reload],
  );

  const loadDemo = useCallback(async () => {
    const existing = await listPatients.execute();
    const next = existing.reduce((max, p) => Math.max(max, p.number), 0) + 1;
    await withTimeout(loadDemoData.execute(await buildDemoData(next)));
    reload();
  }, [reload]);

  return { patients, error: state.status === "error" ? state.message : "", retry, remove, loadDemo };
}
