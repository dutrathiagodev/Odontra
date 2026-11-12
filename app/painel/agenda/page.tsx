import { Suspense } from "react";
import { AgendaView } from "@/presentation/agenda/agenda-view";

export const metadata = { title: "Agenda" };

export default function AgendaPage() {
  // A agenda depende da data de hoje no aparelho: renderiza na visita, não no build.
  return (
    <Suspense fallback={<p className="py-10 text-center text-muted">Abrindo a agenda…</p>}>
      <AgendaView />
    </Suspense>
  );
}
