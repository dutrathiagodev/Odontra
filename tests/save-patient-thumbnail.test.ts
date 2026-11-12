import { describe, expect, it, vi } from "vitest";
import { SavePatient } from "@/application/patient/save-patient";
import type { Patient } from "@/domain/patient/patient";
import { createBlankPatient } from "@/domain/patient/patient-factory";
import type { PatientRepository } from "@/domain/patient/patient-repository";
import { InvalidRecordError } from "@/domain/errors";

const PHOTO = "data:image/jpeg;base64,/9j/AAAA";
const THUMB = "data:image/jpeg;base64,/9j/BB==";

function repo() {
  const saved: Patient[] = [];
  const repository = { save: async (p: Patient) => (saved.push(p), p) } as PatientRepository;
  return { repository, saved };
}

describe("SavePatient e a miniatura da lista", () => {
  it("gera a miniatura a partir da foto ao salvar", async () => {
    const { repository, saved } = repo();
    const makeThumbnail = vi.fn(async () => THUMB);
    await new SavePatient(repository, makeThumbnail).execute({ ...createBlankPatient(1), photo: PHOTO });
    expect(makeThumbnail).toHaveBeenCalledWith(PHOTO);
    expect(saved[0].photoThumb).toBe(THUMB);
  });

  it("sem foto, a miniatura fica vazia (e some junto com a foto)", async () => {
    const { repository, saved } = repo();
    const makeThumbnail = vi.fn(async () => THUMB);
    await new SavePatient(repository, makeThumbnail).execute({ ...createBlankPatient(1), photo: "", photoThumb: THUMB });
    expect(makeThumbnail).not.toHaveBeenCalled();
    expect(saved[0].photoThumb).toBe("");
  });

  it("se não conseguir gerar, salva sem miniatura (a lista usa a foto)", async () => {
    const { repository, saved } = repo();
    await new SavePatient(repository, async () => "").execute({ ...createBlankPatient(1), photo: PHOTO });
    expect(saved[0].photoThumb).toBe("");
  });

  it("recusa miniatura fora do formato do banco", async () => {
    const { repository } = repo();
    const save = new SavePatient(repository, async () => "data:image/png;base64,iVBORw0KGgo=");
    await expect(save.execute({ ...createBlankPatient(1), photo: PHOTO })).rejects.toBeInstanceOf(InvalidRecordError);
  });
});
