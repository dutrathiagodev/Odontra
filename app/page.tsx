import { listPatients } from "@/infrastructure/container";
import { PatientList } from "@/presentation/components/patient-list";

export default async function Home() {
  const patients = await listPatients.execute();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Prontuário Maju</h1>
      <PatientList patients={patients} />
    </main>
  );
}
