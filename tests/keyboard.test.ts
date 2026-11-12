import { describe, expect, it } from "vitest";
import { arrowTarget, trapTarget } from "@/presentation/ui/keyboard";

describe("arrowTarget", () => {
  it("avança e volta com as setas, dando a volta nas pontas", () => {
    expect(arrowTarget("ArrowRight", 0, 3)).toBe(1);
    expect(arrowTarget("ArrowDown", 2, 3)).toBe(0);
    expect(arrowTarget("ArrowLeft", 0, 3)).toBe(2);
    expect(arrowTarget("ArrowUp", 1, 3)).toBe(0);
  });

  it("Home e End vão para as pontas", () => {
    expect(arrowTarget("Home", 2, 3)).toBe(0);
    expect(arrowTarget("End", 0, 3)).toBe(2);
  });

  it("sem opção selecionada (-1), a seta para a direita vai para a primeira", () => {
    expect(arrowTarget("ArrowRight", -1, 3)).toBe(0);
    expect(arrowTarget("ArrowLeft", -1, 3)).toBe(1);
  });

  it("ignora outras teclas e listas vazias", () => {
    expect(arrowTarget("Enter", 0, 3)).toBeNull();
    expect(arrowTarget("a", 0, 3)).toBeNull();
    expect(arrowTarget("ArrowRight", 0, 0)).toBeNull();
  });
});

describe("trapTarget", () => {
  it("Tab no último volta para o primeiro; Shift+Tab no primeiro vai para o último", () => {
    expect(trapTarget(2, 3, false)).toBe(0);
    expect(trapTarget(0, 3, true)).toBe(2);
  });

  it("no meio, deixa o navegador seguir", () => {
    expect(trapTarget(1, 3, false)).toBeNull();
    expect(trapTarget(1, 3, true)).toBeNull();
  });

  it("foco fora do diálogo volta para dentro", () => {
    expect(trapTarget(-1, 3, false)).toBe(0);
    expect(trapTarget(-1, 3, true)).toBe(2);
  });

  it("sem focáveis, não faz nada", () => {
    expect(trapTarget(0, 0, false)).toBeNull();
  });
});
