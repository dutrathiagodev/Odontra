import { describe, expect, it } from "vitest";
import { confirmLinkCopy, parseConfirmLink } from "@/presentation/auth/confirm-link";

const parse = (query: string) => parseConfirmLink(new URLSearchParams(query));

describe("parseConfirmLink", () => {
  it("lê token_hash + type dos templates do Odontra", () => {
    expect(parse("token_hash=abc123&type=recovery&next=/redefinir-senha")).toEqual({
      kind: "otp",
      tokenHash: "abc123",
      type: "recovery",
      next: "/redefinir-senha",
    });
  });

  it("lê o code do fluxo PKCE", () => {
    expect(parse("code=xyz&next=/painel")).toEqual({ kind: "code", code: "xyz", next: "/painel" });
  });

  it("recusa tipo desconhecido ou token ausente", () => {
    expect(parse("token_hash=abc&type=magiclink_hack")).toBeNull();
    expect(parse("type=email")).toBeNull();
    expect(parse("")).toBeNull();
  });

  it("recusa token com espaço ou grande demais", () => {
    expect(parse("token_hash=a%20b&type=email")).toBeNull();
    expect(parse(`token_hash=${"a".repeat(600)}&type=email`)).toBeNull();
  });

  it.each(["//evil.com", "https://evil.com", "/\\evil.com"])("não deixa o next %j sair do site", (next) => {
    expect(parse(`token_hash=abc&type=email&next=${encodeURIComponent(next)}`)?.next).toBe("/painel");
  });

  it("sem next, vai para o painel", () => {
    expect(parse("token_hash=abc&type=email")?.next).toBe("/painel");
  });
});

describe("confirmLinkCopy", () => {
  it("link de nova senha mostra Criar nova senha", () => {
    expect(confirmLinkCopy({ kind: "otp", tokenHash: "a", type: "recovery", next: "/redefinir-senha" }).button).toBe("Criar nova senha");
    expect(confirmLinkCopy({ kind: "code", code: "a", next: "/redefinir-senha" }).button).toBe("Criar nova senha");
  });

  it("confirmação de cadastro mostra Confirmar e entrar", () => {
    expect(confirmLinkCopy({ kind: "otp", tokenHash: "a", type: "email", next: "/painel" }).button).toBe("Confirmar e entrar");
    expect(confirmLinkCopy({ kind: "code", code: "a", next: "/painel" }).button).toBe("Confirmar e entrar");
  });

  it("troca de e-mail tem título próprio", () => {
    expect(confirmLinkCopy({ kind: "otp", tokenHash: "a", type: "email_change", next: "/painel" }).title).toBe("Confirmar novo e-mail");
  });
});
