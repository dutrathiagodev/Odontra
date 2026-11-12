import { EMPTY_PROFILE, type Profile } from "@/domain/profile/profile";
import type { ProfileRepository } from "@/domain/profile/profile-repository";

const KEY = "pronturario-maju:profile";

/** Perfil no aparelho: só para desenvolvimento sem Supabase. */
export class LocalStorageProfileRepository implements ProfileRepository {
  async get(): Promise<Profile> {
    if (typeof window === "undefined") return { ...EMPTY_PROFILE };
    try {
      return { ...EMPTY_PROFILE, ...JSON.parse(window.localStorage.getItem(KEY) ?? "{}") };
    } catch {
      return { ...EMPTY_PROFILE };
    }
  }

  async save(profile: Profile): Promise<Profile> {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
    return profile;
  }
}
