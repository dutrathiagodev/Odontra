import type { Profile } from "./profile";

/** Perfil do dentista logado (um por conta). */
export interface ProfileRepository {
  get(): Promise<Profile>;
  save(profile: Profile): Promise<Profile>;
}
