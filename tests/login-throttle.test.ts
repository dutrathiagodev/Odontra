import { describe, expect, it } from "vitest";
import { authErrorMessage, isInvalidCredentials } from "@/presentation/auth/auth-errors";
import { EMPTY_THROTTLE, FREE_ATTEMPTS, formatCountdown, lockSecondsFor, parseThrottle, registerFailure, secondsLeft } from "@/presentation/auth/login-throttle";

describe("lockSecondsFor", () => {
  it("deixa as primeiras tentativas livres", () => {
    for (let failures = 0; failures < FREE_ATTEMPTS; failures++) expect(lockSecondsFor(failures)).toBe(0);
  });

  it("dobra a espera a cada erro e para em 15 minutos", () => {
    expect(lockSecondsFor(FREE_ATTEMPTS)).toBe(30);
    expect(lockSecondsFor(FREE_ATTEMPTS + 1)).toBe(60);
    expect(lockSecondsFor(FREE_ATTEMPTS + 2)).toBe(120);
    expect(lockSecondsFor(FREE_ATTEMPTS + 10)).toBe(900);
    expect(lockSecondsFor(1000)).toBe(900);
  });
});

describe("registerFailure e secondsLeft", () => {
  it("só trava a partir da terceira senha errada", () => {
    const now = 1_000_000;
    let state = EMPTY_THROTTLE;
    state = registerFailure(state, now);
    state = registerFailure(state, now);
    expect(secondsLeft(state, now)).toBe(0);
    state = registerFailure(state, now);
    expect(state.failures).toBe(3);
    expect(secondsLeft(state, now)).toBe(30);
    expect(secondsLeft(state, now + 29_001)).toBe(1);
    expect(secondsLeft(state, now + 30_000)).toBe(0);
  });
});

describe("parseThrottle", () => {
  it("lê o estado salvo", () => {
    expect(parseThrottle(JSON.stringify({ failures: 4, lockedUntil: 123 }))).toEqual({ failures: 4, lockedUntil: 123 });
  });

  it.each([null, "", "{", "[]", '{"failures":-1,"lockedUntil":0}', '{"failures":"x","lockedUntil":0}', '{"failures":1.5,"lockedUntil":0}'])("valor estranho %j vira estado limpo", (raw) => {
    expect(parseThrottle(raw)).toEqual(EMPTY_THROTTLE);
  });
});

describe("formatCountdown", () => {
  it("mostra minutos e segundos", () => {
    expect(formatCountdown(25)).toBe("0:25");
    expect(formatCountdown(120)).toBe("2:00");
    expect(formatCountdown(900)).toBe("15:00");
    expect(formatCountdown(-3)).toBe("0:00");
  });
});

describe("erros do Supabase Auth", () => {
  it("reconhece senha errada", () => {
    expect(isInvalidCredentials({ code: "invalid_credentials" })).toBe(true);
    expect(isInvalidCredentials({ message: "Invalid login credentials" })).toBe(true);
    expect(isInvalidCredentials({ code: "over_request_rate_limit" })).toBe(false);
    expect(isInvalidCredentials(null)).toBe(false);
  });

  it("explica a falha do captcha", () => {
    expect(authErrorMessage({ code: "captcha_failed", message: "captcha protection: request disallowed" })).toMatch(/verificação de segurança/);
  });
});
