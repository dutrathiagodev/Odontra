/**
 * Como imprimir o PDF em cada aparelho.
 *
 * - "iframe": computador. Abre o diálogo de impressão do navegador direto (como sempre foi).
 * - "new-tab": Safari do iPhone/iPad (e celulares sem compartilhamento de arquivo). A aba é aberta
 *   na hora do toque (senão o bloqueador de pop-up barra) e recebe o PDF quando ele fica pronto;
 *   a impressão sai pelo botão Compartilhar → Imprimir do visualizador.
 * - "share": app instalado na tela de início, outros navegadores do iOS e Android com compartilhamento de
 *   arquivos. O PDF é gerado e um segundo toque abre a folha de compartilhamento do sistema, que tem Imprimir.
 *   (O compartilhamento precisa de um toque recente; gerar o PDF demora demais para aproveitar o primeiro.)
 */
export type PrintStrategy = "iframe" | "new-tab" | "share";

export interface PrintEnvironment {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  /** Aberto como app instalado (tela de início). */
  standalone: boolean;
  /** `navigator.canShare({ files })` aceita um PDF. */
  canShareFiles: boolean;
}

/** iPhone, iPod e iPad, inclusive o iPadOS que se apresenta como Mac com tela de toque. */
export function isAppleMobile(env: Pick<PrintEnvironment, "userAgent" | "platform" | "maxTouchPoints">): boolean {
  if (/iPad|iPhone|iPod/.test(env.userAgent)) return true;
  const looksLikeMac = env.platform === "MacIntel" || /Macintosh/.test(env.userAgent);
  return looksLikeMac && env.maxTouchPoints > 1;
}

export function isAndroid(env: Pick<PrintEnvironment, "userAgent">): boolean {
  return /Android/i.test(env.userAgent);
}

/** Safari de verdade: no iOS, Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS) e afins também dizem "Safari". */
function isIosSafari(userAgent: string): boolean {
  return /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA|YaBrowser|DuckDuckGo/.test(userAgent);
}

export function choosePrintStrategy(env: PrintEnvironment): PrintStrategy {
  const apple = isAppleMobile(env);
  if (!apple && !isAndroid(env)) return "iframe";
  if (apple && !env.standalone && isIosSafari(env.userAgent)) return "new-tab";
  return env.canShareFiles ? "share" : "new-tab";
}

/** Lê o ambiente do navegador atual. Só no cliente. */
export function readPrintEnvironment(): PrintEnvironment {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  let canShareFiles = false;
  try {
    const probe = new File([""], "prontuario.pdf", { type: "application/pdf" });
    canShareFiles = typeof nav.canShare === "function" && nav.canShare({ files: [probe] });
  } catch {
    canShareFiles = false;
  }
  return {
    userAgent: nav.userAgent,
    platform: nav.platform ?? "",
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    standalone: nav.standalone === true || window.matchMedia?.("(display-mode: standalone)").matches === true,
    canShareFiles,
  };
}
