'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import ToastProvider from '@/contexts/ToastContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
