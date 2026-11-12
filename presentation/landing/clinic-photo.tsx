/* eslint-disable @next/next/no-img-element */

/** Fotos clínicas reais (Unsplash) usadas pontualmente na landing. */
export const CLINIC_PHOTOS = {
  mirrorProbe: { id: "1606811856475-5e6fcdc6e509", alt: "Espelho clínico e sonda exploradora sobre fundo branco" },
  glovedInstruments: { id: "1771442873038-dda05b6ca447", alt: "Mão com luva segurando espelho, sonda e pinça no consultório" },
  tabletScan: { id: "1600170311833-c2cf5280ce49", alt: "Dentista de luvas analisando a tomografia da arcada em um tablet" },
  panoramic: { id: "1522849696084-818b29dfe210", alt: "Radiografia panorâmica da arcada dentária completa" },
  xrayReview: { id: "1588776814546-1ffcf47267a5", alt: "Dentista conferindo radiografias no negatoscópio" },
} as const;

type ClinicPhotoKey = keyof typeof CLINIC_PHOTOS;

function photoUrl(id: string, width: number, height: number) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${height}&fit=crop&auto=format&q=70`;
}

/**
 * Foto com proporção fixa (sem salto de layout), carregamento sob demanda e srcset 1x/2x.
 * `width`/`height` definem a proporção e o tamanho base pedido ao Unsplash.
 */
export function ClinicPhoto({
  photo,
  width,
  height,
  sizes,
  className = "",
}: {
  photo: ClinicPhotoKey;
  width: number;
  height: number;
  sizes: string;
  className?: string;
}) {
  const { id, alt } = CLINIC_PHOTOS[photo];
  return (
    <img
      src={photoUrl(id, width, height)}
      srcSet={`${photoUrl(id, Math.round(width / 2), Math.round(height / 2))} ${Math.round(width / 2)}w, ${photoUrl(id, width, height)} ${width}w, ${photoUrl(id, width * 2, height * 2)} ${width * 2}w`}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={`block h-auto w-full bg-enamel object-cover ${className}`}
    />
  );
}
