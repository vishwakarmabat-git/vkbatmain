import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, BatCustomization, Coupon } from '@/types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  
  addItem: (product: Product, customization: BatCustomization, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  applyCoupon: (coupon: Coupon, discount: number) => void;
  removeCoupon: () => void;
  
  // Computed values
  getSubtotal: () => number;
  getGSTAmount: () => number;
  getShippingFee: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      appliedCoupon: null,
      couponDiscount: 0,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (product, customization, quantity = 1) => {
        set((state) => {
          const unit_price = Number(product.price) + Number(customization.extra_cost || 0);
          
          // Generate a deterministic or unique ID based on product and customization
          const customKey = `${product.id}-${customization.weight}-${customization.handle_shape}-${customization.handle_size}-${customization.grip_color}-${customization.sticker_finish}-${customization.custom_engraving || ''}`;
          
          const existingIndex = state.items.findIndex(
            (item) => `${item.product.id}-${item.customization.weight}-${item.customization.handle_shape}-${item.customization.handle_size}-${item.customization.grip_color}-${item.customization.sticker_finish}-${item.customization.custom_engraving || ''}` === customKey
          );

          const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += quantity;
            updatedItems[existingIndex].total_price = updatedItems[existingIndex].quantity * unit_price;
            return { items: updatedItems, isDrawerOpen: isMobile ? false : true };
          } else {
            const newItem: CartItem = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              product,
              quantity,
              customization,
              unit_price,
              total_price: unit_price * quantity
            };
            return { items: [...state.items, newItem], isDrawerOpen: isMobile ? false : true };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId)
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity, total_price: item.unit_price * quantity }
                : item
            )
          };
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null, couponDiscount: 0 }),

      applyCoupon: (coupon, discount) => set({ appliedCoupon: coupon, couponDiscount: discount }),
      removeCoupon: () => set({ appliedCoupon: null, couponDiscount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.total_price, 0);
      },

      getGSTAmount: () => {
        return 0;
      },

      getShippingFee: () => {
        return 0;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        return Math.max(0, subtotal - discount);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'vk_cart_storage',
    }
  )
);
