import { apiClient } from '../api/client';
import {
  PincodeLookupResult,
  ShippingRatesResponse,
  ServiceabilityResult,
  Shipment,
  ShipmentTracking,
  AdminShipmentListResponse,
  BookShipmentPayload,
} from '../types';

export const shippingService = {
  /**
   * Validates a 6-digit Indian postal pincode and returns city/state.
   */
  lookupPincode: async (pincode: string): Promise<PincodeLookupResult> => {
    const res = await apiClient.get<PincodeLookupResult>(`/shipping/pincode/${pincode.trim()}`);
    return res.data;
  },

  /**
   * Checks delivery serviceability between pickup origin and customer destination pincode.
   */
  checkServiceability: async (
    destination: string,
    origin?: string,
    paymentMode: 'PREPAID' | 'COD' = 'PREPAID'
  ): Promise<ServiceabilityResult> => {
    const res = await apiClient.post<ServiceabilityResult>('/shipping/serviceability', {
      origin_pincode: origin,
      destination_pincode: destination.trim(),
      payment_mode: paymentMode,
    });
    return res.data;
  },

  /**
   * Calculates live, authoritative shipping rates comparing multiple couriers
   * (Ekart, Delhivery, Bluedart, DTDC, Shadowfax) accounting for bat package dimensions.
   */
  calculateRates: async (payload: {
    destination_pincode: string;
    origin_pincode?: string;
    payment_mode?: 'PREPAID' | 'COD';
    cod_amount?: number;
    items?: Array<{ product_id: string; quantity: number }>;
  }): Promise<ShippingRatesResponse> => {
    const res = await apiClient.post<ShippingRatesResponse>('/shipping/rates', payload);
    return res.data;
  },

  /**
   * Retrieves list of active couriers and service tiers enabled on account.
   */
  getCouriers: async (): Promise<any> => {
    const res = await apiClient.get('/shipping/couriers');
    return res.data;
  },

  /**
   * Customer order tracking with IDOR security validation.
   */
  getOrderTracking: async (orderId: string): Promise<ShipmentTracking> => {
    const res = await apiClient.get<ShipmentTracking>(`/orders/${orderId}/tracking`);
    return res.data;
  },

  /**
   * Public tracking by AWB tracking number.
   */
  getPublicTracking: async (trackingId: string): Promise<ShipmentTracking> => {
    const res = await apiClient.get<ShipmentTracking>(`/track/${trackingId.trim()}`);
    return res.data;
  },

  /**
   * Admin: List all shipments with filtering, search, and pagination.
   */
  getAdminShipments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    courier?: string;
    search?: string;
  }): Promise<AdminShipmentListResponse> => {
    const res = await apiClient.get<AdminShipmentListResponse>('/admin/shipments', {
      params,
    });
    return res.data;
  },

  /**
   * Admin: Retrieve detailed shipment record.
   */
  getAdminShipmentDetails: async (shipmentId: string): Promise<Shipment> => {
    const res = await apiClient.get<Shipment>(`/admin/shipments/${shipmentId}`);
    return res.data;
  },

  /**
   * Admin: Dispatch and book shipment via Courier Uncle API with duplicate protection.
   */
  bookShipment: async (orderId: string, data: BookShipmentPayload): Promise<Shipment> => {
    const res = await apiClient.post<Shipment>(`/admin/orders/${orderId}/book-shipment`, data);
    return res.data;
  },

  /**
   * Admin: Cancel a shipment before carrier pickup.
   */
  cancelShipment: async (shipmentId: string, reason: string): Promise<Shipment> => {
    const res = await apiClient.post<Shipment>(`/admin/shipments/${shipmentId}/cancel`, {
      reason,
    });
    return res.data;
  },

  /**
   * Admin: Download thermal shipping label PDF via secure backend proxy.
   */
  downloadLabel: async (shipmentId: string, size: 'thermal_4x6' | 'a4' = 'thermal_4x6'): Promise<Blob> => {
    const res = await apiClient.get(`/admin/shipments/${shipmentId}/label`, {
      params: { size },
      responseType: 'blob',
    });
    return res.data;
  },

  /**
   * Admin: Courier Uncle prepaid wallet balance and dispatch credit.
   */
  getWalletOverview: async (): Promise<{
    wallet_balance: number;
    floor_balance: number;
    can_book: boolean;
    currency: string;
  }> => {
    const res = await apiClient.get('/admin/shipping/wallet');
    return res.data;
  },
};
