import { describe, expect, it } from "vitest";
import { SavePatient } from "@/application/patient/save-patient";
import { SaveVisit } from "@/application/visit/save-visit";
import { InvalidRecordError } from "@/domain/errors";
import { createBlankPatient } from "@/domain/patient/patient-factory";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import { PHOTO_MAX_CHARS, isValidPhoto } from "@/domain/patient/photo";
import { JSON_LIMITS, jsonBytes } from "@/domain/record-limits";
import { createBlankVisit } from "@/domain/visit/visit-factory";
import type { VisitRepository } from "@/domain/visit/visit-repository";
import { friendlyError } from "@/presentation/async/with-timeout";

const patients = { save: async (p) => p } as PatientRepository;
const visits = { save: async (v) => v } as VisitRepository;

describe("isValidPhoto", () => {
  it("aceita vazio e data URL JPEG, PNG e WebP", () => {
    expect(isValidPhoto("")).toBe(true);
    expect(isValidPhoto("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
    expect(isValidPhoto("data:image/png;base64,iVBORw0KGgo=")).toBe(true);
    expect(isValidPhoto("data:image/webp;base64,UklGRg==")).toBe(true);
  });

  it("recusa endereço da web, SVG, HTML e base64 com lixo", () => {
    expect(isValidPhoto("https://exemplo.com/foto.jpg")).toBe(false);
    expect(isValidPhoto("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isValidPhoto("data:text/html;base64,PGgxPg==")).toBe(false);
    expect(isValidPhoto('data:image/jpeg;base64,abc"><script>')).toBe(false);
  });

  it("recusa foto acima do limite do banco", () => {
    expect(isValidPhoto(`data:image/jpeg;base64,${"A".repeat(PHOTO_MAX_CHARS)}`)).toBe(false);
  });
});

describe("limites ao salvar", () => {
  it("salva ficha normal", async () => {
    const patient = createBlankPatient(1);
    await expect(new SavePatient(patients).execute(patient)).resolves.toMatchObject({ id: patient.id });
  });

  it("barra foto inválida antes de ir ao banco, com mensagem para a tela", async () => {
    const patient = { ...createBlankPatient(1), photo: "https://exemplo.com/foto.jpg" };
    const error = await new SavePatient(patients).execute(patient).catch((e) => e);
    expect(error).toBeInstanceOf(InvalidRecordError);
    expect(friendlyError(error)).toMatch(/foto/);
  });

  it("barra anamnese acima de 32 KB", async () => {
    const blank = createBlankPatient(1);
    const patient = { ...blank, anamnesis: { ...blank.anamnesis, notes: "a".repeat(JSON_LIMITS.anamnesis) } };
    await expect(new SavePatient(patients).execute(patient)).rejects.toBeInstanceOf(InvalidRecordError);
  });

  it("barra bloco da consulta acima de 64 KB", async () => {
    const visit = createBlankVisit({ patientId: "p1", sequence: 1 });
    const big = { ...visit, findings: "", clinicalExam: { ...visit.clinicalExam, tongue: "a".repeat(JSON_LIMITS.visitBlock) } };
    await expect(new SaveVisit(visits).execute(big)).rejects.toBeInstanceOf(InvalidRecordError);
  });

  it("conta bytes em UTF-8 (acentos pesam mais)", () => {
    expect(jsonBytes("ção")).toBe(7);
  });

  it("traduz a recusa do CHECK do banco (23514) para uma mensagem clara", () => {
    expect(friendlyError({ code: "23514", message: "violates check constraint" })).toMatch(/tamanho permitido/);
  });
});
