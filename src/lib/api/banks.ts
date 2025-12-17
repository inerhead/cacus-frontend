import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Bank {
  id: string;
  code: string;
  name: string;
  country: string;
  isActive: boolean;
  sortOrder: number;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankDto {
  code: string;
  name: string;
  country?: string;
  isActive?: boolean;
  sortOrder?: number;
  logoUrl?: string;
}

export interface ImportBanksDto {
  banks: CreateBankDto[];
}

export const banksApi = {
  // Public endpoint - no auth required
  async getActive(country?: string): Promise<Bank[]> {
    const url = new URL(`${API_URL}/banks/active`);
    if (country) {
      url.searchParams.append('country', country);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch active banks: ${response.statusText}`);
    }
    return response.json();
  },

  // Admin endpoints - require auth
  async getAll(): Promise<Bank[]> {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_URL}/banks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banks: ${response.statusText}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<Bank> {
    const response = await fetch(`${API_URL}/banks/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bank: ${response.statusText}`);
    }
    return response.json();
  },

  async create(data: CreateBankDto): Promise<Bank> {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_URL}/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create bank');
    }
    return response.json();
  },

  async update(id: string, data: Partial<CreateBankDto>): Promise<Bank> {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_URL}/banks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update bank');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_URL}/banks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete bank: ${response.statusText}`);
    }
  },

  async toggleActive(id: string): Promise<Bank> {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_URL}/banks/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle bank status: ${response.statusText}`);
    }
    return response.json();
  },

  async importBanks(data: ImportBanksDto): Promise<{ success: number; failed: number; errors: string[] }> {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_URL}/banks/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to import banks');
    }
    return response.json();
  },
};
