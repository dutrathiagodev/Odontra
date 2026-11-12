"use client";

import { DISEASE_CATEGORIES, type Anamnesis, type Identification } from "@/domain/patient/patient";
import { ANAMNESIS_LIMITS, digitsOnly, formatBloodPressure } from "@/domain/patient/validation";
import { CheckboxGroup, ChoiceField, TextAreaField, TextField, YesNoField } from "../../ui/fields";
import { SectionCard } from "../../ui/section-card";

interface Props {
  value: Anamnesis;
  onChange: (patch: Partial<Anamnesis>) => void;
  /** Sexo informado nos dados: "Gestante?" não aparece para paciente do sexo masculino. */
  sex: Identification["sex"];
}

type TextKey = keyof typeof ANAMNESIS_LIMITS;

export function AnamnesisSection({ value, onChange, sex }: Props) {
  const text = (key: TextKey) => ({
    name: `anamnesis.${key}`,
    value: value[key],
    maxLength: ANAMNESIS_LIMITS[key],
    onChange: (v: string) => onChange({ [key]: v }),
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Queixa principal">
        <TextAreaField label="Queixa principal e história da doença atual" rows={4} {...text("chiefComplaint")} />
      </SectionCard>

      <SectionCard title="Saúde geral">
        <YesNoField label="Faz uso de medicação?" value={value.usesMedication} onChange={(usesMedication) => onChange({ usesMedication })} />
        {value.usesMedication === "yes" && <TextField label="Qual medicação?" required autoCapitalize="sentences" {...text("medication")} />}
        <TextField
          label="Pressão arterial"
          inputMode="numeric"
          autoComplete="off"
          placeholder="120/80"
          hint="Em mmHg. A barra entra sozinha."
          format={formatBloodPressure}
          {...text("bloodPressure")}
        />

        <YesNoField label="Tem alergia?" value={value.allergy} onChange={(allergy) => onChange({ allergy })} />
        {value.allergy === "yes" && <TextField label="Alergia a quê?" required autoCapitalize="sentences" placeholder="Ex.: penicilina, látex" {...text("allergyDetail")} />}

        <YesNoField label="Possui alguma doença?" value={value.hasDisease} onChange={(hasDisease) => onChange({ hasDisease })} />
        {value.hasDisease === "yes" && (
          <>
            <CheckboxGroup label="Tipo" options={DISEASE_CATEGORIES} value={value.diseaseCategories} onChange={(diseaseCategories) => onChange({ diseaseCategories })} />
            <TextField label="Especificar" autoCapitalize="sentences" {...text("diseaseDetail")} />
          </>
        )}

        <YesNoField label="Passou por alguma cirurgia?" value={value.hadSurgery} onChange={(hadSurgery) => onChange({ hadSurgery })} />
        {value.hadSurgery === "yes" && <TextField label="Qual cirurgia?" required autoCapitalize="sentences" {...text("surgeryDetail")} />}

        <ChoiceField label="Quando se fere, o sangramento é" options={[{ value: "normal", label: "Normal" }, { value: "excessive", label: "Excessivo" }]} value={value.bleeding} onChange={(bleeding) => onChange({ bleeding })} />
        <ChoiceField label="Cicatrização" options={[{ value: "normal", label: "Normal" }, { value: "complicated", label: "Complicada" }]} value={value.healing} onChange={(healing) => onChange({ healing })} />

        <YesNoField label="Sente falta de ar?" value={value.shortnessOfBreath} onChange={(shortnessOfBreath) => onChange({ shortnessOfBreath })} />
        {value.shortnessOfBreath === "yes" && <TextField label="Frequência" autoCapitalize="sentences" placeholder="Ex.: ao subir escadas" {...text("shortnessFrequency")} />}

        {sex !== "M" && (
          <>
            <YesNoField label="Gestante?" value={value.pregnant} onChange={(pregnant) => onChange({ pregnant })} />
            {value.pregnant === "yes" && (
              <TextField
                label="Semanas de gestação"
                required
                inputMode="numeric"
                autoComplete="off"
                placeholder="1 a 42"
                enterKeyHint="done"
                className="max-w-40"
                {...text("pregnancyWeeks")}
                format={(v) => digitsOnly(v, 2)}
              />
            )}
          </>
        )}
      </SectionCard>

      <SectionCard title="Antecedentes familiares e observações">
        <TextAreaField label="Antecedentes familiares" {...text("familyHistory")} />
        <TextAreaField label="Observações" {...text("notes")} />
      </SectionCard>
    </div>
  );
}
