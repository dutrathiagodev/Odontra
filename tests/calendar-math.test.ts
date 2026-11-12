import { describe, expect, it } from "vitest";
import { dayKey, monthGrid, sameDay } from "@/presentation/agenda/calendar-math";

describe("monthGrid", () => {
  it.each([
    [2026, 10], // novembro de 2026: dia 1 cai num domingo
    [2026, 1], // fevereiro de 2026: começa no domingo e tem 28 dias
    [2026, 4], // maio de 2026: começa na sexta
    [2024, 1], // fevereiro de 2024: ano bissexto
  ])("tem 42 dias seguidos começando no domingo (%i-%i)", (ano, mes) => {
    const grade = monthGrid(new Date(ano, mes, 15));
    expect(grade).toHaveLength(42);
    expect(grade[0].getDay()).toBe(0);
    expect(grade.some((d) => sameDay(d, new Date(ano, mes, 1)))).toBe(true);
    grade.slice(1).forEach((dia, i) => {
      const anterior = grade[i];
      expect(dia.getDate() === anterior.getDate() + 1 || dia.getDate() === 1).toBe(true);
    });
  });

  it("começa no domingo antes do dia 1", () => {
    const grade = monthGrid(new Date(2026, 4, 1));
    expect(dayKey(grade[0])).toBe("2026-04-26");
    expect(dayKey(grade[41])).toBe("2026-06-06");
  });
});

describe("dayKey", () => {
  it("formata ano-mês-dia com zeros à esquerda, no horário local", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(dayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});
