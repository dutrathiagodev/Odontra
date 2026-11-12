import { describe, expect, it } from "vitest";
import { cpfMatches, maskCpf } from "@/domain/patient/cpf";

describe("maskCpf", () => {
  it("mostra só os 6 dígitos do meio", () => {
    expect(maskCpf("123.456.789-00")).toBe("***.456.789-**");
    expect(maskCpf("12345678900")).toBe("***.456.789-**");
  });

  it("vazio continua vazio e formato estranho não vaza dígitos", () => {
    expect(maskCpf("")).toBe("");
    expect(maskCpf("123")).toBe("***");
  });
});

describe("cpfMatches", () => {
  const masked = maskCpf("123.456.789-00");

  it("acha pelo CPF inteiro", () => {
    expect(cpfMatches(masked, "12345678900")).toBe(true);
    expect(cpfMatches(masked, "99945678911")).toBe(true); // mesmos 6 do meio: a lista mostra os dois
    expect(cpfMatches(masked, "12345600000")).toBe(false);
  });

  it("acha por pedaço dos dígitos visíveis", () => {
    expect(cpfMatches(masked, "4567")).toBe(true);
    expect(cpfMatches(masked, "0000")).toBe(false);
  });

  it("sem CPF não bate com nada", () => {
    expect(cpfMatches("", "123")).toBe(false);
  });
});
