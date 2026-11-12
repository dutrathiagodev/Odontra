import { isValidPhoto } from "@/domain/patient/photo";

const MAX_SIDE = 480;
const JPEG_QUALITIES = [0.8, 0.65, 0.5, 0.35];

/** A foto não pôde ser usada (formato que o navegador não abre, ou grande demais mesmo reduzida). */
export class PhotoError extends Error {
  constructor(readonly reason: "unreadable" | "too-large") {
    super(`photo-${reason}`);
    this.name = "PhotoError";
  }
}

/**
 * Reduz a foto (ex.: câmera do celular) para JPEG de até 480px e baixa a qualidade até caber
 * no limite do banco. Lança PhotoError quando não dá para usar a imagem.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError("unreadable");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of JPEG_QUALITIES) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (isValidPhoto(dataUrl)) return dataUrl;
  }
  throw new PhotoError("too-large");
}

/** Mensagem para a pessoa quando a foto não pôde ser usada. */
export function photoErrorMessage(error: unknown): string {
  if (error instanceof PhotoError && error.reason === "too-large") {
    return "A foto ficou grande demais mesmo depois de reduzida. Tente outra foto, com menos detalhes ou recortada.";
  }
  return "Não foi possível abrir essa imagem. Use uma foto em JPEG, PNG ou WebP.";
}
