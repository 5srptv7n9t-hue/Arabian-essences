# Generador de Carruseles para Instagram

App web donde el usuario escribe un prompt en lenguaje natural describiendo qué
quiere promocionar, y la app genera automáticamente un carrusel de Instagram
listo para publicar (3–5 imágenes, 1080×1350), con caption y hashtags.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (UI oscura, minimalista, una sola pantalla)
- **Sharp** para la composición de imágenes server-side (SVG como capa de texto)
- **API de Anthropic** (`claude-sonnet-4-6`) para el paso creativo
- Sin base de datos: todo en memoria / sesión
- **Deploy:** Netlify

## Flujo

1. El usuario escribe un prompt libre y, opcionalmente, sube 1–3 imágenes de producto (PNG/JPG).
2. `POST /api/generar` llama a Claude con un system prompt que fuerza salida **solo JSON**
   (concepto, paleta, slides, caption, hashtags). La respuesta se parsea de forma
   defensiva (se limpian bloques markdown antes del `JSON.parse`).
3. `POST /api/renderizar` toma ese JSON + las imágenes y compone cada slide con Sharp:
   - Canvas 1080×1350.
   - Si el slide usa imagen del usuario: la foto va de fondo (cover) con un overlay
     oscuro degradado para legibilidad.
   - Si no: fondo sólido/degradado usando la paleta.
   - El texto se compone en SVG con wrapping calculado a mano (`lib/texto.ts`) y una
     tipografía embebida (Poppins, en `public/fonts`) para render consistente.
4. Preview en pantalla de los slides + caption + hashtags.
5. Botón para descargar todo como ZIP (slides + `caption.txt`).

## Estructura

```
/app
  layout.tsx
  page.tsx
  globals.css
  /api
    /generar/route.ts      → llama a Claude, devuelve el JSON
    /renderizar/route.ts   → recibe JSON + imágenes, devuelve PNGs (base64)
/lib
  claude.ts                → cliente y prompt del sistema + parseo defensivo
  render.ts                → lógica de Sharp
  texto.ts                 → utilidades de wrapping de texto
/public/fonts              → Poppins (.ttf) embebida
```

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completá ANTHROPIC_API_KEY
npm run dev
```

Abrí http://localhost:3000

## Deploy en Netlify

1. Conectá el repo en Netlify.
2. Configurá la variable de entorno `ANTHROPIC_API_KEY` (y opcionalmente `ANTHROPIC_MODEL`).
3. El `netlify.toml` ya declara el build (`npm run build`) y el plugin
   `@netlify/plugin-nextjs`, que se encarga de las rutas `/api` como funciones serverless.
