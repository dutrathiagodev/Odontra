import { TriangleAlert } from "lucide-react";
import type { Anamnesis } from "@/domain/patient/patient";

/** Pontos de atenção da anamnese que o dentista precisa ver antes de atender. */
export function collectHealthAlerts(a: Anamnesis): string[] {
  const alerts: string[] = [];
  if (a.allergy === "yes") alerts.push(`Alergia${a.allergyDetail ? `: ${a.allergyDetail}` : ""}`);
  if (a.pregnant === "yes") alerts.push(`Gestante${a.pregnancyWeeks ? ` (${a.pregnancyWeeks} semanas)` : ""}`);
  if (a.usesMedication === "yes") alerts.push(`Medicação${a.medication ? `: ${a.medication}` : ""}`);
  if (a.hasDisease === "yes") {
    const kinds = [...a.diseaseCategories, a.diseaseDetail].filter(Boolean).join(", ");
    alerts.push(`Doença${kinds ? `: ${kinds}` : ""}`);
  }
  if (a.bleeding === "excessive") alerts.push("Sangramento excessivo");
  if (a.healing === "complicated") alerts.push("Cicatrização complicada");
  if (a.shortnessOfBreath === "yes") alerts.push("Sente falta de ar");
  return alerts;
}

export function HealthAlerts({ anamnesis }: { anamnesis: Anamnesis }) {
  const alerts = collectHealthAlerts(anamnesis);
  if (alerts.length === 0) return null;

  return (
    <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-extrabold text-amber-800">
        <TriangleAlert className="h-4 w-4" /> Atenção no atendimento
      </p>
      <ul className="flex flex-wrap gap-2">
        {alerts.map((alert) => (
          <li key={alert} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
            {alert}
          </li>
        ))}
      </ul>
    </div>
  );
}
