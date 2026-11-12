/* eslint-disable @next/next/no-img-element */

/**
 * Objetos de clínica recortados (fundo transparente), usados como acentos nas bordas das seções.
 * Recortes feitos a partir de fotos do Unsplash; ficam sempre decorativos (alt vazio, aria-hidden).
 */
export const CLINIC_OBJECTS = {
  mirrorProbe: { src: "/landing/espelho-sonda.webp", width: 1089, height: 599 },
  instruments: { src: "/landing/instrumentos.webp", width: 827, height: 1100 },
  xray: { src: "/landing/raio-x.webp", width: 1200, height: 900 },
} as const;

export function ClinicObject({ object, className = "" }: { object: keyof typeof CLINIC_OBJECTS; className?: string }) {
  const { src, width, height } = CLINIC_OBJECTS[object];
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`pointer-events-none absolute select-none ${className}`}
    />
  );
}
