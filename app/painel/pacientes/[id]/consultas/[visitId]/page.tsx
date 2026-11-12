import { Suspense } from "react";
import { VisitEditor } from "@/presentation/panel/visit/visit-editor";
import { Loading } from "@/presentation/ui/loading";

async function Content({ params }: PageProps<"/painel/pacientes/[id]/consultas/[visitId]">) {
  const { id, visitId } = await params;
  return <VisitEditor patientId={id} visitId={visitId} />;
}

export default function VisitPage(props: PageProps<"/painel/pacientes/[id]/consultas/[visitId]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
