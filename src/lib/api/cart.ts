import axios from 'axios';

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

const cartApi = axios.create({
  baseURL: `${API_BASE_URL}/cart`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session ID to all requests
cartApi.interceptors.request.use((config) => {
  const sessionId = getSessionId();
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

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
    const { data } = await cartApi.get('');
    return data;
  },

  // Add item to cart
  addItem: async (productId: string, quantity: number = 1, variantId?: string): Promise<CartData> => {
    const { data } = await cartApi.post('/items', {
      productId,
      quantity,
      variantId,
    });
    return data;
  },

  // Update item quantity
  updateQuantity: async (itemId: string, quantity: number): Promise<CartData> => {
    const { data } = await cartApi.patch(`/items/${itemId}`, { quantity });
    return data;
  },

  // Remove item
  removeItem: async (itemId: string): Promise<CartData> => {
    const { data } = await cartApi.delete(`/items/${itemId}`);
    return data;
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    await cartApi.delete('');
  },

  // Merge guest cart with user cart (call after login)
  mergeCart: async (): Promise<CartData> => {
    const { data } = await cartApi.post('/merge');
    return data;
  },
};
