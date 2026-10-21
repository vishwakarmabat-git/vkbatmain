import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, BatCustomization, Coupon } from '@/types';
import { apiClient } from '@/api/client';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  globalGstRate: number;
  
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  
  addItem: (product: Product, customization: BatCustomization, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  applyCoupon: (coupon: Coupon, discount: number) => void;
  removeCoupon: () => void;
  setGlobalGstRate: (rate: number) => void;
  syncCartWithServer: () => Promise<void>;
  
  // Computed values
  getSubtotal: () => number;
  getGSTAmount: () => number;
  getEffectiveGSTPercent: () => number;
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
      globalGstRate: 0,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      setGlobalGstRate: (rate: number) => set({ globalGstRate: rate }),

      syncCartWithServer: async () => {
        try {
          // 1. Fetch public settings to get current global store GST rate
          let fetchedGst = get().globalGstRate;
          try {
            const settingsRes = await apiClient.get('/settings/public');
            const data = settingsRes.data;
            fetchedGst = Number(data?.gst_rate ?? data?.gst_percentage ?? 0);
            set({ globalGstRate: fetchedGst });
          } catch (e) {
            // Ignore settings fetch failure
          }

          // 2. Refresh cart items' current product specifications & GST rates
          const currentItems = get().items;
          if (currentItems.length === 0) return;

          const updatedItems = await Promise.all(
            currentItems.map(async (item) => {
              try {
                if (item.product?.slug) {
                  const prodRes = await apiClient.get<Product>(`/products/${item.product.slug}`);
                  if (prodRes.data) {
                    const serverProd = prodRes.data;
                    const finalGstRate = Number(serverProd.gst_rate ?? 0) > 0 ? Number(serverProd.gst_rate) : fetchedGst;
                    const updatedProduct: Product = {
                      ...serverProd,
                      gst_rate: finalGstRate
                    };
                    const unit_price = Number(serverProd.price) + Number(item.customization.extra_cost || 0);
                    return {
                      ...item,
                      product: updatedProduct,
                      unit_price,
                      total_price: unit_price * item.quantity
                    };
                  }
                }
              } catch (e) {
                // If single product fetch fails, ensure fallback GST rate is attached
              }
              const currentRate = Number(item.product?.gst_rate ?? 0);
              const effectiveRate = currentRate > 0 ? currentRate : fetchedGst;
              return {
                ...item,
                product: {
                  ...item.product,
                  gst_rate: effectiveRate
                }
              };
            })
          );

          set({ items: updatedItems });
        } catch (e) {
          console.error('Failed to sync cart with server:', e);
        }
      },

      addItem: (product, customization, quantity = 1) => {
        set((state) => {
          const effectiveGstRate = Number(product.gst_rate ?? 0) > 0 ? Number(product.gst_rate) : state.globalGstRate;
          const productWithGst: Product = {
            ...product,
            gst_rate: effectiveGstRate
          };

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
            updatedItems[existingIndex].unit_price = unit_price;
            updatedItems[existingIndex].product = productWithGst;
            updatedItems[existingIndex].total_price = updatedItems[existingIndex].quantity * unit_price;
            return { items: updatedItems, isDrawerOpen: isMobile ? false : true };
          } else {
            const newItem: CartItem = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              product: productWithGst,
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
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        const discountRatio = subtotal > 0 ? Math.max(0, 1 - discount / subtotal) : 1;
        const globalRate = get().globalGstRate || 0;

        const totalGST = get().items.reduce((sum, item) => {
          const itemRate = Number(item.product?.gst_rate ?? 0);
          const effectiveRate = itemRate > 0 ? itemRate : globalRate;
          if (effectiveRate <= 0) return sum;
          const taxableItemPrice = item.total_price * discountRatio;
          return sum + (taxableItemPrice * effectiveRate) / 100;
        }, 0);

        return Math.round(totalGST * 100) / 100;
      },

      getEffectiveGSTPercent: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        const taxable = Math.max(0, subtotal - discount);
        if (taxable <= 0) return 0;
        const gstAmount = get().getGSTAmount();
        return Math.round((gstAmount / taxable) * 1000) / 10;
      },

      getShippingFee: () => {
        return 0;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        const gst = get().getGSTAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount) + gst + shipping;
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
