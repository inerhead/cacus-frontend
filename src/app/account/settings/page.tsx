'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { useToastContext } from '@/contexts/ToastContext';
import { getExchangeRate, updateExchangeRate } from '@/lib/api/settings';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { showToast } = useToastContext();
  const [mounted, setMounted] = useState(false);
  const [usdToCopRate, setUsdToCopRate] = useState('4000');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Verificar que es admin
    if (session && (session.user as any)?.role !== 'admin') {
      router.push('/account');
      return;
    }

    // Cargar tasa actual desde la API
    const loadRate = async () => {
      try {
        const rate = await getExchangeRate();
        setUsdToCopRate(rate.toString());
      } catch (error) {
        console.error('Error loading rate:', error);
      }
    };

    loadRate();
  }, [session, router]);

  if (!mounted || !session) {
    return null;
  }

  if ((session.user as any)?.role !== 'admin') {
    return null;
  }

  const handleSave = async () => {
    const rate = parseFloat(usdToCopRate);
    
    if (isNaN(rate) || rate <= 0) {
      showToast(t.account.settings.rateError, 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = (session as any)?.accessToken;
      if (!token) {
        showToast(t.account.settings.authError, 'error');
        setIsLoading(false);
        return;
      }

      await updateExchangeRate(rate, token);

      showToast(t.account.settings.saveSuccess, 'success');
    } catch (error) {
      console.error('Error saving rate:', error);
      showToast(t.account.settings.saveError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const currentRate = parseFloat(usdToCopRate);
  const exampleCOP = 100000;
  const exampleUSD = currentRate > 0 ? (exampleCOP / currentRate).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black uppercase">
              ⚙️ {t.account.settings.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {t.account.settings.subtitle}
            </p>
          </div>
          <Button 
            variant="primary"
            size="medium"
            onClick={() => router.push('/account')}
            type="button"
          >
            ← {t.account.backToProfile}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black uppercase">
            💱 {t.account.settings.exchangeRateTitle}
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {t.account.settings.rateLabel}
            </label>
            <input
              type="number"
              value={usdToCopRate}
              onChange={(e) => setUsdToCopRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lego-yellow text-lg"
              placeholder={t.account.settings.ratePlaceholder}
              step="0.01"
              min="0"
            />
            <p className="text-sm text-gray-500 mt-2">
              {t.account.settings.rateHelp}
            </p>
          </div>

          {/* Preview */}
          {currentRate > 0 && (
            <div className="bg-gray-50 p-4 rounded mb-6">
              <h3 className="font-semibold mb-2 text-black">{t.account.settings.preview}</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>1 USD</strong> = <strong>${currentRate.toLocaleString('es-CO')} COP</strong>
                </p>
                <p>
                  <strong>$100.000 COP</strong> = <strong>${exampleUSD} USD</strong>
                </p>
                <p className="text-gray-600 mt-3">
                  <strong>{t.account.settings.example}</strong><br />
                  Precio: $89.900 COP = ${(89900 / currentRate).toFixed(2)} USD
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="large"
              onClick={handleSave}
              disabled={isLoading}
              type="button"
              className="flex-1"
            >
              {isLoading ? t.account.settings.saving : `💾 ${t.account.settings.saveChanges}`}
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => setUsdToCopRate('4000')}
              type="button"
            >
              {t.account.settings.reset}
            </Button>
          </div>
        </div>

        {/* Sección de información */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 text-black uppercase">
            ℹ️ {t.account.settings.systemInfo}
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">{t.account.settings.baseCurrency}</span>
              <span>{t.account.settings.baseCurrencyValue}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">{t.account.settings.availableCurrencies}</span>
              <span>{t.account.settings.availableCurrenciesValue}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">{t.account.settings.lastUpdate}</span>
              <span>{new Date().toLocaleDateString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{t.account.settings.storage}</span>
              <span>{t.account.settings.storageValue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
