/** O registro não existe mais (ou não pertence a quem pediu). */
export class RecordNotFoundError extends Error {
  constructor() {
    super("record-not-found");
    this.name = "RecordNotFoundError";
  }
}

/** O registro não passa nas regras de tamanho/formato. `userMessage` pode ir para a tela. */
export class InvalidRecordError extends Error {
  constructor(readonly userMessage: string) {
    super("invalid-record");
    this.name = "InvalidRecordError";
  }
}
