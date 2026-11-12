import type { SupabaseClient } from "@supabase/supabase-js";
import { RecordNotFoundError } from "@/domain/errors";

/**
 * "Excluir" no app = arquivar (Lei 13.787/2018: o prontuário fica guardado por 20 anos).
 * O DELETE é interceptado por um gatilho no banco, que preenche deleted_at e não apaga nada;
 * por isso a resposta nunca traz linhas. Antes, confere se o registro existe e é do dentista.
 */
export async function archiveRow(db: SupabaseClient, table: "patients" | "visits", id: string): Promise<void> {
  const { data: found, error: findError } = await db.from(table).select("id").eq("id", id).is("deleted_at", null).maybeSingle();
  if (findError) throw findError;
  if (!found) throw new RecordNotFoundError();

  const { error } = await db.from(table).delete().eq("id", id);
  if (error) throw error;
}
