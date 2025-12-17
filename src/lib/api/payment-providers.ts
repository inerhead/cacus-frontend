import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface PaymentProvider {
  id: string;
  provider: 'EPAYCO' | 'PAYU' | 'MERCADO_PAGO';
  name: string;
  isEnabled: boolean;
  isTestMode: boolean;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentProviderDto {
  provider: 'EPAYCO' | 'PAYU' | 'MERCADO_PAGO';
  name: string;
  isEnabled?: boolean;
  isTestMode?: boolean;
  config: Record<string, any>;
}

export interface UpdatePaymentProviderDto {
  name?: string;
  isEnabled?: boolean;
  isTestMode?: boolean;
  config?: Record<string, any>;
}

const paymentProvidersApi = {
  async getAll(): Promise<PaymentProvider[]> {
    const response = await fetch(`${API_URL}/payment-providers`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment providers');
    }
    return response.json();
  },

  async getEnabled(): Promise<PaymentProvider[]> {
    const response = await fetch(`${API_URL}/payment-providers/enabled`);
    if (!response.ok) {
      throw new Error('Failed to fetch enabled payment providers');
    }
    return response.json();
  },

  async getById(id: string): Promise<PaymentProvider> {
    const response = await fetch(`${API_URL}/payment-providers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment provider');
    }
    return response.json();
  },

  async create(data: CreatePaymentProviderDto): Promise<PaymentProvider> {
    const session = await getSession();
    console.log('Session for create:', session);
    console.log('Access token from session:', session?.accessToken);
    
    if (!session || !session.accessToken) {
      throw new Error('No estás autenticado. Por favor, cierra sesión y vuelve a iniciar sesión.');
    }
    
    console.log('Creating provider with data:', data);
    
    const response = await fetch(`${API_URL}/payment-providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      
      if (response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión.');
      }
      if (response.status === 403) {
        throw new Error('No tienes permisos para crear proveedores de pago. Debes ser administrador.');
      }
      throw new Error(error.message || 'Failed to create payment provider');
    }

    const result = await response.json();
    console.log('Create response:', result);
    return result;
  },

  async update(id: string, data: UpdatePaymentProviderDto): Promise<PaymentProvider> {
    const session = await getSession();
    const response = await fetch(`${API_URL}/payment-providers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment provider');
    }
    return response.json();
  },

  async toggleEnabled(id: string): Promise<PaymentProvider> {
    const session = await getSession();
    const response = await fetch(`${API_URL}/payment-providers/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle payment provider');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const session = await getSession();
    const response = await fetch(`${API_URL}/payment-providers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete payment provider');
    }
  },
};

export default paymentProvidersApi;
