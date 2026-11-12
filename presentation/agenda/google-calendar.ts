import { endsAt, type Appointment } from "@/domain/appointment/appointment";

/** Formato de data do Google Agenda: 20261112T143000Z. */
function googleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Link "Adicionar ao Google Agenda": abre o evento já preenchido na conta Google da pessoa.
 * Não precisa de chave nem de login no Odontra; o nome do paciente só vai se o dentista salvar.
 */
export function googleCalendarUrl(appointment: Appointment): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: appointment.title,
    dates: `${googleDate(new Date(appointment.startsAt))}/${googleDate(endsAt(appointment))}`,
    details: appointment.notes ? `${appointment.notes}\n\nMarcado no Odontra` : "Marcado no Odontra",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
