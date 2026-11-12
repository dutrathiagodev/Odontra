/** O registro não existe mais (ou não pertence a quem pediu). */
export class RecordNotFoundError extends Error {
  constructor() {
    super("record-not-found");
    this.name = "RecordNotFoundError";
  }
}
