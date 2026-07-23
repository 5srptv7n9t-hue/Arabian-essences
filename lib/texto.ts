/**
 * Utilidades de medición y wrapping de texto para componer SVG.
 *
 * Sharp/librsvg no calcula saltos de línea automáticos, así que medimos el
 * ancho de cada línea manualmente. No tenemos acceso directo a las métricas
 * de la fuente en tiempo de render, por lo que aproximamos el ancho de cada
 * carácter con una tabla de factores relativos (en unidades de "em") calibrada
 * para Poppins. Es suficientemente precisa para títulos y subtítulos cortos.
 */

// Ancho relativo de cada carácter en fracción del tamaño de fuente (em).
// Calibrado a ojo para Poppins SemiBold/Regular.
const ANCHOS: Record<string, number> = {
  ' ': 0.26,
  i: 0.28,
  j: 0.28,
  l: 0.28,
  I: 0.31,
  '.': 0.3,
  ',': 0.3,
  ':': 0.3,
  ';': 0.3,
  "'": 0.22,
  '!': 0.3,
  '|': 0.24,
  f: 0.34,
  t: 0.36,
  r: 0.4,
  '(': 0.36,
  ')': 0.36,
  '-': 0.4,
  '/': 0.4,
  m: 0.86,
  M: 0.86,
  w: 0.78,
  W: 0.86,
  '@': 0.9,
};

const ANCHO_POR_DEFECTO = 0.56; // ancho medio de una letra en Poppins

/**
 * Estima el ancho en píxeles de un texto para un tamaño de fuente dado.
 */
export function medirTexto(texto: string, tamañoFuente: number): number {
  let ancho = 0;
  for (const char of texto) {
    ancho += (ANCHOS[char] ?? ANCHO_POR_DEFECTO) * tamañoFuente;
  }
  return ancho;
}

/**
 * Divide un texto en líneas que caben dentro de `anchoMax` (px) para el
 * `tamañoFuente` indicado. Corta por palabras; si una palabra sola excede el
 * ancho, la deja igualmente en su propia línea (no parte palabras).
 */
export function dividirEnLineas(
  texto: string,
  anchoMax: number,
  tamañoFuente: number
): string[] {
  const palabras = texto.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [];

  const lineas: string[] = [];
  let actual = '';

  for (const palabra of palabras) {
    const tentativa = actual ? `${actual} ${palabra}` : palabra;
    if (medirTexto(tentativa, tamañoFuente) <= anchoMax || actual === '') {
      actual = tentativa;
    } else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  if (actual) lineas.push(actual);

  return lineas;
}

/**
 * Ajusta el tamaño de fuente hacia abajo hasta que el texto quepa en como
 * máximo `maxLineas` líneas dentro de `anchoMax`. Devuelve las líneas
 * resultantes y el tamaño de fuente final usado.
 */
export function ajustarYDividir(
  texto: string,
  anchoMax: number,
  tamañoFuenteInicial: number,
  maxLineas: number,
  tamañoMinimo = 28
): { lineas: string[]; tamañoFuente: number } {
  let tamaño = tamañoFuenteInicial;
  let lineas = dividirEnLineas(texto, anchoMax, tamaño);

  while (lineas.length > maxLineas && tamaño > tamañoMinimo) {
    tamaño -= 4;
    lineas = dividirEnLineas(texto, anchoMax, tamaño);
  }

  return { lineas, tamañoFuente: tamaño };
}

/**
 * Escapa caracteres reservados de XML/SVG para poder insertar texto del
 * usuario o de Claude dentro de un documento SVG de forma segura.
 */
export function escaparXML(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
