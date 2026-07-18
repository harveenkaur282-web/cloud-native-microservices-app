'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

export type SandboxMode = 'customer' | 'operator';

interface CartItem {
  product: Product;
  quantity: number;
}

interface SandboxContextType {
  mode: SandboxMode;
  setMode: (mode: SandboxMode) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export function SandboxProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SandboxMode>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load initial mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('cloudcart_sandbox_mode');
    if (savedMode === 'operator' || savedMode === 'customer') {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: SandboxMode) => {
    setModeState(newMode);
    localStorage.setItem('cloudcart_sandbox_mode', newMode);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <SandboxContext.Provider
      value={{
        mode,
        setMode,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox() {
  const context = useContext(SandboxContext);
  if (context === undefined) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
}
