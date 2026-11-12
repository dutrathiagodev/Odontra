"use client";

import { croLabel, validateProfile, type Profile } from "@/domain/profile/profile";
import { getProfile, saveProfile } from "@/infrastructure/container";
import { useRecordEditor } from "../../hooks/use-record-editor";
import { TextField } from "../../ui/fields";
import { LoadState } from "../../ui/load-state";
import { PageHeader } from "../../ui/page-header";
import { SaveBar } from "../../ui/save-bar";
import { SectionCard } from "../../ui/section-card";

/** No perfil o banco não decide nenhum campo: vale o que está na tela. */
const keepCurrent = (current: Profile): Profile => current;

export function ProfileForm() {
  const editor = useRecordEditor<Profile>({
    load: () => getProfile.execute(),
    persist: (profile) => saveProfile.execute(profile),
    mergeSaved: keepCurrent,
    deps: [],
  });
  const { value: profile, edit } = editor;

  if (editor.loadState !== "ready" || !profile) {
    return <LoadState state={editor.loadState === "ready" ? "loading" : editor.loadState} error={editor.loadError} missingText="Perfil não encontrado." onRetry={editor.retry} />;
  }

  const errors = validateProfile(profile);
  const name = profile.fullName.trim();
  const cro = errors.cro ? "" : croLabel(profile.cro);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageHeader title="Meu perfil" subtitle="Seu nome e CRO assinam o prontuário em PDF e já vêm preenchidos nas consultas novas." />

      <SectionCard title="Dados profissionais">
        <TextField label="Nome completo" value={profile.fullName} placeholder="Dra. Maria Souza" onChange={(fullName) => edit({ fullName })} />
        <div>
          <TextField label="CRO" value={profile.cro} placeholder="CRO-SP 12345" onChange={(cro) => edit({ cro })} />
          {errors.cro ? (
            <p role="alert" className="mt-1.5 text-sm font-medium text-rose-600">{errors.cro}</p>
          ) : (
            <p className="mt-1.5 text-sm text-slate-500">UF do conselho e número de inscrição.</p>
          )}
        </div>
      </SectionCard>

      <section aria-label="Prévia da assinatura" className="rounded-xl border border-slate-200 bg-white px-4 pb-5 pt-4 shadow-sm sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assinatura no PDF</p>
        <div className="mx-auto mt-10 max-w-64 text-center">
          <div className="border-t border-slate-400 pt-1.5 text-[10px] uppercase tracking-wide text-slate-500">Assinatura e carimbo cirurgião-dentista</div>
          <p className={`mt-1.5 text-sm font-bold ${name ? "text-navy-900" : "text-slate-300"}`}>{name || "Seu nome"}</p>
          <p className={`text-xs ${cro ? "text-slate-500" : "text-slate-300"}`}>{cro || "CRO-UF 00000"}</p>
        </div>
      </section>

      <SaveBar state={editor.saveState} error={editor.saveError} label="Salvar perfil" onSave={editor.save} disabled={Object.keys(errors).length > 0} />
    </div>
  );
}
