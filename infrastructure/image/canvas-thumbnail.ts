import { THUMB_SIDE, isValidThumb, type ThumbnailMaker } from "@/domain/patient/photo";

const QUALITIES = [0.75, 0.6, 0.45];

/**
 * Miniatura quadrada (recorte central) em JPEG, feita no navegador a partir da foto já reduzida.
 * Fora do navegador, ou se algo falhar, devolve "" e a lista usa a foto inteira.
 */
export const makeCanvasThumbnail: ThumbnailMaker = async (photo) => {
  if (!photo || typeof document === "undefined") return "";
  try {
    // <img> em vez de fetch(): data URL em imagem segue a regra img-src da CSP, não connect-src.
    const image = new Image();
    image.src = photo;
    await image.decode();
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = THUMB_SIDE;
    canvas.height = THUMB_SIDE;
    canvas.getContext("2d")?.drawImage(
      image,
      (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side,
      0, 0, THUMB_SIDE, THUMB_SIDE,
    );
    for (const quality of QUALITIES) {
      const thumb = canvas.toDataURL("image/jpeg", quality);
      if (isValidThumb(thumb)) return thumb;
    }
    return "";
  } catch {
    return "";
  }
};
