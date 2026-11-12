import { describe, expect, it } from "vitest";
import { createBlankPatient } from "@/domain/patient/patient-factory";
import type { Patient } from "@/domain/patient/patient";
import {
  ageOn,
  formatBloodPressure,
  formatCpf,
  formatPhone,
  isValidBloodPressure,
  isValidCpf,
  isValidPhone,
  isValidRg,
  minBirthDate,
  nameIssue,
  normalizePatient,
  parseIsoDate,
  validatePatient,
} from "@/domain/patient/validation";

const TODAY = "2026-11-12";

function patientWith(patch: { identification?: Partial<Patient["identification"]>; anamnesis?: Partial<Patient["anamnesis"]> }): Patient {
  const p = createBlankPatient(1, new Date("2026-11-12T12:00:00Z"));
  return {
    ...p,
    identification: { ...p.identification, name: "Maria Souza", ...patch.identification },
    anamnesis: { ...p.anamnesis, ...patch.anamnesis },
  };
}

const fields = (p: Patient) => validatePatient(p, TODAY).map((i) => i.field);

describe("CPF", () => {
  it("aplica a máscara enquanto digita", () => {
    expect(formatCpf("123")).toBe("123");
    expect(formatCpf("1234")).toBe("123.4");
    expect(formatCpf("1234567")).toBe("123.456.7");
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(formatCpf("529.982.247-2599")).toBe("529.982.247-25");
  });

  it("confere os dígitos verificadores", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("1234")).toBe(false);
  });

  it("CPF vazio é aceito; incompleto ou errado não", () => {
    expect(fields(patientWith({ identification: { cpf: "" } }))).toEqual([]);
    expect(validatePatient(patientWith({ identification: { cpf: "123.456" } }), TODAY)[0].message).toMatch(/11 dígitos/);
    expect(validatePatient(patientWith({ identification: { cpf: "529.982.247-24" } }), TODAY)[0].message).toMatch(/confira/);
  });
});

describe("telefone", () => {
  it("formata celular e fixo", () => {
    expect(formatPhone("11")).toBe("(11");
    expect(formatPhone("119")).toBe("(11) 9");
    expect(formatPhone("1134567890")).toBe("(11) 3456-7890");
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("+55 11 98765-4321")).toBe("(11) 98765-4321");
  });

  it("valida DDD, fixo e celular", () => {
    expect(isValidPhone("(11) 98765-4321")).toBe(true);
    expect(isValidPhone("(21) 3456-7890")).toBe(true);
    expect(isValidPhone("(11) 88765-4321")).toBe(false); // 11 dígitos sem o 9
    expect(isValidPhone("(11) 9876-5432")).toBe(false); // fixo começando com 9
    expect(isValidPhone("(01) 3456-7890")).toBe(false); // DDD inválido
    expect(isValidPhone("98765")).toBe(false);
  });
});

describe("nome", () => {
  it("é obrigatório, com 3 letras ou mais e sem números", () => {
    expect(nameIssue("")).toMatch(/Informe/);
    expect(nameIssue("   ")).toMatch(/Informe/);
    expect(nameIssue("Al")).toMatch(/3 letras/);
    expect(nameIssue("Maria 2")).toMatch(/letras/);
    expect(nameIssue("Ana")).toBeNull();
    expect(nameIssue("João D'Ávila-Neto")).toBeNull();
  });

  it("aparece primeiro na lista de problemas", () => {
    const issues = validatePatient(patientWith({ identification: { name: "", cpf: "1" }, anamnesis: { usesMedication: "yes" } }), TODAY);
    expect(issues[0].field).toBe("identification.name");
    expect(issues.map((i) => i.field)).toEqual(["identification.name", "identification.cpf", "anamnesis.medication"]);
  });
});

describe("data de nascimento", () => {
  it("lê só datas que existem", () => {
    expect(parseIsoDate("2024-02-29")).not.toBeNull();
    expect(parseIsoDate("2025-02-29")).toBeNull();
    expect(parseIsoDate("12/11/2026")).toBeNull();
  });

  it("calcula a idade em anos completos", () => {
    expect(ageOn("2000-11-12", TODAY)).toBe(26);
    expect(ageOn("2000-11-13", TODAY)).toBe(25);
    expect(minBirthDate(TODAY)).toBe("1906-11-12");
  });

  it("não aceita futuro nem mais de 120 anos", () => {
    expect(fields(patientWith({ identification: { birthDate: "2026-11-13" } }))).toEqual(["identification.birthDate"]);
    expect(fields(patientWith({ identification: { birthDate: "1900-01-01" } }))).toEqual(["identification.birthDate"]);
    expect(fields(patientWith({ identification: { birthDate: TODAY } }))).toEqual([]);
    expect(fields(patientWith({ identification: { birthDate: "1990-05-20" } }))).toEqual([]);
  });

  it("sem a data de hoje (pré-render), não acusa data no futuro", () => {
    expect(validatePatient(patientWith({ identification: { birthDate: "2030-01-01" } }), "")).toEqual([]);
  });
});

