import { ListPatients } from "@/application/patient/list-patients";
import { InMemoryPatientRepository } from "./patient/in-memory-patient-repository";

// Composition root: único lugar que conhece as implementações concretas.
const patientRepository = new InMemoryPatientRepository();

export const listPatients = new ListPatients(patientRepository);
