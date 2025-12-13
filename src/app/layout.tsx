import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tienda CACUS Gift - Juguetes Didácticos para Niños',
  description: 'Encuentra los mejores juguetes educativos y didácticos para el desarrollo de tus hijos. Productos certificados con pedagogías Montessori, Waldorf y más.',
  keywords: ['juguetes educativos', 'juguetes didácticos', 'Montessori', 'STEM', 'desarrollo infantil'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
