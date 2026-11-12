import { CalendarCheck2, RefreshCw } from "lucide-react";

/**
 * Como a agenda conversa com o Google Agenda.
 * Hoje: cada horário tem "Adicionar ao Google Agenda" (abre na conta Google do dentista).
 * Sincronização automática depende do login com Google (Odontra/00008) e das credenciais no Google Cloud.
 */
export function GoogleCalendarCard() {
  return (
    <section aria-labelledby="google-agenda" className="rounded-2xl bg-white p-4 ring-1 ring-line">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-enamel">
          <GoogleCalendarMark />
        </span>
        <div className="min-w-0">
          <h3 id="google-agenda" className="text-[15px] font-bold text-ink">Google Agenda</h3>
          <p className="text-sm text-muted">Leve seus horários para o calendário do celular.</p>
        </div>
      </div>

      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex gap-3">
          <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span className="text-ink">
            <strong className="font-semibold">Disponível:</strong> abra um horário e toque em <em className="not-italic font-semibold">Adicionar ao Google Agenda</em>. Ele entra na sua conta Google com hora e observações.
          </span>
        </li>
        <li className="flex gap-3">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <span className="text-muted">
            <strong className="font-semibold text-ink">Em breve:</strong> vincular a conta Google para sincronizar sozinho, nos dois sentidos.
          </span>
        </li>
      </ul>
    </section>
  );
}

/** Marca simples de calendário nas cores do Google, desenhada aqui (sem baixar logo de terceiros). */
function GoogleCalendarMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" stroke="#dadce0" />
      <path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3z" fill="#4285f4" />
      <rect x="7" y="2.5" width="2" height="4" rx="1" fill="#1a73e8" />
      <rect x="15" y="2.5" width="2" height="4" rx="1" fill="#1a73e8" />
      <path d="M8 13h3v3H8z" fill="#34a853" />
      <path d="M13 13h3v3h-3z" fill="#fbbc04" />
      <path d="M8 17.5h3V19H8z" fill="#ea4335" />
    </svg>
  );
}
