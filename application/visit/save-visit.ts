import { assertVisitWithinLimits } from "@/domain/record-limits";
import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";

export class SaveVisit {
  constructor(private readonly visits: VisitRepository) {}

  async execute(visit: Visit): Promise<Visit> {
    // Confere antes de ir à rede, com as mesmas regras do banco, para a mensagem ser clara.
    assertVisitWithinLimits(visit);
    return this.visits.save({ ...visit, updatedAt: new Date().toISOString() });
  }
}
