"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { isInAppNavigation } from "../navigation/leave-guard";
import { useConfirm } from "../ui/confirm-dialog";

/** Pedaço da Navigation API que usamos (o TypeScript ainda não traz os tipos). */
interface NavigateEventLike extends Event {
  navigationType: "push" | "replace" | "reload" | "traverse";
  cancelable: boolean;
  destination: { key: string };
}
interface NavigationLike {
  addEventListener(type: "navigate", listener: (e: NavigateEventLike) => void): void;
  removeEventListener(type: "navigate", listener: (e: NavigateEventLike) => void): void;
  traverseTo(key: string): unknown;
}

const LEAVE_DIALOG = {
  title: "Sair sem salvar?",
  description: "As alterações desta tela ainda não foram salvas e vão se perder.",
  confirmLabel: "Sair sem salvar",
  cancelLabel: "Continuar editando",
};

/**
 * Avisa antes de sair da tela com alterações não salvas:
 * - fechar/recarregar a aba ou ir para outro site: aviso do próprio navegador (`beforeunload`);
 * - links do app (menu, "voltar" para o paciente, histórico): o diálogo "Sair sem salvar?";
 * - botão/gesto de voltar do navegador: o mesmo diálogo (navegadores com a Navigation API).
 *
 * Devolve o diálogo, que a tela precisa renderizar.
 */
export function useLeaveGuard(dirty: boolean) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const dirtyRef = useRef(dirty);
  const asking = useRef(false);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Fechar, recarregar ou sair do app.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Navegadores antigos só mostram o aviso com returnValue preenchido.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Links do app: interceptados na captura, antes do <Link> do Next navegar.
  useEffect(() => {
    if (!dirty) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const click = {
        href: anchor.href,
        current: window.location.href,
        target: anchor.getAttribute("target"),
        download: anchor.hasAttribute("download"),
        button: e.button,
        modifier: e.metaKey || e.ctrlKey || e.shiftKey || e.altKey,
      };
      if (!isInAppNavigation(click)) return;

      e.preventDefault();
      e.stopPropagation();
      if (asking.current) return;
      asking.current = true;
      const url = new URL(anchor.href);
      void confirm(LEAVE_DIALOG).then((leave) => {
        asking.current = false;
        if (!leave) return;
        dirtyRef.current = false;
        router.push(`${url.pathname}${url.search}${url.hash}`);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, confirm, router]);

  // Voltar/avançar do navegador (botão ou gesto): usa a Navigation API, onde existir,
  // para segurar a volta sem sujar o histórico. Onde não existe, o navegador volta sem perguntar.
  useEffect(() => {
    const navigation = (window as Window & { navigation?: NavigationLike }).navigation;
    if (!dirty || !navigation) return;
    const onNavigate = (e: NavigateEventLike) => {
      if (e.navigationType !== "traverse" || !e.cancelable || !dirtyRef.current) return;
      e.preventDefault();
      if (asking.current) return;
      asking.current = true;
      const key = e.destination.key;
      void confirm(LEAVE_DIALOG).then((leave) => {
        asking.current = false;
        if (!leave) return;
        dirtyRef.current = false;
        navigation.traverseTo(key);
      });
    };
    navigation.addEventListener("navigate", onNavigate);
    return () => navigation.removeEventListener("navigate", onNavigate);
  }, [dirty, confirm]);

  return dialog;
}
