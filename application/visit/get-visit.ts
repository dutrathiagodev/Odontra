import type { Visit } from "@/domain/visit/visit";
import type { VisitRepository } from "@/domain/visit/visit-repository";

export class GetVisit {
  constructor(private readonly visits: VisitRepository) {}

  execute(id: string): Promise<Visit | null> {
    return this.visits.findById(id);
  }
}
