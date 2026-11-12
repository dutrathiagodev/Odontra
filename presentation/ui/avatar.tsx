/* eslint-disable @next/next/no-img-element */
import { initials } from "../format";

export function Avatar({ name, photo, size = "h-12 w-12" }: { name: string; photo?: string; size?: string }) {
  if (photo) {
    return <img src={photo} alt={`Foto de ${name}`} className={`${size} shrink-0 rounded-full object-cover ring-2 ring-white`} />;
  }
  return (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-navy-800 text-sm font-extrabold text-white ring-2 ring-white`}>
      {initials(name)}
    </span>
  );
}
