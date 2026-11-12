/** Dados do clique num link, tirados do evento (sem DOM, para dar para testar). */
export interface LinkClick {
  /** `href` já resolvido (absoluto). */
  href: string;
  /** Endereço atual (absoluto). */
  current: string;
  target?: string | null;
  download?: boolean;
  /** Botão do mouse (0 = principal). */
  button: number;
  modifier: boolean;
}

/**
 * O clique leva para outra tela do app, na mesma aba? Só nesse caso vale perguntar "Sair sem salvar?".
 * Fica de fora: abrir em nova aba (Ctrl/Cmd, botão do meio, target), download, outro site,
 * e link para a mesma tela (só muda o #).
 */
export function isInAppNavigation(click: LinkClick): boolean {
  if (click.button !== 0 || click.modifier || click.download) return false;
  if (click.target && click.target !== "_self") return false;

  let to: URL;
  let from: URL;
  try {
    to = new URL(click.href);
    from = new URL(click.current);
  } catch {
    return false;
  }
  if (to.protocol !== "http:" && to.protocol !== "https:") return false;
  if (to.origin !== from.origin) return false;
  return to.pathname !== from.pathname || to.search !== from.search;
}
