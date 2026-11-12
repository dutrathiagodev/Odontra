/**
 * Regras de teclado dos componentes (abas, grupos de opção, diálogos), sem DOM, para testar.
 */

/**
 * Para onde vai o foco numa lista com setas (abas, opções): direita/baixo avança, esquerda/cima volta,
 * dando a volta nas pontas; Home e End vão para a primeira e a última. `null` = tecla não é de navegação.
 */
export function arrowTarget(key: string, index: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (index + 1 + count) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/**
 * Tab dentro de um diálogo: nas pontas, o foco dá a volta em vez de sair para a página de trás.
 * `index` = posição do foco atual entre os focáveis (-1 se está fora). `null` = deixa o navegador seguir.
 */
export function trapTarget(index: number, count: number, shift: boolean): number | null {
  if (count <= 0) return null;
  if (index < 0) return shift ? count - 1 : 0;
  if (shift && index === 0) return count - 1;
  if (!shift && index === count - 1) return 0;
  return null;
}
