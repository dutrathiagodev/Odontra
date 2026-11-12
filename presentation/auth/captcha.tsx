"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile nos formulários de acesso.
 * Só liga quando NEXT_PUBLIC_TURNSTILE_SITE_KEY existe; sem ela os formulários funcionam como antes.
 * A conferência do token é feita pelo Supabase Auth (chave secreta configurada lá), nunca no navegador.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const isCaptchaEnabled = SITE_KEY.length > 0;

interface TurnstileOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  language?: string;
  size?: "normal" | "flexible" | "compact";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string | undefined;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Carrega o script do Turnstile só quando um formulário com captcha aparece (uma vez por página). */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("turnstile"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

function CaptchaWidget({ onToken, resetSignal }: { onToken: (token: string) => void; resetSignal: number }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          language: "pt-br",
          size: "flexible",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, []);

  // O token vale uma vez só: depois de cada envio pede um novo.
  useEffect(() => {
    if (resetSignal > 0 && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetSignal]);

  if (failed) {
    return (
      <p role="alert" className="text-sm text-rose-200">
        Não foi possível carregar a verificação de segurança. Confira a conexão e recarregue a página.
      </p>
    );
  }
  // Altura reservada para o quadro do Turnstile não empurrar o botão quando aparecer.
  return <div ref={container} className="min-h-[65px]" aria-label="Verificação de segurança" />;
}

/** Estado do captcha de um formulário: o quadro, o token atual e como pedir um novo. */
export function useCaptcha() {
  const [token, setToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);

  const reset = useCallback(() => {
    setToken("");
    setResetSignal((n) => n + 1);
  }, []);

  const field = isCaptchaEnabled ? <CaptchaWidget onToken={setToken} resetSignal={resetSignal} /> : null;
  /** Mensagem quando o captcha está ligado e a pessoa ainda não passou por ele. */
  const missing = isCaptchaEnabled && !token ? "Conclua a verificação de segurança antes de continuar." : "";

  return { token: token || undefined, field, reset, missing };
}
