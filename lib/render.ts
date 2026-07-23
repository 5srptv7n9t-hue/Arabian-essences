import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import type { Carrusel, Paleta, Slide } from './claude';
import { ajustarYDividir, escaparXML } from './texto';

export const ANCHO = 1080;
export const ALTO = 1350;
const PAD = 96;
const ANCHO_TEXTO = ANCHO - PAD * 2;

// ---------------------------------------------------------------------------
// Carga y embebido de la tipografía
// ---------------------------------------------------------------------------
// Embebemos las fuentes como data URI dentro de un @font-face en el SVG. Es la
// forma más portable de que Sharp (librsvg/resvg) renderice una tipografía
// consistente sin depender de fontconfig ni de fuentes instaladas en el SO.

let fontFaceCache: string | null = null;

function cargarFuenteBase64(archivo: string): string {
  const ruta = path.join(process.cwd(), 'public', 'fonts', archivo);
  return fs.readFileSync(ruta).toString('base64');
}

function obtenerFontFaces(): string {
  if (fontFaceCache) return fontFaceCache;

  const regular = cargarFuenteBase64('Poppins-Regular.ttf');
  const semibold = cargarFuenteBase64('Poppins-SemiBold.ttf');
  const bold = cargarFuenteBase64('Poppins-Bold.ttf');

  fontFaceCache = `
    @font-face {
      font-family: 'Poppins';
      font-weight: 400;
      src: url(data:font/ttf;base64,${regular}) format('truetype');
    }
    @font-face {
      font-family: 'Poppins';
      font-weight: 600;
      src: url(data:font/ttf;base64,${semibold}) format('truetype');
    }
    @font-face {
      font-family: 'Poppins';
      font-weight: 700;
      src: url(data:font/ttf;base64,${bold}) format('truetype');
    }
  `;
  return fontFaceCache;
}

// ---------------------------------------------------------------------------
// Helpers de color
// ---------------------------------------------------------------------------

