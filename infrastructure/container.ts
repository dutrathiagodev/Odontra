import { DeletePatient } from "@/application/patient/delete-patient";
import { GetPatient } from "@/application/patient/get-patient";
import { ListPatients } from "@/application/patient/list-patients";
import { LoadDemoData } from "@/application/patient/load-demo-data";
import { SavePatient } from "@/application/patient/save-patient";
import { StartNewPatient } from "@/application/patient/start-new-patient";
import { DeleteVisit } from "@/application/visit/delete-visit";
import { GetVisit } from "@/application/visit/get-visit";
import { ListVisits } from "@/application/visit/list-visits";
import { SaveVisit } from "@/application/visit/save-visit";
import { StartNewVisit } from "@/application/visit/start-new-visit";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import type { VisitRepository } from "@/domain/visit/visit-repository";
import { LocalStoragePatientRepository } from "./patient/local-storage-patient-repository";
import { SupabasePatientRepository } from "./patient/supabase-patient-repository";
import { getBrowserSupabase } from "./supabase/browser-client";
import { isSupabaseConfigured } from "./supabase/env";
import { LocalStorageVisitRepository } from "./visit/local-storage-visit-repository";
import { SupabaseVisitRepository } from "./visit/supabase-visit-repository";

// Composition root: único lugar que conhece as implementações concretas.
// Com Supabase configurado os dados vão para o banco (com login); sem ele, ficam no aparelho.
const patientRepository: PatientRepository = isSupabaseConfigured
  ? new SupabasePatientRepository(getBrowserSupabase)
  : new LocalStoragePatientRepository();
const visitRepository: VisitRepository = isSupabaseConfigured
  ? new SupabaseVisitRepository(getBrowserSupabase)
  : new LocalStorageVisitRepository();

export const listPatients = new ListPatients(patientRepository);
export const getPatient = new GetPatient(patientRepository);
export const savePatient = new SavePatient(patientRepository);
export const startNewPatient = new StartNewPatient(patientRepository);
export const deletePatient = new DeletePatient(patientRepository, visitRepository);

export const loadDemoData = new LoadDemoData(patientRepository, visitRepository);

export const listVisits = new ListVisits(visitRepository);
export const getVisit = new GetVisit(visitRepository);
export const saveVisit = new SaveVisit(visitRepository);
export const startNewVisit = new StartNewVisit(visitRepository);
export const deleteVisit = new DeleteVisit(visitRepository);
