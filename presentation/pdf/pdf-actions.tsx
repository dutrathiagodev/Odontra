import type { Patient } from "@/domain/patient/patient";
import type { Visit } from "@/domain/visit/visit";
import { formatRecordNumber } from "../format";
import { createQrDataUrl } from "../qr-code";
import { getSiteUrl } from "../site-url";

async function buildPdfBlob(patient: Patient, visit: Visit): Promise<Blob> {
  // Importação dinâmica: a biblioteca de PDF só é carregada quando o usuário pede o arquivo.
  const [{ pdf }, { RecordPdf }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./record-pdf"),
  ]);
  const siteUrl = getSiteUrl();
  const qrDataUrl = siteUrl ? await createQrDataUrl(siteUrl, 160) : undefined;
  const logoSrc = `${window.location.origin}/logo-mark-ink.png`;
  return pdf(<RecordPdf patient={patient} visit={visit} logoSrc={logoSrc} qrDataUrl={qrDataUrl} siteUrl={siteUrl} />).toBlob();
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

/** Abre o diálogo de impressão do navegador com o mesmo PDF. */
export async function printRecordPdf(patient: Patient, visit: Visit): Promise<void> {
  const url = URL.createObjectURL(await buildPdfBlob(patient, visit));
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
  frame.src = url;

  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      // Alguns navegadores móveis bloqueiam a impressão em iframe: abre o PDF para imprimir pelo visualizador.
      window.open(url, "_blank");
    }
    setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
    }, 60_000);
  };

  document.body.appendChild(frame);
}
