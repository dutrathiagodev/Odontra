import { RecordNotFoundError } from "@/domain/errors";
import { TimeoutError } from "./with-timeout";

/**
 * Mensagem de falha ao excluir. `what` é o registro em texto ("o paciente", "a consulta").
 * Registro que já não existe não é erro grave: a tela recarrega e avisa.
 */
export function deleteErrorMessage(error: unknown, what: string): string {
  if (error instanceof RecordNotFoundError) return `Não encontramos ${what}: a exclusão pode já ter sido feita em outro aparelho. A lista foi atualizada.`;
  if (error instanceof TimeoutError) return `O servidor demorou para responder e a exclusão pode não ter sido concluída. Confira a lista e tente de novo.`;
  return `Não foi possível excluir ${what} agora. Verifique a conexão e tente de novo.`;
}
