"use client";

import type { Identification } from "@/domain/patient/patient";
import { ageOn, formatCpf, formatPhone, IDENTIFICATION_LIMITS, minBirthDate } from "@/domain/patient/validation";
import { ChoiceField, TextField } from "../../ui/fields";
import { SectionCard } from "../../ui/section-card";

interface Props {
  value: Identification;
  onChange: (patch: Partial<Identification>) => void;
  /** Hoje (AAAA-MM-DD), para limitar a data de nascimento e mostrar a idade. */
  today: string;
}

type TextKey = Exclude<keyof Identification, "sex">;

export function IdentificationSection({ value, onChange, today }: Props) {
  // Liga o campo ao registro: valor, caminho para a validação e limite de tamanho.
  const text = (key: TextKey) => ({
    name: `identification.${key}`,
    value: value[key],
    maxLength: IDENTIFICATION_LIMITS[key],
    onChange: (v: string) => onChange({ [key]: v }),
  });
  // Os dados são do paciente, não de quem usa o aparelho: o preenchimento automático atrapalharia.
  const phone = { type: "tel", inputMode: "tel" as const, autoComplete: "off", format: formatPhone, placeholder: "(11) 98765-4321" };
  const words = { autoComplete: "off", autoCapitalize: "words" as const };

  const age = value.birthDate && value.birthDate <= today ? ageOn(value.birthDate, today) : null;

  return (
    <div className="space-y-4">
      <SectionCard title="Identificação do paciente">
        <TextField label="Nome completo" required {...words} {...text("name")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Data de nascimento"
            type="date"
            min={minBirthDate(today)}
            max={today}
            hint={age !== null && age >= 0 ? (age === 1 ? "1 ano" : `${age} anos`) : undefined}
            {...text("birthDate")}
          />
          <ChoiceField label="Sexo" options={[{ value: "F", label: "Feminino" }, { value: "M", label: "Masculino" }]} value={value.sex} onChange={(sex) => onChange({ sex })} />
          <TextField label="CPF" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" format={formatCpf} {...text("cpf")} />
          <TextField label="RG" autoComplete="off" autoCapitalize="characters" {...text("rg")} />
          <TextField label="Órgão expedidor" autoComplete="off" autoCapitalize="characters" placeholder="Ex.: SSP-SP" {...text("issuingBody")} />
          <TextField label="Estado civil" {...words} {...text("maritalStatus")} />
          <TextField label="Naturalidade" {...words} {...text("birthplace")} />
          <TextField label="Nacionalidade" {...words} {...text("nationality")} />
          <TextField label="Profissão" {...words} {...text("occupation")} />
        </div>
      </SectionCard>

      <SectionCard title="Contato">
        <TextField label="Endereço residencial" {...words} {...text("homeAddress")} />
        <TextField label="Telefone (WhatsApp)" {...phone} {...text("homePhone")} />
        <TextField label="Endereço profissional" {...words} {...text("workAddress")} />
        <TextField label="Telefone profissional" {...phone} placeholder="(11) 3456-7890" {...text("workPhone")} />
      </SectionCard>

      <SectionCard title="Convênio e indicação">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Indicação" {...words} {...text("referral")} />
          <TextField label="Convênio" {...words} {...text("insurance")} />
          <TextField label="Nº de inscrição" autoComplete="off" autoCapitalize="characters" {...text("insuranceNumber")} />
        </div>
      </SectionCard>

      <SectionCard title="Contato para emergência">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" {...words} {...text("emergencyContact")} />
          <TextField label="Telefone" {...phone} enterKeyHint="done" {...text("emergencyPhone")} />
        </div>
      </SectionCard>
    </div>
  );
}
