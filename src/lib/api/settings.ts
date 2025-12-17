const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ExchangeRateResponse {
  usdToCopRate: number;
}

/**
 * Get the current USD to COP exchange rate (public endpoint)
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/settings/exchange-rate`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data: ExchangeRateResponse = await response.json();
    return data.usdToCopRate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback to default rate
    return 4000;
  }
}

/**
 * Update the USD to COP exchange rate (admin only)
 */
export async function updateExchangeRate(
  rate: number,
  token: string
): Promise<ExchangeRateResponse> {
  const response = await fetch(`${API_URL}/settings/exchange-rate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rate }),
  });

  if (!response.ok) {
    throw new Error('Failed to update exchange rate');
  }
  return response.json();
}
