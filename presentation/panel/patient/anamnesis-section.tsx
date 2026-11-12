"use client";

import { DISEASE_CATEGORIES, type Anamnesis } from "@/domain/patient/patient";
import { CheckboxGroup, ChoiceField, TextAreaField, TextField, YesNoField } from "../../ui/fields";
import { SectionCard } from "../../ui/section-card";

interface Props {
  value: Anamnesis;
  onChange: (patch: Partial<Anamnesis>) => void;
}

export function AnamnesisSection({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Queixa principal">
        <TextAreaField label="Queixa principal e história da doença atual" value={value.chiefComplaint} onChange={(chiefComplaint) => onChange({ chiefComplaint })} rows={4} />
      </SectionCard>

      <SectionCard title="Saúde geral">
        <YesNoField label="Faz uso de medicação?" value={value.usesMedication} onChange={(usesMedication) => onChange({ usesMedication })} />
        {value.usesMedication === "yes" && <TextField label="Qual?" value={value.medication} onChange={(medication) => onChange({ medication })} />}
        <TextField label="Pressão arterial" value={value.bloodPressure} onChange={(bloodPressure) => onChange({ bloodPressure })} placeholder="Ex.: 120/80" />

        <YesNoField label="Tem alergia?" value={value.allergy} onChange={(allergy) => onChange({ allergy })} />
        {value.allergy === "yes" && <TextField label="Qual?" value={value.allergyDetail} onChange={(allergyDetail) => onChange({ allergyDetail })} />}

        <YesNoField label="Possui alguma doença?" value={value.hasDisease} onChange={(hasDisease) => onChange({ hasDisease })} />
        {value.hasDisease === "yes" && (
          <>
            <CheckboxGroup label="Tipo" options={DISEASE_CATEGORIES} value={value.diseaseCategories} onChange={(diseaseCategories) => onChange({ diseaseCategories })} />
            <TextField label="Especificar" value={value.diseaseDetail} onChange={(diseaseDetail) => onChange({ diseaseDetail })} />
          </>
        )}

        <YesNoField label="Passou por alguma cirurgia?" value={value.hadSurgery} onChange={(hadSurgery) => onChange({ hadSurgery })} />
        {value.hadSurgery === "yes" && <TextField label="Qual?" value={value.surgeryDetail} onChange={(surgeryDetail) => onChange({ surgeryDetail })} />}

        <ChoiceField label="Quando se fere, o sangramento é" options={[{ value: "normal", label: "Normal" }, { value: "excessive", label: "Excessivo" }]} value={value.bleeding} onChange={(bleeding) => onChange({ bleeding })} />
        <ChoiceField label="Cicatrização" options={[{ value: "normal", label: "Normal" }, { value: "complicated", label: "Complicada" }]} value={value.healing} onChange={(healing) => onChange({ healing })} />

        <YesNoField label="Sente falta de ar?" value={value.shortnessOfBreath} onChange={(shortnessOfBreath) => onChange({ shortnessOfBreath })} />
        {value.shortnessOfBreath === "yes" && <TextField label="Frequência" value={value.shortnessFrequency} onChange={(shortnessFrequency) => onChange({ shortnessFrequency })} />}

        <YesNoField label="Gestante?" value={value.pregnant} onChange={(pregnant) => onChange({ pregnant })} />
        {value.pregnant === "yes" && <TextField label="Semanas" inputMode="numeric" value={value.pregnancyWeeks} onChange={(pregnancyWeeks) => onChange({ pregnancyWeeks })} />}
      </SectionCard>

      <SectionCard title="Antecedentes familiares e observações">
        <TextAreaField label="Antecedentes familiares" value={value.familyHistory} onChange={(familyHistory) => onChange({ familyHistory })} />
        <TextAreaField label="Observações" value={value.notes} onChange={(notes) => onChange({ notes })} />
      </SectionCard>
    </div>
  );
}
