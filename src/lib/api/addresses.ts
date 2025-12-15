// Use INTERNAL_API_URL for server-side requests (inside Docker network)
// Use NEXT_PUBLIC_API_URL for client-side requests (from browser)
const API_URL = typeof window === 'undefined' 
  ? (process.env.INTERNAL_API_URL || 'http://backend:3000/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

export interface Address {
  id: string;
  userId: string;
  type?: string;
  fullName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressData {
  type?: string;
  fullName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

async function request<T>(
  endpoint: string,
  accessToken?: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const addressesApi = {
  async getAll(accessToken?: string): Promise<Address[]> {
    return request<Address[]>('/addresses', accessToken);
  },

  async getById(id: string, accessToken?: string): Promise<Address> {
    return request<Address>(`/addresses/${id}`, accessToken);
  },

  async create(data: CreateAddressData, accessToken?: string): Promise<Address> {
    return request<Address>('/addresses', accessToken, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateAddressData, accessToken?: string): Promise<Address> {
    return request<Address>(`/addresses/${id}`, accessToken, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string, accessToken?: string): Promise<Address> {
    return request<Address>(`/addresses/${id}`, accessToken, {
      method: 'DELETE',
    });
  },

  async setDefault(id: string, accessToken?: string): Promise<Address> {
    return request<Address>(`/addresses/${id}/set-default`, accessToken, {
      method: 'POST',
    });
  },
};

