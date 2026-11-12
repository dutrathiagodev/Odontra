"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Rolagem suave só com mouse/trackpad no computador. No iPhone, iPad e Android fica a rolagem
 * nativa do sistema, que é a mais fluida (com inércia e sem atraso no dedo).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -72 }, lerp: 0.12 });
    return () => lenis.destroy();
  }, []);
  return null;
}
