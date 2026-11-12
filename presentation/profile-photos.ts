/** Retratos do Unsplash usados como fotos de perfil de exemplo (landing e pacientes de demonstração). */
export interface ProfilePhoto {
  id: string;
  name: string;
  sex: "F" | "M";
}

export const PROFILE_PHOTOS: readonly ProfilePhoto[] = [
  { id: "1494790108377-be9c29b29330", name: "Mariana Costa", sex: "F" },
  { id: "1544005313-94ddf0286df2", name: "Camila Rocha", sex: "F" },
  { id: "1438761681033-6461ffad8d80", name: "Juliana Alves", sex: "F" },
  { id: "1534528741775-53994a69daeb", name: "Beatriz Lima", sex: "F" },
  { id: "1540569014015-19a7be504e3a", name: "Rafael Mendes", sex: "M" },
  { id: "1507003211169-0a1dd7228f2d", name: "Lucas Ferreira", sex: "M" },
  { id: "1506794778202-cad84cf45f1d", name: "Gabriel Santos", sex: "M" },
  { id: "1539571696357-5a69c17a67c6", name: "Thiago Nunes", sex: "M" },
];

export function profilePhotoUrl(id: string, size = 160): string {
  return `https://images.unsplash.com/photo-${id}?w=${size}&h=${size}&fit=crop&crop=faces&auto=format&q=80`;
}

export function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
