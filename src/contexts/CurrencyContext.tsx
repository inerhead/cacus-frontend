'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getExchangeRate as fetchExchangeRate } from '@/lib/api/settings';
import { usersApiClient } from '@/lib/api/users';

export type CurrencyCode = 'COP' | 'USD';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  exchangeRate: number; // Tasa de cambio respecto a COP (base)
}

// Helper function to generate currencies based on exchange rate
const getCurrencies = (usdToCopRate: number): Record<CurrencyCode, Currency> => {
  return {
    COP: {
      code: 'COP',
      name: 'Peso Colombiano',
      symbol: '$',
      locale: 'es-CO',
      exchangeRate: 1, // Base currency
    },
    USD: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      locale: 'en-US',
      exchangeRate: 1 / usdToCopRate, // Conversión dinámica
    },
  };
};

interface CurrencyContextType {
  currency: Currency;
  currencyCode: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInCOP: number) => string;
  convertPrice: (priceInCOP: number) => number;
  availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('COP');
  const [exchangeRate, setExchangeRate] = useState<number>(4000);
  const [currencies, setCurrencies] = useState(getCurrencies(4000));
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch exchange rate from API on mount
  useEffect(() => {
    setMounted(true);
    
    const loadExchangeRate = async () => {
      try {
        const rate = await fetchExchangeRate();
        setExchangeRate(rate);
        setCurrencies(getCurrencies(rate));
      } catch (error) {
        console.error('Error loading exchange rate:', error);
        // Keep default 4000
      } finally {
        setLoading(false);
      }
    };

    loadExchangeRate();

    // Load currency preference from localStorage
    const saved = localStorage.getItem('currency') as CurrencyCode;
    if (saved && (saved === 'COP' || saved === 'USD')) {
      setCurrencyCode(saved);
    }
  }, []);
  // Load user preferences from session when authenticated
  useEffect(() => {
    if (session?.user && (session.user as any)?.preferredCurrency) {
      const userCurrency = (session.user as any).preferredCurrency as CurrencyCode;
      if (userCurrency === 'COP' || userCurrency === 'USD') {
        setCurrencyCode(userCurrency);
        localStorage.setItem('currency', userCurrency);
      }
    }
  }, [session]);
  // Save to localStorage and sync with DB if authenticated
  const handleSetCurrency = async (code: CurrencyCode) => {
    setCurrencyCode(code);
    if (mounted) {
      localStorage.setItem('currency', code);
      
      // Sync with backend if user is authenticated
      if (session?.user?.id) {
        try {
          const token = (session as any)?.accessToken;
          await usersApiClient.updatePreferences(
            session.user.id,
            { preferredCurrency: code },
            token
          );
        } catch (error) {
          console.error('Error syncing currency preference:', error);
        }
      }
    }
  };

  const currency = currencies[currencyCode];

  // Convert price from COP to selected currency
  const convertPrice = (priceInCOP: number): number => {
    return priceInCOP * currency.exchangeRate;
  };

  // Format price in selected currency
  const formatPrice = (priceInCOP: number): string => {
    const convertedPrice = convertPrice(priceInCOP);
    
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'COP' ? 0 : 2,
      maximumFractionDigits: currency.code === 'COP' ? 0 : 2,
    }).format(convertedPrice);
  };

  const value: CurrencyContextType = {
    currency,
    currencyCode,
    setCurrency: handleSetCurrency,
    formatPrice,
    convertPrice,
    availableCurrencies: Object.values(currencies),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
