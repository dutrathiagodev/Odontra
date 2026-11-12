import { describe, expect, it, vi } from "vitest";
import { DeletePatient } from "@/application/patient/delete-patient";
import { RecordNotFoundError } from "@/domain/errors";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import { deleteErrorMessage } from "@/presentation/async/delete-error";
import { TimeoutError } from "@/presentation/async/with-timeout";

function fakeRepository(remove: PatientRepository["delete"]): PatientRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(remove),
  };
}

describe("DeletePatient", () => {
  it("faz uma única exclusão (as consultas saem por cascata no banco)", async () => {
    const repo = fakeRepository(async () => {});
    await new DeletePatient(repo).execute("p1");
    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith("p1");
  });

  it("repassa a falha para a tela avisar", async () => {
    const repo = fakeRepository(async () => {
      throw new RecordNotFoundError();
    });
    await expect(new DeletePatient(repo).execute("p1")).rejects.toBeInstanceOf(RecordNotFoundError);
  });
});

describe("deleteErrorMessage", () => {
  it("avisa quando o registro já não existe", () => {
    expect(deleteErrorMessage(new RecordNotFoundError(), "o paciente")).toMatch(/Não encontramos o paciente/);
  });

  it("avisa que a exclusão pode não ter acontecido quando o servidor demora", () => {
    expect(deleteErrorMessage(new TimeoutError(), "a consulta")).toMatch(/a exclusão pode não ter sido concluída/);
  });

  it("não mostra detalhes técnicos em erro desconhecido", () => {
    const message = deleteErrorMessage(new Error("duplicate key value violates unique constraint"), "o paciente");
    expect(message).toBe("Não foi possível excluir o paciente agora. Verifique a conexão e tente de novo.");
  });
});
