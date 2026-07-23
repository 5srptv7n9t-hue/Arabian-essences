'use client';

import { useCallback, useRef, useState } from 'react';
import type { Carrusel } from '@/lib/claude';

type Estado = 'idle' | 'pensando' | 'disenando' | 'listo';

interface ImagenSubida {
  file: File;
  url: string;
}

const EJEMPLO =
  'Quiero un carrusel para promocionar mi cafetería de especialidad en Mar del Plata, público joven, quiero que vengan a probar el cold brew';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imagenes, setImagenes] = useState<ImagenSubida[]>([]);
  const [estado, setEstado] = useState<Estado>('idle');
  const [error, setError] = useState<string | null>(null);
  const [carrusel, setCarrusel] = useState<Carrusel | null>(null);
  const [slidesPng, setSlidesPng] = useState<string[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  const inputFileRef = useRef<HTMLInputElement>(null);

  const cargando = estado === 'pensando' || estado === 'disenando';

  // -------------------------------------------------------------------------
  // Manejo de imágenes
  // -------------------------------------------------------------------------
  const agregarArchivos = useCallback(
    (files: FileList | File[]) => {
      const validos = Array.from(files).filter((f) =>
        ['image/png', 'image/jpeg', 'image/jpg'].includes(f.type)
      );
      setImagenes((prev) => {
        const combinadas = [...prev];
        for (const f of validos) {
          if (combinadas.length >= 3) break;
          combinadas.push({ file: f, url: URL.createObjectURL(f) });
        }
        return combinadas;
      });
    },
    []
  );

  const quitarImagen = (idx: number) => {
    setImagenes((prev) => {
      const copia = [...prev];
      const [eliminada] = copia.splice(idx, 1);
      if (eliminada) URL.revokeObjectURL(eliminada.url);
      return copia;
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    if (e.dataTransfer.files?.length) agregarArchivos(e.dataTransfer.files);
  };

  // -------------------------------------------------------------------------
  // Generación
  // -------------------------------------------------------------------------
  const generar = async () => {
    if (!prompt.trim() || cargando) return;
    setError(null);
    setCarrusel(null);
    setSlidesPng([]);

    try {
      // Paso 1: concepto (Claude)
      setEstado('pensando');
      const resGen = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const dataGen = await resGen.json();
      if (!resGen.ok) throw new Error(dataGen.error || 'Error al generar el concepto.');
      const carruselGenerado: Carrusel = dataGen.carrusel;
      setCarrusel(carruselGenerado);

      // Paso 2: renderizado (Sharp)
      setEstado('disenando');
      const form = new FormData();
      form.append('carrusel', JSON.stringify(carruselGenerado));
      imagenes.forEach((img, i) => {
        form.append(`imagen${i}`, img.file);
      });
      const resRender = await fetch('/api/renderizar', {
        method: 'POST',
        body: form,
      });
      const dataRender = await resRender.json();
      if (!resRender.ok) throw new Error(dataRender.error || 'Error al renderizar los slides.');
      setSlidesPng(dataRender.imagenes);

      setEstado('listo');
    } catch (e: any) {
      setError(e?.message || 'Ocurrió un error inesperado.');
      setEstado('idle');
    }
  };

  // -------------------------------------------------------------------------
  // Utilidades
  // -------------------------------------------------------------------------
  const copiar = async (texto: string, id: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 1600);
    } catch {
      /* ignore */
    }
  };

  const textoHashtags = carrusel
    ? carrusel.hashtags.map((h) => `#${h}`).join(' ')
    : '';

  const descargarZip = async () => {
    if (!slidesPng.length || !carrusel) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    slidesPng.forEach((dataUrl, i) => {
      const base64 = dataUrl.split(',')[1];
      zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, base64, {
        base64: true,
      });
    });

    const captionTxt = `${carrusel.caption}\n\n${textoHashtags}\n`;
    zip.file('caption.txt', captionTxt);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carrusel-instagram.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const textoEstado =
    estado === 'pensando'
      ? 'Pensando el concepto…'
      : estado === 'disenando'
      ? 'Diseñando slides…'
      : estado === 'listo'
      ? 'Listo'
      : '';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      {/* Encabezado */}
      <header className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-borde bg-panel px-3 py-1 text-xs text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-acento" />
          Generador de carruseles
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Describí qué querés promocionar.
        </h1>
        <p className="mt-3 max-w-xl text-neutral-400">
          Generamos un carrusel de Instagram (1080×1350) listo para publicar:
          slides, caption y hashtags.
        </p>
      </header>

      {/* Prompt */}
      <div className="rounded-2xl border border-borde bg-panel p-4 sm:p-5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={EJEMPLO}
          rows={4}
          disabled={cargando}
          className="w-full resize-none bg-transparent text-base leading-relaxed text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
        />

        {/* Zona de imágenes */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={onDrop}
            onClick={() => inputFileRef.current?.click()}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm transition-colors ${
              arrastrando
                ? 'border-acento bg-acento/10 text-neutral-200'
                : 'border-borde text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Subí 1–3 imágenes de producto (opcional)
          </div>

          {imagenes.map((img, i) => (
            <div key={i} className="relative h-14 w-14 overflow-hidden rounded-lg border border-borde">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => quitarImagen(i)}
                className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-black/70 text-xs text-white hover:bg-black"
                aria-label="Quitar imagen"
              >
                ×
              </button>
            </div>
          ))}

          <input
            ref={inputFileRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) agregarArchivos(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Botón */}
      <div className="mt-5 flex items-center gap-4">
        <button
          onClick={generar}
          disabled={cargando || !prompt.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-acento px-5 py-3 font-medium text-white transition hover:bg-acento/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {cargando ? (
            <>
              <Spinner />
              {textoEstado}
            </>
          ) : (
            'Generar carrusel'
          )}
        </button>

        {estado === 'listo' && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {textoEstado}
          </span>
        )}
      </div>

      {/* Progreso en pasos */}
      {cargando && (
        <div className="mt-4 flex gap-2 text-xs text-neutral-500">
          <Paso activo={estado === 'pensando'} hecho={estado === 'disenando'}>
            Pensando el concepto
          </Paso>
          <Paso activo={estado === 'disenando'} hecho={false}>
            Diseñando slides
          </Paso>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Resultados */}
      {slidesPng.length > 0 && carrusel && (
        <section className="mt-12">
          {carrusel.concepto && (
            <p className="mb-6 text-sm text-neutral-400">
              <span className="text-neutral-500">Concepto: </span>
              {carrusel.concepto}
            </p>
          )}

          {/* Grid de slides */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {slidesPng.map((src, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-borde bg-panel"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  className="aspect-[1080/1350] w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Caption */}
          <div className="mt-8 rounded-2xl border border-borde bg-panel p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-300">Caption</h2>
              <button
                onClick={() => copiar(carrusel.caption, 'caption')}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                {copiado === 'caption' ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
              {carrusel.caption}
            </p>
          </div>

          {/* Hashtags */}
          <div className="mt-4 rounded-2xl border border-borde bg-panel p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-300">Hashtags</h2>
              <button
                onClick={() => copiar(textoHashtags, 'hashtags')}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                {copiado === 'hashtags' ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {carrusel.hashtags.map((h, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-neutral-300"
                >
                  #{h}
                </span>
              ))}
            </div>
          </div>

          {/* Descargar */}
          <button
            onClick={descargarZip}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-borde bg-white px-5 py-3 font-medium text-black transition hover:bg-neutral-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar todo (.zip)
          </button>
        </section>
      )}
    </main>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

function Paso({
  activo,
  hecho,
  children,
}: {
  activo: boolean;
  hecho: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
        activo
          ? 'border-acento/60 text-acento'
          : hecho
          ? 'border-emerald-900/60 text-emerald-400'
          : 'border-borde text-neutral-600'
      }`}
    >
      {hecho ? '✓' : activo ? <Spinner /> : '○'} {children}
    </span>
  );
}
