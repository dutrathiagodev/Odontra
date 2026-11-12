/**
 * Regras da foto do paciente, iguais às do banco (CHECK em public.patients.photo).
 * A foto é guardada como data URL: vazia, ou JPEG/PNG/WebP em base64 até PHOTO_MAX_CHARS caracteres.
 */
export const PHOTO_MAX_CHARS = 600_000;

const PHOTO_PREFIX = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export function isValidPhoto(photo: string): boolean {
  if (photo === "") return true;
  return photo.length <= PHOTO_MAX_CHARS && PHOTO_PREFIX.test(photo);
}

/** Miniatura para listas (CHECK em public.patients.photo_thumb): JPEG em base64, bem pequena. */
export const THUMB_MAX_CHARS = 20_000;
export const THUMB_SIDE = 96;

const THUMB_PREFIX = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;

export function isValidThumb(thumb: string): boolean {
  if (thumb === "") return true;
  return thumb.length <= THUMB_MAX_CHARS && THUMB_PREFIX.test(thumb);
}

/** Gera a miniatura a partir da foto. Devolve "" se não conseguir (a lista usa a foto inteira). */
export type ThumbnailMaker = (photo: string) => Promise<string>;
