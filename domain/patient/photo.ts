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
