'use client';

import React from 'react';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';

export default function CurrencySelector() {
  const { currencyCode, setCurrency, availableCurrencies } = useCurrency();

  return (
    <div className="relative">
      <select
        value={currencyCode}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="bg-transparent text-black border border-gray-300 px-3 py-1 text-sm font-semibold uppercase cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-lego-yellow"
        aria-label="Select currency"
      >
        {availableCurrencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.code}
          </option>
        ))}
      </select>
    </div>
  );
}
