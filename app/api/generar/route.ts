import { NextRequest, NextResponse } from 'next/server';
import { generarCarrusel } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json(
        { error: 'Escribí una descripción de lo que querés promocionar.' },
        { status: 400 }
      );
    }

    const carrusel = await generarCarrusel(prompt);
    return NextResponse.json({ carrusel });
  } catch (err: any) {
    const mensaje =
      err?.message || 'Ocurrió un error inesperado al generar el concepto.';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
