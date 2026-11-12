/** E-mail de boas-vindas enviado logo depois do cadastro. HTML em tabelas (Gmail, Outlook e Mail do iPhone). */

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const STEPS = [
  ["Cadastre o primeiro paciente", "Dados, foto e anamnese, direto do celular."],
  ["Marque o odontograma", "Toque no dente, escolha a condição e anote o que viu."],
  ["Gere o PDF da ficha", "No modelo da ficha impressa, pronto para imprimir ou enviar."],
  ["Organize a agenda", "Horários no estilo do calendário do iPhone, com envio ao Google Agenda."],
] as const;

export function welcomeEmail({ name, siteUrl }: { name: string; siteUrl: string }) {
  const first = escapeHtml(name.trim().split(/\s+/)[0] || "");
  const greeting = first ? `Boas-vindas, ${first}!` : "Boas-vindas ao Odontra!";
  const panel = `${siteUrl}/painel`;

  const steps = STEPS.map(
    ([title, text], i) => `
        <tr>
          <td width="36" valign="top" style="padding:0 0 18px 0;">
            <div style="width:28px;height:28px;border-radius:14px;background:#e8efff;color:#2357d9;font-size:13px;font-weight:700;line-height:28px;text-align:center;">${i + 1}</div>
          </td>
          <td valign="top" style="padding:3px 0 18px 8px;">
            <p style="margin:0;font-size:15px;font-weight:700;color:#0e2240;">${title}</p>
            <p style="margin:2px 0 0 0;font-size:14px;line-height:1.5;color:#5b6b84;">${text}</p>
          </td>
        </tr>`,
  ).join("");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Você se inscreveu no Odontra</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Helvetica,Arial,sans-serif;color:#13233f;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">Sua conta está pronta. Veja como começar em poucos minutos.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #d9e1ec;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#0e2240;padding:22px 32px;">
        <img src="${siteUrl}/email-logo.png" width="108" height="34" alt="Odontra" style="display:block;border:0;height:34px;width:auto;">
      </td></tr>
      <tr><td style="background:#0e2240;padding:6px 32px 34px 32px;">
        <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#9cc0ff;">Você se inscreveu no Odontra</p>
        <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:800;color:#ffffff;">${greeting}</h1>
        <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#c9d6ea;">Sua conta está pronta. O Odontra guarda o prontuário dos seus pacientes com segurança e acompanha você no consultório, no celular e no iPad.</p>
      </td></tr>
      <tr><td style="padding:30px 32px 6px 32px;">
        <p style="margin:0 0 18px 0;font-size:13px;font-weight:700;color:#5b6b84;">Para começar</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${steps}
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:6px;"><tr><td style="border-radius:10px;background:#2357d9;">
          <a href="${panel}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">Abrir meu painel</a>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:26px 32px 30px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#0e2240;">Dica: use como app</p>
            <p style="margin:4px 0 0 0;font-size:13px;line-height:1.55;color:#5b6b84;">No iPhone ou iPad, abra o Odontra no Safari, toque em Compartilhar e depois em <strong>Adicionar à Tela de Início</strong>.</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="border-top:1px solid #e3e9f1;padding:18px 32px;background:#f7f9fc;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#7a889e;">Você recebeu este e-mail porque criou uma conta no Odontra, o prontuário odontológico digital. Se não foi você, ignore esta mensagem. Não responda: esta caixa não é monitorada.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = `${greeting}

Sua conta no Odontra está pronta.

Para começar:
${STEPS.map(([t, d], i) => `${i + 1}. ${t}: ${d}`).join("\n")}

Abrir meu painel: ${panel}

Dica: no iPhone ou iPad, abra no Safari > Compartilhar > Adicionar à Tela de Início.`;

  return { subject: "Você se inscreveu no Odontra — boas-vindas!", html, text };
}
