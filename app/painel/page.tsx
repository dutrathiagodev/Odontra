import { PatientList } from "@/presentation/panel/patient-list";

export const metadata = { title: "Pacientes" };

export default function PanelHome() {
  return <PatientList />;
}
