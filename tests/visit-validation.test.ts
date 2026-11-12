import { describe, expect, it } from "vitest";
import { createBlankVisit } from "@/domain/visit/visit-factory";
import type { Visit } from "@/domain/visit/visit";
import { isValidCro, normalizeVisit, validateVisit } from "@/domain/visit/validation";

const TODAY = "2026-11-12";

function visitWith(patch: Partial<Visit>): Visit {
  const v = createBlankVisit({ patientId: "p1", sequence: 1, now: new Date(2026, 10, 12, 10) });
  return { ...v, ...patch };
}

const fields = (v: Visit) => validateVisit(v, TODAY).map((i) => i.field);

describe("validateVisit", () => {
  it("consulta em branco de hoje é válida", () => {
    expect(fields(visitWith({}))).toEqual([]);
  });

  it("data obrigatória, real e não futura", () => {
    expect(fields(visitWith({ date: "" }))).toEqual(["date"]);
    expect(fields(visitWith({ date: "2026-02-30" }))).toEqual(["date"]);
    expect(fields(visitWith({ date: "2026-11-13" }))).toEqual(["date"]);
    expect(fields(visitWith({ date: "2020-01-15" }))).toEqual([]);
  });

  it("confere nome do dentista e CRO", () => {
    expect(isValidCro("12345")).toBe(true);
    expect(isValidCro("CRO-SP 12345")).toBe(true);
    expect(isValidCro("12345/RJ")).toBe(true);
    expect(isValidCro("abc")).toBe(false);
    expect(fields(visitWith({ dentist: { name: "Dra. Ana Lima", cro: "CRO-MG 9876" } }))).toEqual([]);
    expect(fields(visitWith({ dentist: { name: "4", cro: "xx" } }))).toEqual(["dentist.name", "dentist.cro"]);
  });

  it("escovação de 0 a 10 vezes por dia", () => {
    const v = visitWith({});
    expect(fields({ ...v, oralHealth: { ...v.oralHealth, brushingPerDay: "3" } })).toEqual([]);
    expect(fields({ ...v, oralHealth: { ...v.oralHealth, brushingPerDay: "30" } })).toEqual(["oralHealth.brushingPerDay"]);
  });

  it("acusa texto acima do limite", () => {
    expect(fields(visitWith({ findings: "x".repeat(5001) }))).toEqual(["findings"]);
  });
});

describe("normalizeVisit", () => {
  it("tira espaços e limpa o 'Quando?' se não há sangramento", () => {
    const v = visitWith({ reason: "  dor  ", dentist: { name: " Dra.  Ana ", cro: " cro-sp 123 " } });
    const n = normalizeVisit({ ...v, oralHealth: { ...v.oralHealth, gumBleeding: "no", gumBleedingWhen: "Ao escovar", brushingPerDay: "03" } });
    expect(n.reason).toBe("dor");
    expect(n.dentist).toEqual({ name: "Dra. Ana", cro: "CRO-SP 123" });
    expect(n.oralHealth.gumBleedingWhen).toBe("");
    expect(n.oralHealth.brushingPerDay).toBe("3");
  });
});
