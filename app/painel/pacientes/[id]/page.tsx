import { Suspense } from "react";
import { PatientEditor } from "@/presentation/panel/patient/patient-editor";
import { Loading } from "@/presentation/ui/loading";

export const metadata = { title: "Paciente" };

async function Content({ params }: PageProps<"/painel/pacientes/[id]">) {
  const { id } = await params;
  return <PatientEditor patientId={id} />;
}

export default function PatientPage(props: PageProps<"/painel/pacientes/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
