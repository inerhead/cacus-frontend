import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WishlistSidebar from '@/components/layout/WishlistSidebar';
import Providers from '@/components/Providers';

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
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <WishlistSidebar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
