/**
 * Espera progressiva no login depois de senhas erradas seguidas (só no navegador, por aba).
 * Não substitui o limite do servidor (Supabase Auth + captcha); só freia tentativas em sequência
 * e deixa claro para a pessoa quanto falta esperar.
 */

/** Erros seguidos permitidos antes da primeira espera. */
export const FREE_ATTEMPTS = 3;
const FIRST_LOCK_SECONDS = 30;
const MAX_LOCK_SECONDS = 15 * 60;
export const THROTTLE_STORAGE_KEY = "odontra:login-throttle";

export interface ThrottleState {
  failures: number;
  /** Momento (ms) em que o botão volta a funcionar. 0 = livre. */
  lockedUntil: number;
}

export const EMPTY_THROTTLE: ThrottleState = { failures: 0, lockedUntil: 0 };

/** Segundos de espera depois de `failures` erros seguidos: 30 s, 60 s, 120 s… até 15 min. */
export function lockSecondsFor(failures: number): number {
  if (failures < FREE_ATTEMPTS) return 0;
  const doublings = Math.min(failures - FREE_ATTEMPTS, 10);
  return Math.min(FIRST_LOCK_SECONDS * 2 ** doublings, MAX_LOCK_SECONDS);
}

export function registerFailure(state: ThrottleState, now: number): ThrottleState {
  const failures = state.failures + 1;
  const seconds = lockSecondsFor(failures);
  return { failures, lockedUntil: seconds > 0 ? now + seconds * 1000 : 0 };
}

export function secondsLeft(state: ThrottleState, now: number): number {
  return Math.max(0, Math.ceil((state.lockedUntil - now) / 1000));
}

/** "0:25", "2:00", "15:00". */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Lê o estado salvo; qualquer valor estranho (editado à mão, corrompido) vira estado limpo. */
export function parseThrottle(raw: string | null): ThrottleState {
  if (!raw) return EMPTY_THROTTLE;
  try {
    const value = JSON.parse(raw) as Partial<ThrottleState>;
    const failures = Number(value.failures);
    const lockedUntil = Number(value.lockedUntil);
    if (!Number.isInteger(failures) || failures < 0 || !Number.isFinite(lockedUntil) || lockedUntil < 0) return EMPTY_THROTTLE;
    return { failures, lockedUntil };
  } catch {
    return EMPTY_THROTTLE;
  }
}
