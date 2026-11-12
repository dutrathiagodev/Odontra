import type { Visit } from "@/domain/visit/visit";
import { createBlankVisit } from "@/domain/visit/visit-factory";
import type { VisitRepository } from "@/domain/visit/visit-repository";

/** Nova consulta já herda profissional e odontograma da consulta anterior. */
export class StartNewVisit {
  constructor(private readonly visits: VisitRepository) {}

  async execute(patientId: string): Promise<Visit> {
    const history = await this.visits.findByPatient(patientId);
    const last = [...history].sort((a, b) => b.sequence - a.sequence)[0];

    return createBlankVisit({
      patientId,
      sequence: (last?.sequence ?? 0) + 1,
      dentist: last?.dentist,
      odontogram: last?.odontogram,
    });
  }
}
