import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique cart entry ID: variantId
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  variantId: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'BOGO';
  value: number;
  minPurchase?: number;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      isCartOpen: false,
      setCartOpen: (isCartOpen) => set({ isCartOpen }),
      addItem: (newItem) => set((state) => {
        const existingIdx = state.items.findIndex(
          (item) => item.variantId === newItem.variantId
        );

        if (existingIdx > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingIdx].quantity += newItem.quantity;
          return { items: updatedItems, isCartOpen: true };
        }

        return {
          items: [...state.items, { ...newItem, id: newItem.variantId }],
          isCartOpen: true,
        };
      }),
      removeItem: (variantId) => set((state) => ({
        items: state.items.filter((item) => item.variantId !== variantId),
      })),
      updateQuantity: (variantId, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        ),
      })),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      clearCart: () => set({ items: [], coupon: null }),
    }),
    {
      name: 'jaraviea-cart-storage',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);
