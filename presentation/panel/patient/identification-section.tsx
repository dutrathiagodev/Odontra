"use client";

import type { Identification } from "@/domain/patient/patient";
import { ChoiceField, TextField } from "../../ui/fields";
import { SectionCard } from "../../ui/section-card";

interface Props {
  value: Identification;
  onChange: (patch: Partial<Identification>) => void;
}

export function IdentificationSection({ value, onChange }: Props) {
  const text = (key: keyof Identification) => ({
    value: value[key] as string,
    onChange: (v: string) => onChange({ [key]: v }),
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Identificação do paciente">
        <TextField label="Nome completo" {...text("name")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Data de nascimento" type="date" {...text("birthDate")} />
          <ChoiceField label="Sexo" options={[{ value: "F", label: "Feminino" }, { value: "M", label: "Masculino" }]} value={value.sex} onChange={(sex) => onChange({ sex })} />
          <TextField label="CPF" inputMode="numeric" {...text("cpf")} />
          <TextField label="RG" {...text("rg")} />
          <TextField label="Órgão expedidor" {...text("issuingBody")} />
          <TextField label="Estado civil" {...text("maritalStatus")} />
          <TextField label="Naturalidade" {...text("birthplace")} />
          <TextField label="Nacionalidade" {...text("nationality")} />
          <TextField label="Profissão" {...text("occupation")} />
        </div>
      </SectionCard>

      <SectionCard title="Contato">
        <TextField label="Endereço residencial" {...text("homeAddress")} />
        <TextField label="Telefone (WhatsApp)" inputMode="tel" {...text("homePhone")} />
        <TextField label="Endereço profissional" {...text("workAddress")} />
        <TextField label="Telefone profissional" inputMode="tel" {...text("workPhone")} />
      </SectionCard>

      <SectionCard title="Convênio e indicação">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Indicação" {...text("referral")} />
          <TextField label="Convênio" {...text("insurance")} />
          <TextField label="Nº de inscrição" {...text("insuranceNumber")} />
        </div>
      </SectionCard>

      <SectionCard title="Contato para emergência">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" {...text("emergencyContact")} />
          <TextField label="Telefone" inputMode="tel" {...text("emergencyPhone")} />
        </div>
      </SectionCard>
    </div>
  );
}
