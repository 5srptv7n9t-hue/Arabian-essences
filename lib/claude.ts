import Anthropic from '@anthropic-ai/sdk';

// El usuario eligió explícitamente este modelo en la especificación.
// Se puede sobreescribir con la variable de entorno ANTHROPIC_MODEL.
const MODELO = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

export type TipoSlide = 'hook' | 'beneficio' | 'prueba' | 'cta';

export interface Slide {
  tipo: TipoSlide;
  titulo: string;
  subtitulo?: string;
  usaImagenUsuario: boolean;
}

export interface Paleta {
  fondo: string;
  texto: string;
  acento: string;
}

export interface Carrusel {
  concepto: string;
  paleta: Paleta;
  slides: Slide[];
  caption: string;
  hashtags: string[];
}

const SYSTEM_PROMPT = `Sos un director creativo experto en marketing para Instagram. A partir de la descripción de un negocio o producto, diseñás un carrusel de 3 a 5 slides listo para publicar.

Respondé ÚNICAMENTE con un objeto JSON válido, sin ningún texto antes ni después, sin explicaciones y sin bloques de código markdown. La estructura EXACTA debe ser:

{
  "concepto": "string — la idea central del carrusel en una sola frase",
  "paleta": { "fondo": "#hex", "texto": "#hex", "acento": "#hex" },
  "slides": [
    {
      "tipo": "hook" | "beneficio" | "prueba" | "cta",
      "titulo": "string, máximo 6 palabras, con gancho",
      "subtitulo": "string, máximo 14 palabras (opcional, podés omitirlo)",
      "usaImagenUsuario": true | false
    }
  ],
  "caption": "string — el texto del posteo de Instagram, con tono acorde al público",
  "hashtags": ["array de entre 8 y 12 hashtags relevantes, sin el símbolo # incluido o con él, consistente"]
}

Reglas obligatorias:
- Entre 3 y 5 slides. El primer slide debe ser tipo "hook" y el último tipo "cta".
- Los colores de la paleta deben tener buen contraste entre "texto" y "fondo" para que el texto sea legible.
- Los títulos son cortos, potentes y en español rioplatense neutro salvo que el prompt indique otra región.
- Marcá "usaImagenUsuario" en true solo en slides donde una foto de producto potencie el mensaje (típicamente hook, beneficio o prueba), no en todos.
- Todo el contenido en español.
- No inventes datos falsos ni testimonios específicos que el usuario no haya provisto.`;

/**
 * Limpia la respuesta del modelo de forma defensiva: elimina bloques de
 * markdown (\`\`\`json ... \`\`\`) y cualquier texto que rodee al objeto JSON,
 * dejando solo el JSON parseable.
 */
export function limpiarJSON(bruto: string): string {
  let texto = bruto.trim();

  // Quitar fences de markdown tipo ```json ... ``` o ``` ... ```
  const fenceMatch = texto.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    texto = fenceMatch[1].trim();
  }

  // Recortar a lo que va desde la primera "{" hasta la última "}".
  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio !== -1 && fin !== -1 && fin > inicio) {
    texto = texto.slice(inicio, fin + 1);
  }

  return texto.trim();
}

/**
 * Valida y normaliza la estructura devuelta por el modelo. Lanza un Error con
 * un mensaje útil si algo esencial falta.
 */
export function validarCarrusel(data: any): Carrusel {
  if (!data || typeof data !== 'object') {
    throw new Error('La respuesta no es un objeto JSON válido.');
  }
  if (!Array.isArray(data.slides) || data.slides.length === 0) {
    throw new Error('La respuesta no contiene slides.');
  }
  if (!data.paleta || !data.paleta.fondo || !data.paleta.texto) {
    throw new Error('La respuesta no contiene una paleta de colores válida.');
  }

  const paleta: Paleta = {
    fondo: normalizarHex(data.paleta.fondo, '#101014'),
    texto: normalizarHex(data.paleta.texto, '#ffffff'),
    acento: normalizarHex(data.paleta.acento, '#7c5cff'),
  };

  const slides: Slide[] = data.slides.slice(0, 5).map((s: any) => ({
    tipo: ['hook', 'beneficio', 'prueba', 'cta'].includes(s?.tipo) ? s.tipo : 'beneficio',
    titulo: String(s?.titulo ?? '').trim() || 'Sin título',
    subtitulo: s?.subtitulo ? String(s.subtitulo).trim() : undefined,
    usaImagenUsuario: Boolean(s?.usaImagenUsuario),
  }));

  const hashtags: string[] = Array.isArray(data.hashtags)
    ? data.hashtags.map((h: any) => String(h).replace(/^#/, '').trim()).filter(Boolean)
    : [];

  return {
    concepto: String(data.concepto ?? '').trim(),
    paleta,
    slides,
    caption: String(data.caption ?? '').trim(),
    hashtags,
  };
}

function normalizarHex(valor: any, porDefecto: string): string {
  if (typeof valor !== 'string') return porDefecto;
  const v = valor.trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : porDefecto;
}

/**
 * Llama a la API de Claude con el prompt del usuario y devuelve el carrusel
 * ya parseado y validado.
 */
export async function generarCarrusel(promptUsuario: string): Promise<Carrusel> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta la variable de entorno ANTHROPIC_API_KEY. Configurala en tu entorno o en Netlify.'
    );
  }

  const client = new Anthropic({ apiKey });

  const respuesta = await client.messages.create({
    model: MODELO,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: promptUsuario }],
  });

  const bloqueTexto = respuesta.content.find((b) => b.type === 'text');
  if (!bloqueTexto || bloqueTexto.type !== 'text') {
    throw new Error('Claude no devolvió texto.');
  }

  const limpio = limpiarJSON(bloqueTexto.text);

  let data: unknown;
  try {
    data = JSON.parse(limpio);
  } catch {
    throw new Error(
      'No se pudo interpretar la respuesta de Claude como JSON. Probá de nuevo en unos segundos.'
    );
  }

  return validarCarrusel(data);
}
