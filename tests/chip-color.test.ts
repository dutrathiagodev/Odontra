import { describe, expect, it } from "vitest";
import { chipColor } from "@/presentation/agenda/chip-color";

describe("chipColor", () => {
  it("devolve sempre a mesma cor para o mesmo nome", () => {
    expect(chipColor("Maria Souza")).toBe(chipColor("Maria Souza"));
    expect(chipColor("")).toBe(chipColor(""));
  });

  it("devolve uma cor completa da paleta", () => {
    for (const nome of ["Ana", "João", "Limpeza", "x".repeat(500), "😀 paciente"]) {
      const cor = chipColor(nome);
      expect(cor.bg).toMatch(/^#[0-9a-f]{6}$/);
      expect(cor.fg).toMatch(/^#[0-9a-f]{6}$/);
      expect(cor.bar).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("espalha nomes diferentes por mais de uma cor", () => {
    const cores = new Set(["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabi", "Hugo"].map((n) => chipColor(n).bar));
    expect(cores.size).toBeGreaterThan(1);
  });
});
