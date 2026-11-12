"use client";

import { useCallback } from "react";
import type { PatientSummary } from "@/domain/patient/patient";
import { deletePatient, demoMode, listPatients, loadDemoData } from "@/infrastructure/container";
import { withTimeout } from "../async/with-timeout";
import { buildDemoData } from "../demo/demo-patients";
import { useDemoMode } from "../demo/use-demo-mode";
import { useAsync } from "./use-async";

export function usePatients() {
  const demo = useDemoMode();
  // Recarrega ao entrar ou sair do modo exemplo.
  const { state, reload, retry } = useAsync(() => listPatients.execute(), [demo]);
  const patients: PatientSummary[] | null = state.status === "ready" ? state.data : null;

  /**
   * Exclui e recarrega. Lança erro (com tempo limite) para a tela avisar.
   * Recarrega também na falha: a lista mostra o que de fato ficou no banco.
   */
  const remove = useCallback(
    async (id: string) => {
      try {
        await withTimeout(deletePatient.execute(id));
      } finally {
        reload();
      }
    },
    [reload],
  );

  /** Liga o modo exemplo: pacientes fictícios só nesta aba, nada vai para o banco. */
  const loadDemo = useCallback(async () => {
    demoMode.reset();
    await withTimeout(loadDemoData.execute(await buildDemoData(1)));
    demoMode.activate();
  }, []);

  return { patients, error: state.status === "error" ? state.message : "", retry, remove, loadDemo };
}
