import { Caveat } from "next/font/google";

/** Letra de mão para os campos preenchidos da ficha (servida pelo próprio site, sem chamar o Google no navegador). */
export const handFont = Caveat({ subsets: ["latin"], weight: ["500", "600"], display: "swap" });
