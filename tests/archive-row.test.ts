import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { RecordNotFoundError } from "@/domain/errors";
import { archiveRow } from "@/infrastructure/supabase/archive-row";

/** Cliente falso: registra as chamadas e devolve o que o teste mandar. */
function fakeDb(found: { id: string } | null, deleteError: Error | null = null) {
  const calls: string[] = [];
  const query = {
    select: () => (calls.push("select"), query),
    eq: (column: string) => (calls.push(`eq:${column}`), query),
    is: (column: string) => (calls.push(`is:${column}`), query),
    maybeSingle: async () => ({ data: found, error: null }),
  };
  const remove = {
    eq: vi.fn(async () => ({ error: deleteError })),
  };
  const db = {
    from: () => ({ ...query, delete: () => (calls.push("delete"), remove) }),
  } as unknown as SupabaseClient;
  return { db, calls, remove };
}

describe("archiveRow", () => {
  it("confere que o registro está ativo e manda um único DELETE (o banco arquiva)", async () => {
    const { db, calls, remove } = fakeDb({ id: "p1" });
    await archiveRow(db, "patients", "p1");
    expect(calls).toContain("is:deleted_at");
    expect(calls.filter((c) => c === "delete")).toHaveLength(1);
    expect(remove.eq).toHaveBeenCalledWith("id", "p1");
  });

  it("avisa quando o registro não existe ou já foi arquivado", async () => {
    const { db, remove } = fakeDb(null);
    await expect(archiveRow(db, "visits", "v1")).rejects.toBeInstanceOf(RecordNotFoundError);
    expect(remove.eq).not.toHaveBeenCalled();
  });

  it("repassa o erro do banco", async () => {
    const { db } = fakeDb({ id: "p1" }, new Error("permission denied"));
    await expect(archiveRow(db, "patients", "p1")).rejects.toThrow("permission denied");
  });
});
