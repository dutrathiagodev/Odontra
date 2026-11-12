import type { ProfileRepository } from "@/domain/profile/profile-repository";
import { profileToDentist } from "@/domain/profile/profile";
import type { Dentist, Visit } from "@/domain/visit/visit";
import { createBlankVisit } from "@/domain/visit/visit-factory";
import type { VisitRepository } from "@/domain/visit/visit-repository";

/**
 * Nova consulta já herda profissional e odontograma da consulta anterior.
 * Sem profissional na consulta anterior (ou na primeira consulta), usa o perfil do dentista logado.
 */
export class StartNewVisit {
  constructor(
    private readonly visits: VisitRepository,
    private readonly profiles?: ProfileRepository,
  ) {}

  async execute(patientId: string): Promise<Visit> {
    const history = await this.visits.findByPatient(patientId);
    const last = [...history].sort((a, b) => b.sequence - a.sequence)[0];

    return createBlankVisit({
      patientId,
      sequence: (last?.sequence ?? 0) + 1,
      dentist: last?.dentist?.name.trim() ? last.dentist : await this.profileDentist(),
      odontogram: last?.odontogram,
    });
  }

  /** O perfil é só um atalho: se não carregar, a consulta abre com o profissional em branco. */
  private async profileDentist(): Promise<Dentist | undefined> {
    if (!this.profiles) return undefined;
    try {
      const dentist = profileToDentist(await this.profiles.get());
      return dentist.name.trim() ? dentist : undefined;
    } catch {
      return undefined;
    }
  }
}
