import type { Patient } from "@/domain/patient/patient";
import { resolveDentist, type Profile } from "@/domain/profile/profile";
import type { Visit } from "@/domain/visit/visit";
import { getProfile } from "@/infrastructure/container";
import { withTimeout } from "../async/with-timeout";
import { formatRecordNumber } from "../format";
import { createQrDataUrl } from "../qr-code";
import { getSiteUrl } from "../site-url";

/** Perfil só para completar a assinatura: se não carregar, o PDF sai com o que está na consulta. */
async function loadProfileForSignature(visit: Visit): Promise<Profile | null> {
  if (visit.dentist.name.trim() && visit.dentist.cro.trim()) return null;
  try {
    return await withTimeout(getProfile.execute(), 8_000);
  } catch {
    return null;
  }
}

async function buildPdfBlob(patient: Patient, visit: Visit): Promise<Blob> {
  // Importação dinâmica: a biblioteca de PDF só é carregada quando o usuário pede o arquivo.
  const [{ pdf }, { RecordPdf }, profile] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./record-pdf"),
    loadProfileForSignature(visit),
  ]);
  const signed: Visit = { ...visit, dentist: resolveDentist(visit.dentist, profile) };
  const siteUrl = getSiteUrl();
  const qrDataUrl = siteUrl ? await createQrDataUrl(siteUrl, 160) : undefined;
  const logoSrc = `${window.location.origin}/logo-mark-ink.png`;
  return pdf(<RecordPdf patient={patient} visit={signed} logoSrc={logoSrc} qrDataUrl={qrDataUrl} siteUrl={siteUrl} />).toBlob();
}

function fileName(patient: Patient, visit: Visit): string {
  const slug = patient.identification.name.trim().toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `prontuario-${formatRecordNumber(patient.number)}-${slug || "paciente"}-consulta-${visit.sequence}.pdf`;
}

export async function downloadRecordPdf(patient: Patient, visit: Visit): Promise<void> {
  const url = URL.createObjectURL(await buildPdfBlob(patient, visit));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName(patient, visit);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** O PDF do prontuário como arquivo, pronto para imprimir ou compartilhar. */
export async function buildRecordPdfFile(patient: Patient, visit: Visit): Promise<File> {
  return new File([await buildPdfBlob(patient, visit)], fileName(patient, visit), { type: "application/pdf" });
}

/** Computador: abre o diálogo de impressão do navegador com o PDF num iframe invisível. */
export function printPdfFile(file: File): Promise<void> {
  const url = URL.createObjectURL(file);
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
  frame.src = url;

  return new Promise((resolve) => {
    frame.onload = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } catch {
        // Navegador que não imprime iframe: abre o PDF para imprimir pelo visualizador.
        window.open(url, "_blank");
      }
      setTimeout(() => {
        frame.remove();
        URL.revokeObjectURL(url);
      }, 60_000);
      resolve();
    };
    document.body.appendChild(frame);
  });
}

/**
 * Abre uma aba vazia na hora do toque, antes de gerar o PDF: aberta depois, o bloqueador de pop-up barraria.
 * Devolve `null` se o navegador não deixou abrir.
 */
export function openPdfPlaceholderWindow(): Window | null {
  const win = window.open("", "_blank");
  if (!win) return null;
  try {
    win.document.title = "Prontuário";
    win.document.body.style.cssText = "margin:0;display:grid;place-items:center;min-height:100vh;font:600 17px -apple-system,system-ui,sans-serif;color:#64748b;background:#f8fafc";
    win.document.body.textContent = "Preparando o PDF…";
  } catch {
    // Só a mensagem de espera falhou; a aba continua valendo.
  }
  return win;
}

/** Mostra o PDF na aba aberta no toque. No iPhone/iPad, a impressão sai por Compartilhar → Imprimir. */
export function showPdfInWindow(win: Window, file: File): void {
  const url = URL.createObjectURL(file);
  win.location.replace(url);
  // A aba pode ficar aberta um bom tempo; o endereço do arquivo vive o suficiente para recarregar.
  setTimeout(() => URL.revokeObjectURL(url), 10 * 60_000);
}

/** Folha de compartilhamento do sistema (tem Imprimir). Precisa ser chamada direto do toque. */
export async function sharePdfFile(file: File): Promise<"shared" | "cancelled"> {
  try {
    await navigator.share({ files: [file], title: file.name });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    throw error;
  }
}
