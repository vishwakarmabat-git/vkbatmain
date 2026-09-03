import { apiClient } from '@/api/client';

export interface BulkOrderData {
  id: string;
  inquiry_type: string;
  name: string;
  phone: string;
  email?: string;
  club_name?: string;
  order_quantity?: string;
  bat_models?: string;
  details: string;
  status: 'PENDING' | 'CONTACTED' | 'QUOTED' | 'COMPLETED' | 'ARCHIVED';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BulkOrderCreatePayload {
  inquiry_type?: string;
  name: string;
  phone: string;
  email?: string;
  club_name?: string;
  order_quantity?: string;
  bat_models?: string;
  details: string;
}

export const bulkOrderService = {
  // Public inquiry submission
  async submitBulkOrder(data: BulkOrderCreatePayload): Promise<BulkOrderData> {
    const res = await apiClient.post('/bulk-orders', data);
    return res.data;
  },

  // Admin: Get all inquiries
  async getAdminBulkOrders(statusFilter?: string, search?: string): Promise<BulkOrderData[]> {
    const params: Record<string, string> = {};
    if (statusFilter && statusFilter !== 'all') {
      params.status_filter = statusFilter;
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const res = await apiClient.get('/admin/bulk-orders', { params });
    return res.data;
  },

  // Admin: Update status & notes
  async updateStatus(id: string, status: string, admin_notes?: string): Promise<BulkOrderData> {
    const res = await apiClient.put(`/admin/bulk-orders/${id}/status`, {
      status,
      admin_notes,
    });
    return res.data;
  },

  // Admin: Delete inquiry
  async deleteBulkOrder(id: string): Promise<void> {
    await apiClient.delete(`/admin/bulk-orders/${id}`);
  },
};
