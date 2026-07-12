import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  slug: string;
  image: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  moveToCart: (item: WishlistItem, variantId: string, size: string, color: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const exists = state.items.some((i) => i.id === item.id);
        if (exists) return state;
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      moveToCart: (item, variantId, size, color) => {
        const { addItem: addCartItem } = useCartStore.getState();
        
        addCartItem({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.discountPrice || item.price,
          size,
          color,
          quantity: 1,
          variantId,
        });

        get().removeItem(item.id);
      },
    }),
    {
      name: 'jaraviea-wishlist-storage',
    }
  )
);
