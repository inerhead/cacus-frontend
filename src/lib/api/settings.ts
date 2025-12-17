import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ExchangeRateResponse {
  usdToCopRate: number;
}

/**
 * Get the current USD to COP exchange rate (public endpoint)
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const response = await axios.get<ExchangeRateResponse>(
      `${API_URL}/settings/exchange-rate`
    );
    return response.data.usdToCopRate;
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
  const response = await axios.patch<ExchangeRateResponse>(
    `${API_URL}/settings/exchange-rate`,
    { rate },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
