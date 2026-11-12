"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Rolagem suave na landing (desligada para quem prefere menos movimento). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -72 }, lerp: 0.12 });
    return () => lenis.destroy();
  }, []);
  return null;
}
