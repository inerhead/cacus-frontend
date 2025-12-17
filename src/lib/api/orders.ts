import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
  }

  return headers;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productSnapshot: {
    name: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  taxAmount: number | string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode?: string;
  shippingCountry: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  addressId: string;
  paymentMethod: string;
  notes?: string;
}

export const ordersApiClient = {
  // Create order
  createOrder: async (dto: CreateOrderDto): Promise<Order> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  // Get order by ID
  getOrder: async (orderId: string): Promise<Order> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return response.json();
  },

  // Get user orders
  getUserOrders: async (page: number = 1, limit: number = 10): Promise<{ orders: Order[], meta: any }> => {
    const headers = await getAuthHeaders();
    const url = new URL(`${API_BASE_URL}/orders`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }
    return response.json();
  },
};
