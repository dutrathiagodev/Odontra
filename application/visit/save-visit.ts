import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";

export class SaveVisit {
  constructor(private readonly visits: VisitRepository) {}

  async execute(visit: Visit): Promise<Visit> {
    return this.visits.save({ ...visit, updatedAt: new Date().toISOString() });
  }
}