describe("RG", () => {
  it("aceita formatos estaduais comuns", () => {
    expect(isValidRg("12.345.678-9")).toBe(true);
    expect(isValidRg("MG-12.345.678")).toBe(true);
    expect(isValidRg("1234")).toBe(false);
    expect(isValidRg("ABCDEF")).toBe(false);
    expect(isValidRg("123456789012345")).toBe(false);
  });
});

describe("contato de emergência", () => {
  it("nome e telefone andam juntos", () => {
    expect(fields(patientWith({ identification: { emergencyContact: "José Lima" } }))).toEqual(["identification.emergencyPhone"]);
    expect(fields(patientWith({ identification: { emergencyPhone: "(11) 98765-4321" } }))).toEqual(["identification.emergencyContact"]);
    expect(fields(patientWith({ identification: { emergencyContact: "José Lima", emergencyPhone: "(11) 98765-4321" } }))).toEqual([]);
  });
});

describe("anamnese", () => {
  it("pede o detalhe quando a resposta é Sim", () => {
    expect(fields(patientWith({ anamnesis: { usesMedication: "yes" } }))).toEqual(["anamnesis.medication"]);
    expect(fields(patientWith({ anamnesis: { usesMedication: "yes", medication: "Losartana" } }))).toEqual([]);
    expect(fields(patientWith({ anamnesis: { allergy: "yes" } }))).toEqual(["anamnesis.allergyDetail"]);
    expect(fields(patientWith({ anamnesis: { hadSurgery: "yes" } }))).toEqual(["anamnesis.surgeryDetail"]);
    expect(fields(patientWith({ anamnesis: { hasDisease: "yes" } }))).toEqual(["anamnesis.diseaseDetail"]);
    expect(fields(patientWith({ anamnesis: { hasDisease: "yes", diseaseCategories: ["Diabetes"] } }))).toEqual([]);
    expect(fields(patientWith({ anamnesis: { usesMedication: "no" } }))).toEqual([]);
  });

  it("semanas de gestação de 1 a 42, só para gestante", () => {
    expect(fields(patientWith({ anamnesis: { pregnant: "yes" } }))).toEqual(["anamnesis.pregnancyWeeks"]);
    expect(fields(patientWith({ anamnesis: { pregnant: "yes", pregnancyWeeks: "43" } }))).toEqual(["anamnesis.pregnancyWeeks"]);
    expect(fields(patientWith({ anamnesis: { pregnant: "yes", pregnancyWeeks: "0" } }))).toEqual(["anamnesis.pregnancyWeeks"]);
    expect(fields(patientWith({ anamnesis: { pregnant: "yes", pregnancyWeeks: "12" } }))).toEqual([]);
    expect(fields(patientWith({ anamnesis: { pregnant: "no", pregnancyWeeks: "99" } }))).toEqual([]);
  });

  it("pressão arterial no formato 120/80", () => {
    expect(formatBloodPressure("12080")).toBe("120/80");
    expect(formatBloodPressure("9060")).toBe("90/60");
    expect(formatBloodPressure("120")).toBe("120");
    expect(formatBloodPressure("12x8")).toBe("12/8");
    expect(formatBloodPressure("abc")).toBe("");
    expect(isValidBloodPressure("120/80")).toBe(true);
    expect(isValidBloodPressure("80/120")).toBe(false);
    expect(isValidBloodPressure("12/8")).toBe(false);
    expect(isValidBloodPressure("300/80")).toBe(false);
    expect(fields(patientWith({ anamnesis: { bloodPressure: "12/8" } }))).toEqual(["anamnesis.bloodPressure"]);
  });

  it("acusa texto acima do limite", () => {
    expect(fields(patientWith({ anamnesis: { notes: "x".repeat(2001) } }))).toEqual(["anamnesis.notes"]);
    expect(fields(patientWith({ identification: { occupation: "x".repeat(61) } }))).toEqual(["identification.occupation"]);
  });
});

describe("normalizePatient", () => {
  it("tira espaços, padroniza máscaras e limpa respostas que deixaram de valer", () => {
    const p = normalizePatient(
      patientWith({
        identification: { name: "  Maria   da  Silva ", cpf: "52998224725", homePhone: "11987654321", sex: "M" },
        anamnesis: { usesMedication: "no", medication: "Dipirona", pregnant: "yes", pregnancyWeeks: "12", allergy: "yes", allergyDetail: " Látex " },
      }),
    );
    expect(p.identification.name).toBe("Maria da Silva");
    expect(p.identification.cpf).toBe("529.982.247-25");
    expect(p.identification.homePhone).toBe("(11) 98765-4321");
    expect(p.anamnesis.medication).toBe("");
    expect(p.anamnesis.pregnant).toBe("");
    expect(p.anamnesis.pregnancyWeeks).toBe("");
    expect(p.anamnesis.allergyDetail).toBe("Látex");
  });

  it("não mexe no registro original", () => {
    const original = patientWith({ identification: { name: " Ana " } });
    normalizePatient(original);
    expect(original.identification.name).toBe(" Ana ");
  });
});
