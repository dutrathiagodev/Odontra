import { describe, expect, it } from "vitest";
import { isInAppNavigation, type LinkClick } from "@/presentation/navigation/leave-guard";

const base: LinkClick = {
  href: "https://app.odontra.com.br/painel/agenda",
  current: "https://app.odontra.com.br/painel/pacientes/1",
  button: 0,
  modifier: false,
};

describe("isInAppNavigation", () => {
  it("pergunta ao ir para outra tela do app", () => {
    expect(isInAppNavigation(base)).toBe(true);
    expect(isInAppNavigation({ ...base, href: "https://app.odontra.com.br/painel/pacientes/1?aba=historico" })).toBe(true);
    expect(isInAppNavigation({ ...base, target: "_self" })).toBe(true);
  });

  it("não pergunta para a mesma tela (só muda o #)", () => {
    expect(isInAppNavigation({ ...base, href: "https://app.odontra.com.br/painel/pacientes/1#anamnese" })).toBe(false);
  });

  it("não pergunta ao abrir em nova aba ou baixar", () => {
    expect(isInAppNavigation({ ...base, modifier: true })).toBe(false);
    expect(isInAppNavigation({ ...base, button: 1 })).toBe(false);
    expect(isInAppNavigation({ ...base, target: "_blank" })).toBe(false);
    expect(isInAppNavigation({ ...base, download: true })).toBe(false);
  });

  it("deixa outros sites e protocolos com o aviso do navegador", () => {
    expect(isInAppNavigation({ ...base, href: "https://wa.me/5511999999999" })).toBe(false);
    expect(isInAppNavigation({ ...base, href: "tel:+5511999999999" })).toBe(false);
    expect(isInAppNavigation({ ...base, href: "mailto:a@b.com" })).toBe(false);
    expect(isInAppNavigation({ ...base, href: "não é url" })).toBe(false);
  });
});
