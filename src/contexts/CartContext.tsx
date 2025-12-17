'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { cartApiClient, CartItem as ApiCartItem, CartData } from '@/lib/api/cart';

export interface CartItem extends ApiCartItem {}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartData, setCartData] = useState<CartData>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // Load cart on mount and when auth status changes
  useEffect(() => {
    loadCart();
  }, [status]);

  // Merge guest cart with user cart after login
  useEffect(() => {
    if (session && status === 'authenticated') {
      mergeGuestCart();
    }
  }, [session, status]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const data = await cartApiClient.getCart();
      setCartData(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeGuestCart = async () => {
    // Only merge if there's a guest session to merge
    if (typeof window === 'undefined') return;
    const guestSessionId = localStorage.getItem('guest-session-id');
    if (!guestSessionId) return;

    try {
      const accessToken = (session as any)?.accessToken;
      const data = await cartApiClient.mergeCart(accessToken);
      setCartData(data);
      // Clear guest session after merge
      localStorage.removeItem('guest-session-id');
    } catch (error) {
      console.error('Error merging cart:', error);
      // If merge fails, just load the user's cart
      await loadCart();
    }
  };

  const addItem = async (newItem: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    try {
      const data = await cartApiClient.addItem(
        newItem.productId,
        newItem.quantity || 1,
        newItem.variantId
      );
      setCartData(data);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const data = await cartApiClient.removeItem(itemId);
      setCartData(data);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }
      const data = await cartApiClient.updateQuantity(itemId, quantity);
      setCartData(data);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartApiClient.clearCart();
      setCartData({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const isInCart = (productId: string) => {
    return cartData.items.some((item) => item.productId === productId);
  };

  const refreshCart = async () => {
    await loadCart();
  };

  return (
    <CartContext.Provider
      value={{
        items: cartData.items,
        totalItems: cartData.totalItems,
        totalPrice: cartData.totalPrice,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
