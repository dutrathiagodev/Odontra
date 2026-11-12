import { Suspense } from "react";
import { VisitEditor } from "@/presentation/panel/visit/visit-editor";
import { Loading } from "@/presentation/ui/loading";

async function Content({ params }: PageProps<"/painel/pacientes/[id]/consultas/nova">) {
  const { id } = await params;
  return <VisitEditor patientId={id} />;
}

export default function NewVisitPage(props: PageProps<"/painel/pacientes/[id]/consultas/nova">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
