"use client";

import { Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { fileToCompressedDataUrl } from "../../image";
import { Avatar } from "../../ui/avatar";

export function PhotoField({ name, photo, onChange }: { name: string; photo: string; onChange: (photo: string) => void }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToCompressedDataUrl(file));
    } finally {
      setBusy(false);
    }
  };

  const pill = "flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-navy-900 ring-1 ring-slate-200 active:scale-95";

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar name={name || "Paciente"} photo={photo} size="h-28 w-28" awaitingUpload={!photo} />
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => cameraRef.current?.click()} className={pill} disabled={busy}>
          <Camera className="h-4 w-4 text-brand-600" /> {photo ? "Nova foto" : "Tirar foto"}
        </button>
        <button type="button" onClick={() => galleryRef.current?.click()} className={pill} disabled={busy}>
          <ImageIcon className="h-4 w-4 text-brand-600" /> Galeria
        </button>
        {photo && (
          <button type="button" onClick={() => onChange("")} aria-label="Remover foto" className={`${pill} text-rose-600`}>
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="user" hidden onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
