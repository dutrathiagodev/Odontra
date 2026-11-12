import type { VisitRepository } from "@/domain/visit/visit-repository";

export class DeleteVisit {
  constructor(private readonly visits: VisitRepository) {}

  execute(id: string): Promise<void> {
    return this.visits.delete(id);
  }
}
