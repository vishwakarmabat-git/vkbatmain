import { apiClient } from '@/api/client';
import { Order, BatCustomization, Coupon } from '@/types';

export interface CreateOrderPayload {
  shipping_address: {
    full_name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    product_id: string;
    quantity: number;
    customization?: BatCustomization;
  }[];
  coupon_code?: string;
  payment_method: 'razorpay' | 'cod' | 'whatsapp';
  customer_notes?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return data;
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders/my-orders');
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },

  async trackOrder(orderNumber: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/track/${orderNumber}`);
    return data;
  },

  async generateWhatsAppOrder(payload: {
    items: { product_id: string; quantity: number; customization?: BatCustomization }[];
    customer_name: string;
    customer_phone: string;
    city: string;
    notes?: string;
  }): Promise<{ whatsapp_url: string; message: string; estimated_total: number }> {
    const { data } = await apiClient.post('/orders/whatsapp-order', payload);
    return data;
  },

  async createRazorpayOrder(orderId: string) {
    const { data } = await apiClient.post(`/payments/create-razorpay-order/${orderId}`);
    return data;
  },

  async verifyPayment(payload: {
    order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { data } = await apiClient.post('/payments/verify', payload);
    return data;
  }
};

export const couponService = {
  async validateCoupon(code: string, cart_subtotal: number): Promise<{
    is_valid: boolean;
    message: string;
    discount_amount: number;
    coupon?: Coupon;
  }> {
    const { data } = await apiClient.post('/coupons/validate', { code, cart_subtotal });
    return data;
  }
};
