import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/domain/profile/profile";
import type { ProfileRepository } from "@/domain/profile/profile-repository";

interface ProfileRow {
  full_name: string;
  cro: string;
}

const toDomain = (row: ProfileRow): Profile => ({ fullName: row.full_name, cro: row.cro });

/** Perfil em `public.profiles`. A linha nasce no cadastro (trigger) e a RLS só deixa ler e editar a própria. */
export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly db: () => SupabaseClient) {}

  private async userId(): Promise<string> {
    const { data, error } = await this.db().auth.getUser();
    if (error || !data.user) throw error ?? new Error("not-authenticated");
    return data.user.id;
  }

  async get(): Promise<Profile> {
    const id = await this.userId();
    const { data, error } = await this.db().from("profiles").select("full_name, cro").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toDomain(data as ProfileRow) : { fullName: "", cro: "" };
  }

  async save(profile: Profile): Promise<Profile> {
    const id = await this.userId();
    const { data, error } = await this.db()
      .from("profiles")
      .update({ full_name: profile.fullName, cro: profile.cro })
      .eq("id", id)
      .select("full_name, cro")
      .single();
    if (error) throw error;
    return toDomain(data as ProfileRow);
  }
}
