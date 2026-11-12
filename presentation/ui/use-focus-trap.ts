"use client";

import { useEffect, useRef, type RefObject } from "react";
import { trapTarget } from "./keyboard";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Diálogos abertos, do de baixo para o de cima: só o de cima responde a Tab e Esc. */
const stack: symbol[] = [];

function focusablesIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest("[inert]") && el.getAttribute("aria-hidden") !== "true" && el.getClientRects().length > 0,
  );
}

interface Options {
  /** Elemento que recebe o foco ao abrir (padrão: o primeiro focável). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Esc fecha. */
  onEscape?: () => void;
}

/**
 * Prende o foco dentro de um diálogo enquanto ele está aberto:
 * foco inicial dentro, Tab/Shift+Tab dão a volta, Esc fecha e, ao fechar, o foco volta para onde estava.
 * Com um diálogo em cima do outro (ex.: confirmação dentro do painel), só o de cima responde.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean, { initialFocus, onEscape }: Options = {}) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const id = Symbol("dialog");
    stack.push(id);
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!container.contains(document.activeElement)) {
      (initialFocus?.current ?? focusablesIn(container)[0] ?? container).focus({ preventScroll: true });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === "Escape" && onEscapeRef.current) {
        e.preventDefault();
        e.stopPropagation();
        onEscapeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusablesIn(container);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const target = trapTarget(items.indexOf(document.activeElement as HTMLElement), items.length, e.shiftKey);
      if (target !== null) {
        e.preventDefault();
        items[target].focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const at = stack.lastIndexOf(id);
      if (at >= 0) stack.splice(at, 1);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
