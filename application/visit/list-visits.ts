import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";

/** Histórico do paciente, da consulta mais recente para a mais antiga. */
export class ListVisits {
  constructor(private readonly visits: VisitRepository) {}

  async execute(patientId: string): Promise<Visit[]> {
    const all = await this.visits.findByPatient(patientId);
    return [...all].sort((a, b) => b.sequence - a.sequence);
  }
}
