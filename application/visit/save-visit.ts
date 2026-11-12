import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";

export class SaveVisit {
  constructor(private readonly visits: VisitRepository) {}

  async execute(visit: Visit): Promise<Visit> {
    const saved = { ...visit, updatedAt: new Date().toISOString() };
    await this.visits.save(saved);
    return saved;
  }
}
