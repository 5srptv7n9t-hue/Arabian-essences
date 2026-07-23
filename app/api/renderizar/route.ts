import { NextRequest, NextResponse } from 'next/server';
import { validarCarrusel } from '@/lib/claude';
import { renderizarCarrusel } from '@/lib/render';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const carruselRaw = form.get('carrusel');
    if (typeof carruselRaw !== 'string') {
      return NextResponse.json(
        { error: 'Falta la definición del carrusel.' },
        { status: 400 }
      );
    }

    let carrusel;
    try {
      carrusel = validarCarrusel(JSON.parse(carruselRaw));
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || 'El carrusel enviado no es válido.' },
        { status: 400 }
      );
    }

    // Recolectar imágenes subidas (imagen0, imagen1, ...) en orden.
    const imagenes: Buffer[] = [];
    const claves = Array.from(form.keys())
      .filter((k) => k.startsWith('imagen'))
      .sort();
    for (const clave of claves) {
      const archivo = form.get(clave);
      if (archivo && typeof archivo !== 'string') {
        const arrayBuffer = await (archivo as File).arrayBuffer();
        imagenes.push(Buffer.from(arrayBuffer));
      }
    }

    const pngs = await renderizarCarrusel(carrusel, imagenes);
    const imagenesBase64 = pngs.map(
      (buf) => `data:image/png;base64,${buf.toString('base64')}`
    );

    return NextResponse.json({ imagenes: imagenesBase64 });
  } catch (err: any) {
    const mensaje =
      err?.message || 'Ocurrió un error al renderizar los slides.';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
