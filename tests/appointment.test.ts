import { describe, expect, it } from "vitest";
import { createBlankAppointment, endsAt } from "@/domain/appointment/appointment";

describe("endsAt", () => {
  it("soma a duração ao início", () => {
    const fim = endsAt({ startsAt: "2026-11-12T13:00:00.000Z", durationMinutes: 45 });
    expect(fim.toISOString()).toBe("2026-11-12T13:45:00.000Z");
  });

  it("atravessa a meia-noite", () => {
    const fim = endsAt({ startsAt: "2026-11-12T23:30:00.000Z", durationMinutes: 90 });
    expect(fim.toISOString()).toBe("2026-11-13T01:00:00.000Z");
  });
});

describe("createBlankAppointment", () => {
  it("no dia de hoje, antes da meia hora, começa na meia hora", () => {
    const agora = new Date(2026, 10, 12, 10, 12);
    const horario = createBlankAppointment(new Date(2026, 10, 12), agora);
    expect(new Date(horario.startsAt)).toEqual(new Date(2026, 10, 12, 10, 30));
  });

  it("no dia de hoje, depois da meia hora, começa na hora cheia seguinte", () => {
    const agora = new Date(2026, 10, 12, 10, 45);
    const horario = createBlankAppointment(new Date(2026, 10, 12), agora);
    expect(new Date(horario.startsAt)).toEqual(new Date(2026, 10, 12, 11, 0));
  });

  it("em outro dia, começa às 9h", () => {
    const agora = new Date(2026, 10, 12, 15, 10);
    const horario = createBlankAppointment(new Date(2026, 10, 20, 18, 0), agora);
    expect(new Date(horario.startsAt)).toEqual(new Date(2026, 10, 20, 9, 0));
  });

  it("vem em branco, com 30 minutos e id próprio", () => {
    const agora = new Date(2026, 10, 12, 8, 0);
    const a = createBlankAppointment(new Date(2026, 10, 13), agora);
    const b = createBlankAppointment(new Date(2026, 10, 13), agora);
    expect(a).toMatchObject({
      patientId: null,
      title: "",
      durationMinutes: 30,
      notes: "",
      googleEventId: null,
      createdAt: agora.toISOString(),
      updatedAt: agora.toISOString(),
    });
    expect(a.id).not.toBe(b.id);
  });
});
