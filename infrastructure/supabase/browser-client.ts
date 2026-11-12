import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

let client: SupabaseClient | null = null;

/** Cliente único no navegador. A sessão fica em cookies gerenciados pelo @supabase/ssr. */
export function getBrowserSupabase(): SupabaseClient {
  // Falha explícita (tratada pela tela) em vez de travar quando o deploy está sem as variáveis.
  if (!isSupabaseConfigured) throw new Error("supabase-not-configured");
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
}
