/* eslint-disable @next/next/no-img-element */
import { Camera } from "lucide-react";

/** Silhueta padrão de perfil, usada enquanto o paciente não tem foto. */
function Silhouette() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      <rect width="64" height="64" fill="#e3e9f1" />
      <circle cx="32" cy="25" r="11" fill="#b7c3d3" />
      <path d="M10 60c2-13 11-20 22-20s20 7 22 20" fill="#b7c3d3" />
    </svg>
  );
}

interface AvatarProps {
  name: string;
  photo?: string;
  size?: string;
  /** Mostra o selo de câmera, indicando que dá para adicionar a foto. */
  awaitingUpload?: boolean;
}

export function Avatar({ name, photo, size = "h-12 w-12", awaitingUpload = false }: AvatarProps) {
  if (photo) {
    return <img src={photo} alt={`Foto de ${name}`} className={`${size} shrink-0 rounded-full object-cover ring-2 ring-white`} />;
  }
  return (
    <span className={`${size} relative inline-block shrink-0`} role="img" aria-label={`${name}: sem foto`}>
      <span className={`block h-full w-full overflow-hidden rounded-full ring-2 ${awaitingUpload ? "ring-line" : "ring-white"}`}>
        <Silhouette />
      </span>
      {awaitingUpload && (
        <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-accent text-white ring-4 ring-white">
          <Camera className="h-4 w-4" />
        </span>
      )}
    </span>
  );
}
