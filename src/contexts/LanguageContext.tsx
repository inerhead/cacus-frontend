'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import es from '@/locales/es.json';
import en from '@/locales/en.json';
import { usersApiClient } from '@/lib/api/users';

type Language = 'es' | 'en';

type Translations = typeof es;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const translations: Record<Language, Translations> = {
  es,
  en,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to set cookie
const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

// Helper to get cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // Load language from cookie or localStorage on mount
    const cookieLang = getCookie('preferredLanguage') as Language;
    const savedLanguage = cookieLang || localStorage.getItem('preferredLanguage') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      // Sync cookie if it was from localStorage
      if (!cookieLang) {
        setCookie('preferredLanguage', savedLanguage);
      }
    }
  }, []);

  // Load user preferences from session when authenticated
  useEffect(() => {
    if (session?.user && (session.user as any)?.preferredLanguage) {
      const userLang = (session.user as any).preferredLanguage as Language;
      if (userLang === 'es' || userLang === 'en') {
        setLanguageState(userLang);
        localStorage.setItem('preferredLanguage', userLang);
        setCookie('preferredLanguage', userLang);
        document.documentElement.lang = userLang;
      }
    }
  }, [session]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
    setCookie('preferredLanguage', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Sync with backend if user is authenticated
    if (session?.user?.id) {
      try {
        const token = (session as any)?.accessToken;
        await usersApiClient.updatePreferences(
          session.user.id,
          { preferredLanguage: lang },
          token
        );
      } catch (error) {
        console.error('Error syncing language preference:', error);
      }
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for easier access to translations
export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
