import { DeleteAppointment, ListAppointments, SaveAppointment } from "@/application/appointment/appointment-use-cases";
import { DeletePatient } from "@/application/patient/delete-patient";
import { GetPatient } from "@/application/patient/get-patient";
import { ListPatients } from "@/application/patient/list-patients";
import { LoadDemoData } from "@/application/patient/load-demo-data";
import { SavePatient } from "@/application/patient/save-patient";
import { StartNewPatient } from "@/application/patient/start-new-patient";
import { GetProfile, SaveProfile } from "@/application/profile/profile-use-cases";
import { DeleteVisit } from "@/application/visit/delete-visit";
import { GetVisit } from "@/application/visit/get-visit";
import { ListVisits } from "@/application/visit/list-visits";
import { SaveVisit } from "@/application/visit/save-visit";
import { StartNewVisit } from "@/application/visit/start-new-visit";
import type { AppointmentRepository } from "@/domain/appointment/appointment-repository";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import type { ProfileRepository } from "@/domain/profile/profile-repository";
import type { VisitRepository } from "@/domain/visit/visit-repository";
import { LocalStorageAppointmentRepository } from "./appointment/local-storage-appointment-repository";
import { SupabaseAppointmentRepository } from "./appointment/supabase-appointment-repository";
import { LocalStoragePatientRepository } from "./patient/local-storage-patient-repository";
import { SupabasePatientRepository } from "./patient/supabase-patient-repository";
import { LocalStorageProfileRepository } from "./profile/local-storage-profile-repository";
import { SupabaseProfileRepository } from "./profile/supabase-profile-repository";
import { getBrowserSupabase } from "./supabase/browser-client";
import { isSupabaseConfigured } from "./supabase/env";
import { LocalStorageVisitRepository } from "./visit/local-storage-visit-repository";
import { SupabaseVisitRepository } from "./visit/supabase-visit-repository";

// Composition root: único lugar que conhece as implementações concretas.
// Com Supabase os dados vão para o banco (com login). Armazenamento no aparelho só em desenvolvimento:
// em produção sem as variáveis, o repositório do Supabase falha com erro claro em vez de gravar no navegador.
const useDatabase = isSupabaseConfigured || process.env.NODE_ENV === "production";

const patientRepository: PatientRepository = useDatabase
  ? new SupabasePatientRepository(getBrowserSupabase)
  : new LocalStoragePatientRepository();
const visitRepository: VisitRepository = useDatabase
  ? new SupabaseVisitRepository(getBrowserSupabase)
  : new LocalStorageVisitRepository();
const appointmentRepository: AppointmentRepository = useDatabase
  ? new SupabaseAppointmentRepository(getBrowserSupabase)
  : new LocalStorageAppointmentRepository();
const profileRepository: ProfileRepository = useDatabase
  ? new SupabaseProfileRepository(getBrowserSupabase)
  : new LocalStorageProfileRepository();

export const listPatients = new ListPatients(patientRepository);
export const getPatient = new GetPatient(patientRepository);
export const savePatient = new SavePatient(patientRepository);
export const startNewPatient = new StartNewPatient(patientRepository);
export const deletePatient = new DeletePatient(patientRepository, visitRepository);

export const loadDemoData = new LoadDemoData(patientRepository, visitRepository);

export const listVisits = new ListVisits(visitRepository);
export const getVisit = new GetVisit(visitRepository);
export const saveVisit = new SaveVisit(visitRepository);
export const startNewVisit = new StartNewVisit(visitRepository, profileRepository);
export const deleteVisit = new DeleteVisit(visitRepository);

export const listAppointments = new ListAppointments(appointmentRepository);
export const saveAppointment = new SaveAppointment(appointmentRepository);
export const deleteAppointment = new DeleteAppointment(appointmentRepository);

export const getProfile = new GetProfile(profileRepository);
export const saveProfile = new SaveProfile(profileRepository);
