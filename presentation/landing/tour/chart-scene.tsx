import type { Odontogram } from "@/domain/tooth";
import { OdontogramChart } from "../../odontogram/odontogram-chart";

const SAMPLE: Odontogram = {
  "14": { condition: "caries", note: "" },
  "16": { condition: "restoration", note: "" },
  "21": { condition: "crown", note: "" },
  "26": { condition: "endodontics", note: "Canal tratado" },
  "11": { condition: "implant", note: "" },
  "36": { condition: "extraction", note: "" },
  "38": { condition: "missing", note: "" },
  "46": { condition: "restoration", note: "" },
};

export function ChartScene() {
  return (
    <div className="space-y-4 text-navy-900">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-2 text-xl font-extrabold">Odontograma</h3>
        {["Visão geral", "Condições", "Observações"].map((chip, i) => (
          <span key={chip} className={`rounded-full px-3 py-1 text-xs font-bold ${i === 0 ? "bg-brand-600 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>
            {chip}
          </span>
        ))}
      </div>
      <OdontogramChart value={SAMPLE} animated />
    </div>
  );
}
