"use client";

import { useCallback, useState } from "react";
import type { Patient } from "@/domain/patient/patient";
import type { Visit } from "@/domain/visit/visit";
import { buildRecordPdfFile, openPdfPlaceholderWindow, printPdfFile, showPdfInWindow } from "./pdf-actions";
import { clearPrintNotice, showPdfReady, showPrintError } from "./print-sheet";
import { choosePrintStrategy, readPrintEnvironment } from "./print-strategy";

export interface PrintData {
  patient: Patient;
  visit: Visit;
}

const FAILED = "Não foi possível preparar a impressão agora. Verifique a conexão e tente de novo, ou use Gerar PDF.";

/**
 * Imprimir o prontuário em qualquer aparelho (computador, iPhone, iPad, Android, app instalado).
 * `print()` precisa ser chamado direto no toque do botão: no Safari do iPhone/iPad a aba do PDF é aberta
 * nesse momento, antes de salvar e gerar o arquivo, para o bloqueador de pop-up não barrar.
 * Quando o aparelho só imprime pela folha de compartilhamento, o `PrintSheetHost` mostra "Prontuário pronto".
 */
export function usePrintRecord() {
  const [busy, setBusy] = useState(false);

  /** `load` salva e devolve o paciente e a consulta a imprimir (ou `null` se não deu para salvar). */
  const print = useCallback((load: () => Promise<PrintData | null>) => {
    const env = readPrintEnvironment();
    const strategy = choosePrintStrategy(env);
    const win = strategy === "new-tab" ? openPdfPlaceholderWindow() : null;
    clearPrintNotice();
    setBusy(true);

    void (async () => {
      try {
        const data = await load();
        if (!data) {
          win?.close(); // o erro de salvar já aparece na barra de salvar
          return;
        }
        const file = await buildRecordPdfFile(data.patient, data.visit);
        if (strategy === "iframe") await printPdfFile(file);
        else if (win && !win.closed) showPdfInWindow(win, file);
        // Compartilhamento, ou a aba foi bloqueada/fechada: um segundo toque resolve.
        else showPdfReady(file, env.canShareFiles);
      } catch {
        win?.close();
        showPrintError(FAILED);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  return { print, busy };
}
