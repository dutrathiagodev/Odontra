/* eslint-disable @next/next/no-img-element */
import { PROFILE_PHOTOS, profilePhotoUrl } from "../../profile-photos";

const VISITS = [
  { n: 3, date: "Hoje", title: "Restauração no 26", text: "Resina composta, anestesia infiltrativa." },
  { n: 2, date: "Há 2 semanas", title: "Dor ao mastigar", text: "Cárie profunda identificada no 26." },
  { n: 1, date: "Há 3 meses", title: "Avaliação inicial", text: "Anamnese, exame clínico e odontograma." },
];

export function HistoryScene() {
  const patient = PROFILE_PHOTOS[1];
  return (
    <div className="text-navy-900">
      <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 ring-1 ring-white">
        <img src={profilePhotoUrl(patient.id, 112)} alt={patient.name} width={52} height={52} className="h-13 w-13 rounded-full object-cover ring-2 ring-brand-100" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold">{patient.name}</p>
          <p className="text-xs font-semibold text-brand-600">Prontuário Nº 0042 · dados de exemplo</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">Alergia: dipirona</span>
      </div>

      <ol className="relative mt-4 space-y-3 border-l-2 border-brand-100 pl-5">
        {VISITS.map((visit, i) => (
          <li key={visit.n} className="animate-slide-up relative rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100" style={{ animationDelay: `${i * 220}ms` }}>
            <span className="absolute -left-[29px] top-5 h-3.5 w-3.5 rounded-full bg-brand-600 ring-4 ring-brand-100" />
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">Consulta {visit.n} · {visit.date}</p>
            <p className="mt-0.5 font-bold">{visit.title}</p>
            <p className="text-sm text-slate-500">{visit.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
