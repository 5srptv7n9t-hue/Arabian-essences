import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Generador de Carruseles para Instagram',
  description:
    'Escribí qué querés promocionar y obtené un carrusel de Instagram listo para publicar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
