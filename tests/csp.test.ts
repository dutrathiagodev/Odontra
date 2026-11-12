import { describe, expect, it } from "vitest";
import { buildCsp, createNonce } from "@/infrastructure/security/csp";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d === name || d.startsWith(`${name} `)) ?? "";

const base = { nonce: "abc123==", isDev: false, supabaseUrl: "https://projeto.supabase.co", turnstile: false };

describe("buildCsp", () => {
  it("em produção, script só com nonce + strict-dynamic, sem unsafe-inline nem unsafe-eval", () => {
    const script = directive(buildCsp(base), "script-src");
    expect(script).toContain("'nonce-abc123=='");
    expect(script).toContain("'strict-dynamic'");
    expect(script).not.toContain("'unsafe-inline'");
    expect(script).not.toContain("'unsafe-eval'");
  });

  it("em desenvolvimento libera unsafe-eval e o Supabase local, sem upgrade-insecure-requests", () => {
    const csp = buildCsp({ ...base, isDev: true });
    expect(directive(csp, "script-src")).toContain("'unsafe-eval'");
    expect(directive(csp, "script-src")).not.toContain("'unsafe-inline'");
    expect(directive(csp, "connect-src")).toContain("http://127.0.0.1:54321");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("mantém as demais proteções", () => {
    const csp = buildCsp(base);
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(directive(csp, "base-uri")).toBe("base-uri 'self'");
    expect(directive(csp, "form-action")).toBe("form-action 'self'");
    expect(directive(csp, "connect-src")).toContain("https://projeto.supabase.co");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("só libera o Turnstile quando o captcha está ligado", () => {
    expect(buildCsp(base)).not.toContain("challenges.cloudflare.com");
    const csp = buildCsp({ ...base, turnstile: true });
    for (const name of ["script-src", "frame-src", "connect-src"]) {
      expect(directive(csp, name)).toContain("https://challenges.cloudflare.com");
    }
    expect(directive(csp, "img-src")).not.toContain("challenges.cloudflare.com");
  });
});

describe("createNonce", () => {
  it("gera base64 de 128 bits, diferente a cada chamada", () => {
    const a = createNonce();
    const b = createNonce();
    expect(a).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(a).not.toBe(b);
  });
});
