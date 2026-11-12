"use client";

import { useCallback, useEffect, useState } from "react";
import type { Patient } from "@/domain/patient/patient";
import { deletePatient, listPatients, loadDemoData } from "@/infrastructure/container";
import { buildDemoData } from "../demo/demo-patients";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[] | null>(null);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void listPatients.execute().then((list) => {
      if (!cancelled) setPatients(list);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const remove = useCallback(async (id: string) => {
    await deletePatient.execute(id);
    setVersion((v) => v + 1);
  }, []);

  const loadDemo = useCallback(async () => {
    const existing = await listPatients.execute();
    const next = existing.reduce((max, p) => Math.max(max, p.number), 0) + 1;
    await loadDemoData.execute(await buildDemoData(next));
    setVersion((v) => v + 1);
  }, []);

  return { patients, remove, loadDemo };
}
