import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WishlistSidebar from '@/components/layout/WishlistSidebar';
import Providers from '@/components/Providers';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

const inter = Inter({ subsets: ['latin'] });

const translations = { es, en };

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const langCookie = cookieStore.get('preferredLanguage');
  const lang = (langCookie?.value === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = translations[lang];

  return {
    title: t.metadata.title,
    description: t.metadata.description,
    keywords: t.metadata.keywords.split(', '),
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
    },
  };
}

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
