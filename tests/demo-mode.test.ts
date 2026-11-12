import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadDemoData } from "@/application/patient/load-demo-data";
import { createBlankPatient } from "@/domain/patient/patient-factory";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import { createBlankVisit } from "@/domain/visit/visit-factory";
import { demoAware, demoMode } from "@/infrastructure/demo/demo-mode";
import { DEMO_STORE } from "@/infrastructure/local-storage-collection";
import { LocalStoragePatientRepository } from "@/infrastructure/patient/local-storage-patient-repository";
import { LocalStorageVisitRepository } from "@/infrastructure/visit/local-storage-visit-repository";

/** sessionStorage de mentira (o Vitest roda em Node, sem navegador). */
function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

function fakeRealRepository(): PatientRepository {
  return {
    findAll: vi.fn(async () => []),
    findById: vi.fn(async () => null),
    save: vi.fn(async (p) => p),
    delete: vi.fn(async () => {}),
  };
}

beforeEach(() => {
  vi.stubGlobal("window", { sessionStorage: fakeStorage(), localStorage: fakeStorage() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("modo exemplo", () => {
  it("grava os exemplos só na aba e não toca no repositório real", async () => {
    const real = fakeRealRepository();
    const demoPatients = new LocalStoragePatientRepository(DEMO_STORE);
    const patients = demoAware(real, demoPatients);
    const patient = createBlankPatient(1);

    await new LoadDemoData(demoPatients, new LocalStorageVisitRepository(DEMO_STORE)).execute({
      patients: [patient],
      visits: [createBlankVisit({ patientId: patient.id, sequence: 1 })],
    });
    demoMode.activate();

    expect(await patients.findAll()).toHaveLength(1);
    await patients.save({ ...patient, photo: "" });
    expect(real.save).not.toHaveBeenCalled();
    expect(real.findAll).not.toHaveBeenCalled();
  });

  it("fora do exemplo, tudo vai para o repositório real", async () => {
    const real = fakeRealRepository();
    const patients = demoAware(real, new LocalStoragePatientRepository(DEMO_STORE));
    await patients.findAll();
    expect(real.findAll).toHaveBeenCalledTimes(1);
  });

  it("sair do exemplo apaga os dados fictícios e volta ao real", async () => {
    const real = fakeRealRepository();
    const demoPatients = new LocalStoragePatientRepository(DEMO_STORE);
    const patients = demoAware(real, demoPatients);
    await demoPatients.save(createBlankPatient(1));
    demoMode.activate();
    const listener = vi.fn();
    const unsubscribe = demoMode.subscribe(listener);

    demoMode.leave();

    expect(listener).toHaveBeenCalled();
    expect(demoMode.isActive()).toBe(false);
    expect(await demoPatients.findAll()).toHaveLength(0);
    await patients.findAll();
    expect(real.findAll).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