function hexAComponentes(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const num = parseInt(h.slice(0, 6), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Mezcla un color hacia negro (factor<1 oscurece) o blanco (factor>1). */
function oscurecer(hex: string, factor: number): string {
  const { r, g, b } = hexAComponentes(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const nr = clamp(r * factor);
  const ng = clamp(g * factor);
  const nb = clamp(b * factor);
  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// ---------------------------------------------------------------------------
// Construcción del SVG de un slide
// ---------------------------------------------------------------------------

interface OpcionesSVG {
  slide: Slide;
  paleta: Paleta;
  indice: number; // 0-based
  total: number;
  // Si el fondo lo aporta una imagen del usuario, el SVG solo lleva overlay + texto.
  sobreImagen: boolean;
}

function construirSVG({ slide, paleta, indice, total, sobreImagen }: OpcionesSVG): string {
  const { titulo, subtitulo } = slide;

  // --- Layout del texto ---
  const tituloFit = ajustarYDividir(titulo, ANCHO_TEXTO, 88, 4, 44);
  const tituloLineHeight = tituloFit.tamañoFuente * 1.08;
  const tituloAlto = tituloFit.lineas.length * tituloLineHeight;

  let subLineas: string[] = [];
  let subTamaño = 0;
  let subLineHeight = 0;
  let subAlto = 0;
  if (subtitulo) {
    const subFit = ajustarYDividir(subtitulo, ANCHO_TEXTO, 46, 3, 28);
    subLineas = subFit.lineas;
    subTamaño = subFit.tamañoFuente;
    subLineHeight = subTamaño * 1.32;
    subAlto = subLineas.length * subLineHeight;
  }

  const barraAlto = 8;
  const gapBarraTitulo = 44;
  const gapTituloSub = 36;

  const bloqueAlto =
    barraAlto +
    gapBarraTitulo +
    tituloAlto +
    (subLineas.length ? gapTituloSub + subAlto : 0);

  // Anclamos el bloque hacia la parte inferior del canvas.
  const inicioY = ALTO - 150 - bloqueAlto;

  // --- Fondo / overlay ---
  let fondoSVG = '';
  if (sobreImagen) {
    // Gradiente oscuro desde abajo para legibilidad sobre la foto.
    fondoSVG = `
      <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000000" stop-opacity="0.15"/>
        <stop offset="0.55" stop-color="#000000" stop-opacity="0.45"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.82"/>
      </linearGradient>
      <rect width="${ANCHO}" height="${ALTO}" fill="url(#overlay)"/>
    `;
  } else {
    // Fondo con degradado sutil a partir de la paleta.
    const c1 = paleta.fondo;
    const c2 = oscurecer(paleta.fondo, 0.72);
    fondoSVG = `
      <linearGradient id="fondo" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <rect width="${ANCHO}" height="${ALTO}" fill="url(#fondo)"/>
    `;
  }

  // --- Texto: título ---
  let cursorY = inicioY + barraAlto + gapBarraTitulo;
  const titulosSVG = tituloFit.lineas
    .map((linea) => {
      const baseline = cursorY + tituloFit.tamañoFuente * 0.82;
      cursorY += tituloLineHeight;
      return `<text x="${PAD}" y="${baseline}" font-family="Poppins" font-weight="700" font-size="${tituloFit.tamañoFuente}" fill="${paleta.texto}" letter-spacing="-1">${escaparXML(linea)}</text>`;
    })
    .join('\n');

  // --- Texto: subtítulo ---
  let subtitulosSVG = '';
  if (subLineas.length) {
    cursorY += gapTituloSub - (tituloLineHeight - tituloFit.tamañoFuente);
    subtitulosSVG = subLineas
      .map((linea) => {
        const baseline = cursorY + subTamaño * 0.82;
        cursorY += subLineHeight;
        const color = sobreImagen ? '#f0f0f2' : oscurecer(paleta.texto, 0.85);
        return `<text x="${PAD}" y="${baseline}" font-family="Poppins" font-weight="400" font-size="${subTamaño}" fill="${color}">${escaparXML(linea)}</text>`;
      })
      .join('\n');
  }

  // --- Barra de acento sobre el título ---
  const barraSVG = `<rect x="${PAD}" y="${inicioY}" width="92" height="${barraAlto}" rx="4" fill="${paleta.acento}"/>`;

  // --- Contador de slide arriba a la derecha ---
  const contadorColor = sobreImagen ? '#ffffff' : oscurecer(paleta.texto, 0.75);
  const contadorSVG = `
    <text x="${ANCHO - PAD}" y="${PAD + 12}" text-anchor="end" font-family="Poppins" font-weight="600" font-size="30" fill="${contadorColor}" opacity="0.85">${indice + 1} / ${total}</text>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">${obtenerFontFaces()}</style>
  </defs>
  ${fondoSVG}
  ${barraSVG}
  ${titulosSVG}
  ${subtitulosSVG}
  ${contadorSVG}
</svg>`;
}

// ---------------------------------------------------------------------------
// Composición de un slide con Sharp
// ---------------------------------------------------------------------------

export async function renderizarSlide(
  slide: Slide,
  paleta: Paleta,
  indice: number,
  total: number,
  imagenUsuario?: Buffer
): Promise<Buffer> {
  const usarImagen = slide.usaImagenUsuario && !!imagenUsuario;

  const svg = Buffer.from(
    construirSVG({ slide, paleta, indice, total, sobreImagen: usarImagen })
  );

  if (usarImagen && imagenUsuario) {
    // La imagen del usuario ocupa el fondo (cover) y encima va el overlay+texto.
    const fondo = await sharp(imagenUsuario)
      .resize(ANCHO, ALTO, { fit: 'cover', position: 'attention' })
      .toBuffer();

    return sharp(fondo)
      .composite([{ input: svg, top: 0, left: 0 }])
      .png()
      .toBuffer();
  }

  // Sin imagen: el SVG ya trae el fondo con degradado.
  return sharp(svg).png().toBuffer();
}

/**
 * Renderiza todos los slides del carrusel. `imagenes` es la lista de imágenes
 * subidas por el usuario (en orden); se asignan a los slides marcados con
 * usaImagenUsuario a medida que aparecen.
 */
export async function renderizarCarrusel(
  carrusel: Carrusel,
  imagenes: Buffer[]
): Promise<Buffer[]> {
  const total = carrusel.slides.length;
  let idxImagen = 0;

  const resultados: Buffer[] = [];
  for (let i = 0; i < carrusel.slides.length; i++) {
    const slide = carrusel.slides[i];
    let imagen: Buffer | undefined;
    if (slide.usaImagenUsuario && idxImagen < imagenes.length) {
      imagen = imagenes[idxImagen];
      idxImagen++;
    }
    const png = await renderizarSlide(slide, carrusel.paleta, i, total, imagen);
    resultados.push(png);
  }

  return resultados;
}
