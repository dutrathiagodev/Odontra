import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/infrastructure/supabase/safe-next";

const ORIGEM = "http://odontra.local";

/** O destino continua no próprio site? */
function ficaNoSite(destino: string): boolean {
  return destino.startsWith("/") && new URL(destino, ORIGEM).origin === ORIGEM;
}

describe("safeNextPath", () => {
  it.each([
    ["//evil.com"],
    ["/\\evil.com"],
    ["/\t/evil.com"],
    ["https://evil.com"],
    ["evil.com"],
    ["javascript:alert(1)"],
  ])("recusa %j e volta para o painel", (next) => {
    expect(safeNextPath(next)).toBe("/painel");
  });

  it("não deixa /%09/evil.com sair do site", () => {
    const destino = safeNextPath("/%09/evil.com");
    expect(destino).not.toMatch(/^\/\//);
    expect(ficaNoSite(destino)).toBe(true);
  });

  it("aceita caminho do próprio site com query", () => {
    expect(safeNextPath("/painel?x=1")).toBe("/painel?x=1");
  });

  it("mantém o hash do caminho", () => {
    expect(safeNextPath("/painel/agenda#hoje")).toBe("/painel/agenda#hoje");
  });

  it("usa o fallback quando não há next", () => {
    expect(safeNextPath(null)).toBe("/painel");
    expect(safeNextPath(undefined)).toBe("/painel");
    expect(safeNextPath("")).toBe("/painel");
    expect(safeNextPath("//evil.com", "/entrar")).toBe("/entrar");
  });
});
