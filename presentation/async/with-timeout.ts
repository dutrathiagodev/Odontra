import { InvalidRecordError } from "@/domain/errors";

export class TimeoutError extends Error {
  constructor() {
    super("timeout");
    this.name = "TimeoutError";
  }
}

/** Regra do app: nenhuma chamada de rede deixa a tela esperando para sempre. */
export function withTimeout<T>(promise: Promise<T>, ms = 20_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Mensagem para a pessoa a partir de qualquer erro técnico (sem detalhes internos). */
export function friendlyError(error: unknown): string {
  if (error instanceof TimeoutError) return "O servidor demorou para responder. Verifique a conexão e tente de novo.";
  if (error instanceof Error && error.message === "supabase-not-configured") {
    return "O acesso está indisponível neste endereço no momento. Tente novamente em alguns minutos.";
  }
  if (error instanceof InvalidRecordError) return error.userMessage;
  // 23514 = CHECK do banco recusou (tamanho ou formato fora do limite).
  if (typeof error === "object" && error !== null && "code" in error && error.code === "23514") {
    return "Algum campo passou do tamanho permitido (texto muito longo ou foto grande demais). Reduza e tente de novo.";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return "Sem conexão com a internet. Conecte-se e tente de novo.";
  return "Não foi possível concluir agora. Tente de novo.";
}
