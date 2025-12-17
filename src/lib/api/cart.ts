import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Get or create session ID for guest users
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('guest-session-id');
  if (!sessionId) {
    sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest-session-id', sessionId);
  }
  return sessionId;
};

// Get headers with session ID and auth token
async function getCartHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add session ID
  const sessionId = getSessionId();
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  // Add auth token if user is logged in
  if (typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
  }

  return headers;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  primaryImageUrl?: string;
  slug?: string;
}

export interface CartData {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

export const cartApiClient = {
  // Get cart
  getCart: async (): Promise<CartData> => {
    const headers = await getCartHeaders();
    const response = await fetch(`${API_BASE_URL}/cart`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    return response.json();
  },

  // Add item to cart
  addItem: async (productId: string, quantity: number = 1, variantId?: string): Promise<CartData> => {
    const headers = await getCartHeaders();
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity, variantId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add item to cart');
    }
    return response.json();
  },

  // Update item quantity
  updateQuantity: async (itemId: string, quantity: number): Promise<CartData> => {
    const headers = await getCartHeaders();
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update item quantity');
    }
    return response.json();
  },

  // Remove item
  removeItem: async (itemId: string): Promise<CartData> => {
    const headers = await getCartHeaders();
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
    return response.json();
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    const headers = await getCartHeaders();
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  },

  // Merge guest cart with user cart (call after login)
  mergeCart: async (accessToken?: string): Promise<CartData> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const sessionId = getSessionId();
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/cart/merge`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Failed to merge cart');
    }
    return response.json();
  },
};
