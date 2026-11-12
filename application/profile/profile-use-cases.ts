import { normalizeProfile, validateProfile, type Profile, type ProfileErrors } from "@/domain/profile/profile";
import type { ProfileRepository } from "@/domain/profile/profile-repository";

export class ProfileValidationError extends Error {
  constructor(readonly errors: ProfileErrors) {
    super("profile-invalid");
    this.name = "ProfileValidationError";
  }
}

export class GetProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  execute(): Promise<Profile> {
    return this.profiles.get();
  }
}

/** Valida, deixa o CRO no padrão "CRO-SP 12345" e grava. */
export class SaveProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(profile: Profile): Promise<Profile> {
    const errors = validateProfile(profile);
    if (Object.keys(errors).length > 0) throw new ProfileValidationError(errors);
    return this.profiles.save(normalizeProfile(profile));
  }
}
