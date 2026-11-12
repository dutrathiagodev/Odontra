"use client";

import type { ClinicalExam, OralHealth, Visit } from "@/domain/visit/visit";
import { CLINICAL_OPTIONS, toChoices } from "@/domain/visit/clinical-options";
import { CLINICAL_EXAM_LIMITS, ORAL_HEALTH_LIMITS, VISIT_LIMITS } from "@/domain/visit/validation";
import { digitsOnly } from "@/domain/patient/validation";
import { ChoiceField, TextAreaField, TextField, YesNoField } from "../../ui/fields";
import { SectionCard } from "../../ui/section-card";

export function ConsultationSection({ visit, onChange, today }: { visit: Visit; onChange: (patch: Partial<Visit>) => void; today: string }) {
  return (
    <SectionCard title="Consulta">
      <TextField label="Data" name="date" type="date" required max={today} value={visit.date} onChange={(date) => onChange({ date })} />
      <TextField label="Motivo da consulta" name="reason" autoCapitalize="sentences" maxLength={VISIT_LIMITS.reason} value={visit.reason} onChange={(reason) => onChange({ reason })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Cirurgião-dentista" name="dentist.name" autoComplete="name" autoCapitalize="words" maxLength={VISIT_LIMITS.dentistName} value={visit.dentist.name} onChange={(name) => onChange({ dentist: { ...visit.dentist, name } })} />
        <TextField label="CRO" name="dentist.cro" autoComplete="off" autoCapitalize="characters" placeholder="Ex.: CRO-SP 12345" enterKeyHint="done" maxLength={VISIT_LIMITS.cro} value={visit.dentist.cro} onChange={(cro) => onChange({ dentist: { ...visit.dentist, cro } })} />
      </div>
    </SectionCard>
  );
}

export function OralHealthSection({ value, onChange }: { value: OralHealth; onChange: (patch: Partial<OralHealth>) => void }) {
  return (
    <SectionCard title="Saúde bucal">
      <YesNoField label="Teve reação com anestesia dental?" value={value.anesthesiaReaction} onChange={(anesthesiaReaction) => onChange({ anesthesiaReaction })} />
      <YesNoField label="Sangramento na gengiva?" value={value.gumBleeding} onChange={(gumBleeding) => onChange({ gumBleeding })} />
      {value.gumBleeding === "yes" && <TextField label="Quando?" name="oralHealth.gumBleedingWhen" autoCapitalize="sentences" maxLength={ORAL_HEALTH_LIMITS.gumBleedingWhen} value={value.gumBleedingWhen} onChange={(gumBleedingWhen) => onChange({ gumBleedingWhen })} />}
      <YesNoField label="Costuma ranger os dentes?" value={value.bruxism} onChange={(bruxism) => onChange({ bruxism })} />
      <YesNoField label="Sente dor nos dentes ou gengiva?" value={value.toothOrGumPain} onChange={(toothOrGumPain) => onChange({ toothOrGumPain })} />
      <YesNoField label="Sente gosto ruim ou boca seca?" value={value.badTaste} onChange={(badTaste) => onChange({ badTaste })} />
      <YesNoField label="Dor no maxilar ou ouvido?" value={value.jawOrEarPain} onChange={(jawOrEarPain) => onChange({ jawOrEarPain })} />
      <YesNoField label="Fumante?" value={value.smoker} onChange={(smoker) => onChange({ smoker })} />
      <YesNoField label="Utiliza fio dental?" value={value.flosses} onChange={(flosses) => onChange({ flosses })} />
      <TextField label="Último tratamento dentário" name="oralHealth.lastTreatment" autoCapitalize="sentences" maxLength={ORAL_HEALTH_LIMITS.lastTreatment} value={value.lastTreatment} onChange={(lastTreatment) => onChange({ lastTreatment })} />
      <TextField
        label="Escova os dentes quantas vezes ao dia?"
        name="oralHealth.brushingPerDay"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        className="max-w-40"
        value={value.brushingPerDay}
        format={(v) => digitsOnly(v, 2)}
        onChange={(brushingPerDay) => onChange({ brushingPerDay })}
      />
    </SectionCard>
  );
}

export function ClinicalExamSection({ value, onChange }: { value: ClinicalExam; onChange: (patch: Partial<ClinicalExam>) => void }) {
  return (
    <SectionCard title="Exame clínico">
      <ChoiceField label="Higiene" options={toChoices(CLINICAL_OPTIONS.hygiene)} value={value.hygiene} onChange={(hygiene) => onChange({ hygiene })} />
      <ChoiceField label="Halitose" options={toChoices(CLINICAL_OPTIONS.halitosis)} value={value.halitosis} onChange={(halitosis) => onChange({ halitosis })} />
      <ChoiceField label="Tártaro" options={toChoices(CLINICAL_OPTIONS.tartar)} value={value.tartar} onChange={(tartar) => onChange({ tartar })} />
      <ChoiceField label="Gengiva" options={toChoices(CLINICAL_OPTIONS.gingiva)} value={value.gingiva} onChange={(gingiva) => onChange({ gingiva })} />
      <ChoiceField label="Mucosa" options={toChoices(CLINICAL_OPTIONS.mucosa)} value={value.mucosa} onChange={(mucosa) => onChange({ mucosa })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Língua" name="clinicalExam.tongue" autoCapitalize="sentences" maxLength={CLINICAL_EXAM_LIMITS.tongue} value={value.tongue} onChange={(tongue) => onChange({ tongue })} />
        <TextField label="Palato" name="clinicalExam.palate" autoCapitalize="sentences" maxLength={CLINICAL_EXAM_LIMITS.palate} value={value.palate} onChange={(palate) => onChange({ palate })} />
        <TextField label="Assoalho bucal" name="clinicalExam.mouthFloor" autoCapitalize="sentences" maxLength={CLINICAL_EXAM_LIMITS.mouthFloor} value={value.mouthFloor} onChange={(mouthFloor) => onChange({ mouthFloor })} />
        <TextField label="Lábios" name="clinicalExam.lips" autoCapitalize="sentences" maxLength={CLINICAL_EXAM_LIMITS.lips} enterKeyHint="done" value={value.lips} onChange={(lips) => onChange({ lips })} />
      </div>
    </SectionCard>
  );
}

export function FindingsSection({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <SectionCard title="Alterações e procedimentos" description="Evolução clínica desta consulta. Sai no PDF.">
      <TextAreaField label="Descrição" name="findings" maxLength={VISIT_LIMITS.findings} value={value} onChange={onChange} rows={8} />
    </SectionCard>
  );
}
