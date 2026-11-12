import type { Patient } from "@/domain/patient/patient";

export function PatientList({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return <p>Nenhum paciente cadastrado.</p>;
  }

  return (
    <ul>
      {patients.map((patient) => (
        <li key={patient.id}>{patient.name}</li>
      ))}
    </ul>
  );
}
