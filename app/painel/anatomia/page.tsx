import { ToothAnatomy } from "@/presentation/anatomy/tooth-anatomy";
import { PageHeader } from "@/presentation/ui/page-header";

export const metadata = { title: "Anatomia do dente — Odontra" };

export default function AnatomyPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Anatomia do dente" subtitle="Use para explicar o tratamento ao paciente: toque nas partes para ver o que cada uma faz." />
      <ToothAnatomy />
    </div>
  );
}
