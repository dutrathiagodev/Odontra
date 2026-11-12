"use client";

import { Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "hidden" | "ios" | "android";

const DISMISS_KEY = "odontra:install-dismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function remember() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* navegação privada: aparece de novo na próxima visita */
  }
}

/**
 * Convite para colocar o Odontra na tela de início e usar como app.
 * iPhone/iPad (Safari): ensina o caminho Compartilhar → Adicionar à Tela de Início (a Apple não deixa abrir por código).
 * Android/Chrome: botão Instalar com o prompt nativo.
 * Aparece uma vez por aparelho (celular/tablet) e nunca quando já está instalado.
 */
export function InstallBanner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // Só em celular e tablet, e uma única vez: depois de aparecer, não volta (a menos que limpe os dados do site).
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (standalone || !touch || readDismissed()) return;
    remember();

    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS) timer = setTimeout(() => setMode("ios"), 1200);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const dismiss = () => setMode("hidden");

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
    dismiss();
  };

  if (mode === "hidden") return null;

  return (
    <div role="dialog" aria-label="Instalar o Odontra" className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-40 mx-auto max-w-md lg:bottom-6">
      <div className="flex items-start gap-3 rounded-2xl bg-white/90 p-3.5 shadow-xl ring-1 ring-line backdrop-blur-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/apple-icon.png" alt="" className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-ink">Use o Odontra como app</p>
          {mode === "ios" ? (
            <p className="mt-0.5 text-muted">
              Toque em <Share className="inline h-4 w-4 -translate-y-0.5 text-accent" aria-label="Compartilhar" /> e depois em{" "}
              <span className="whitespace-nowrap font-semibold text-ink">
                <SquarePlus className="inline h-4 w-4 -translate-y-0.5" aria-hidden /> Adicionar à Tela de Início
              </span>
              .
            </p>
          ) : (
            <>
              <p className="mt-0.5 text-muted">Abre em tela cheia, direto da tela inicial.</p>
              <button type="button" onClick={install} className="mt-2 min-h-11 rounded-full bg-accent px-4 text-sm font-semibold text-white active:scale-95">
                Instalar
              </button>
            </>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Agora não" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-enamel">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
