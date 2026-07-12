'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // combination of productId_size_color
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  isMobileNavOpen: boolean;
  setMobileNavOpen: (isOpen: boolean) => void;
  triggerToast: (message: string, type?: 'success' | 'error') => void;
  toast: { message: string; type: 'success' | 'error' } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const itemId = `${newItem.productId}_${newItem.size}_${newItem.color}`;
    const existingIndex = cartItems.findIndex((item) => item.id === itemId);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += newItem.quantity;
      saveCart(updated);
    } else {
      saveCart([...cartItems, { ...newItem, id: itemId }]);
    }
    triggerToast(`Added ${newItem.name} to cart!`);
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
    if (item) {
      triggerToast(`Removed ${item.name} from cart.`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setCartOpen,
        isMobileNavOpen,
        setMobileNavOpen,
        triggerToast,
        toast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
