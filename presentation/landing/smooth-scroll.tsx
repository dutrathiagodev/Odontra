"use client";

import Lenis from "lenis";
import { useEffect } from "react";

const HEADER_OFFSET = -72;

/**
 * Rolagem da landing.
 * - Rolagem suave (Lenis) só com mouse/trackpad no computador; no iPhone, iPad e Android fica a nativa, mais fluida.
 * - Links do menu (#como-funciona etc.) rolam até a seção sem escrever o "#" no endereço: a URL fica limpa.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const lenis = !reduce && finePointer ? new Lenis({ autoRaf: true, lerp: 0.12 }) : null;

    const goTo = (id: string, smooth: boolean) => {
      const target = document.getElementById(id);
      if (!target) return false;
      if (lenis) lenis.scrollTo(target, { offset: HEADER_OFFSET, immediate: !smooth });
      else {
        const top = target.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET;
        window.scrollTo({ top, behavior: smooth && !reduce ? "smooth" : "auto" });
      }
      return true;
    };

    // Chegou com "#secao" (ex.: link vindo do login): rola e limpa o endereço.
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      requestAnimationFrame(() => goTo(id, false));
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const url = new URL((link as HTMLAnchorElement).href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      if (goTo(decodeURIComponent(url.hash.slice(1)), true)) event.preventDefault();
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lenis?.destroy();
    };
  }, []);
  return null;
}
