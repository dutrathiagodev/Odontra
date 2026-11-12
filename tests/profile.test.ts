import { describe, expect, it } from "vitest";
import { ProfileValidationError, SaveProfile } from "@/application/profile/profile-use-cases";
import { StartNewVisit } from "@/application/visit/start-new-visit";
import { croLabel, formatCro, parseCro, resolveDentist, validateProfile, type Profile } from "@/domain/profile/profile";
import type { ProfileRepository } from "@/domain/profile/profile-repository";
import type { Visit } from "@/domain/visit/visit";
import { createBlankVisit } from "@/domain/visit/visit-factory";
import type { VisitRepository } from "@/domain/visit/visit-repository";

describe("CRO", () => {
  it.each([
    ["CRO-SP 12345", "CRO-SP 12345"],
    ["cro sp 12.345", "CRO-SP 12345"],
    ["SP 12345", "CRO-SP 12345"],
    ["12345/RJ", "CRO-RJ 12345"],
    ["MG-9876", "CRO-MG 9876"],
  ])("entende %s", (raw, expected) => {
    expect(formatCro(raw)).toBe(expected);
  });

  it("recusa UF que não existe ou texto sem número", () => {
    expect(parseCro("XX 12345")).toBeNull();
    expect(parseCro("CRO de São Paulo")).toBeNull();
  });

  it("no documento o prefixo CRO aparece uma vez só", () => {
    expect(croLabel("SP 12345")).toBe("CRO-SP 12345");
    expect(croLabel("CRO-SP 12345")).toBe("CRO-SP 12345");
    expect(croLabel("inscrição provisória")).toBe("CRO inscrição provisória");
    expect(croLabel("  ")).toBe("");
  });

  it("CRO vazio é aceito; preenchido precisa ter UF e número", () => {
    expect(validateProfile({ fullName: "Dra. Ana", cro: "" })).toEqual({});
    expect(validateProfile({ fullName: "Dra. Ana", cro: "12345" }).cro).toBeDefined();
  });
});

describe("resolveDentist", () => {
  const profile: Profile = { fullName: "Dra. Ana Lima", cro: "CRO-SP 12345" };

  it("consulta sem profissional assina com o perfil", () => {
    expect(resolveDentist({ name: "", cro: "" }, profile)).toEqual({ name: "Dra. Ana Lima", cro: "CRO-SP 12345" });
  });

  it("o que foi preenchido na consulta vale mais que o perfil", () => {
    expect(resolveDentist({ name: "Dr. Bruno", cro: "RJ 999" }, profile)).toEqual({ name: "Dr. Bruno", cro: "RJ 999" });
  });

  it("não empresta o CRO do perfil para outro profissional", () => {
    expect(resolveDentist({ name: "Dr. Bruno", cro: "" }, profile)).toEqual({ name: "Dr. Bruno", cro: "" });
    expect(resolveDentist({ name: "dra. ana lima", cro: "" }, profile).cro).toBe("CRO-SP 12345");
  });

  it("sem perfil, fica o que está na consulta", () => {
    expect(resolveDentist({ name: " Dr. Bruno ", cro: "" }, null)).toEqual({ name: "Dr. Bruno", cro: "" });
  });
});

class MemoryProfiles implements ProfileRepository {
  constructor(public profile: Profile, private readonly fail = false) {}
  async get() {
    if (this.fail) throw new Error("offline");
    return this.profile;
  }
  async save(profile: Profile) {
    this.profile = profile;
    return profile;
  }
}

function visitsOf(list: Visit[]): VisitRepository {
  return {
    findByPatient: async () => list,
    findById: async () => null,
    save: async (v) => v,
    delete: async () => {},
    deleteByPatient: async () => {},
  };
}

describe("SaveProfile", () => {
  it("grava o CRO no padrão", async () => {
    const repo = new MemoryProfiles({ fullName: "", cro: "" });
    await new SaveProfile(repo).execute({ fullName: "  Dra.  Ana ", cro: "sp 12345" });
    expect(repo.profile).toEqual({ fullName: "Dra. Ana", cro: "CRO-SP 12345" });
  });

  it("recusa CRO sem UF", async () => {
    await expect(new SaveProfile(new MemoryProfiles({ fullName: "", cro: "" })).execute({ fullName: "Ana", cro: "12345" })).rejects.toBeInstanceOf(ProfileValidationError);
  });
});

describe("StartNewVisit com perfil", () => {
  const profile = new MemoryProfiles({ fullName: "Dra. Ana Lima", cro: "CRO-SP 12345" });

  it("primeira consulta vem com o profissional do perfil", async () => {
    const visit = await new StartNewVisit(visitsOf([]), profile).execute("p1");
    expect(visit.dentist).toEqual({ name: "Dra. Ana Lima", cro: "CRO-SP 12345" });
  });

  it("consulta anterior com profissional continua mandando", async () => {
    const last = createBlankVisit({ patientId: "p1", sequence: 1, dentist: { name: "Dr. Bruno", cro: "RJ 999" } });
    const visit = await new StartNewVisit(visitsOf([last]), profile).execute("p1");
    expect(visit.dentist).toEqual({ name: "Dr. Bruno", cro: "RJ 999" });
    expect(visit.sequence).toBe(2);
  });

  it("consulta anterior sem profissional usa o perfil", async () => {
    const last = createBlankVisit({ patientId: "p1", sequence: 1 });
    const visit = await new StartNewVisit(visitsOf([last]), profile).execute("p1");
    expect(visit.dentist.name).toBe("Dra. Ana Lima");
  });

  it("se o perfil não carregar, a consulta abre mesmo assim", async () => {
    const visit = await new StartNewVisit(visitsOf([]), new MemoryProfiles({ fullName: "x", cro: "" }, true)).execute("p1");
    expect(visit.dentist).toEqual({ name: "", cro: "" });
  });
});
