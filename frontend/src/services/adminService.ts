import { apiClient } from '@/api/client';
import {
  CMSBanner, Testimonial, FAQ, GalleryItem,
  PublicSettings, AdminDashboardStats, Order, User, Review, Coupon
} from '@/types';

export const cmsService = {
  async getBanners(): Promise<CMSBanner[]> {
    const { data } = await apiClient.get<CMSBanner[]>('/cms/banners');
    return data;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const { data } = await apiClient.get<Testimonial[]>('/cms/testimonials');
    return data;
  },

  async getFAQs(): Promise<FAQ[]> {
    const { data } = await apiClient.get<FAQ[]>('/cms/faqs');
    return data;
  },

  async getGallery(category?: string): Promise<GalleryItem[]> {
    const { data } = await apiClient.get<GalleryItem[]>('/cms/gallery', { params: { category } });
    return data;
  }
};

export const settingsService = {
  async getPublicSettings(): Promise<PublicSettings> {
    const { data } = await apiClient.get<PublicSettings>('/settings/public');
    return data;
  },

  async updateBatchSettings(settings: Record<string, string>) {
    const { data } = await apiClient.put('/settings/batch', { settings });
    return data;
  }
};

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const { data } = await apiClient.get<AdminDashboardStats>('/admin/dashboard');
    return data;
  },

  async getOrders(status_filter?: string, search?: string): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/admin/orders', { params: { status_filter, search } });
    return data;
  },

  async exportOrdersExcel(params?: {
    startDate?: string;
    endDate?: string;
    statusFilter?: string;
    search?: string;
  }): Promise<void> {
    const response = await apiClient.get('/admin/orders/export-excel', {
      params: {
        start_date: params?.startDate || undefined,
        end_date: params?.endDate || undefined,
        status_filter: params?.statusFilter || undefined,
        search: params?.search || undefined,
      },
      responseType: 'blob',
    });

    let filename = 'VK_Orders_Export.xlsx';
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  async updateOrderStatus(orderId: string, payload: {
    order_status?: string;
    payment_status?: string;
    tracking_number?: string;
    shipping_carrier?: string;
    admin_notes?: string;
  }): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/admin/orders/${orderId}/status`, payload);
    return data;
  },

  async getCustomers(search?: string): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/admin/customers', { params: { search } });
    return data;
  },

  async toggleCustomerStatus(userId: string): Promise<User> {
    const { data } = await apiClient.put<User>(`/admin/customers/${userId}/status`);
    return data;
  },

  async deleteCustomer(userId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete(`/admin/customers/${userId}`);
    return data;
  },

  async getReviews(): Promise<Review[]> {
    const { data } = await apiClient.get<Review[]>('/reviews/admin/all');
    return data;
  },

  async updateReviewStatus(id: string, payload: { status: string; is_featured?: boolean }): Promise<Review> {
    const { data } = await apiClient.put<Review>(`/reviews/admin/${id}/status`, payload);
    return data;
  },

  async getCoupons(): Promise<Coupon[]> {
    const { data } = await apiClient.get<Coupon[]>('/coupons');
    return data;
  },

  async createCoupon(payload: Partial<Coupon>): Promise<Coupon> {
    const { data } = await apiClient.post<Coupon>('/coupons', payload);
    return data;
  },

  async deleteCoupon(id: string) {
    const { data } = await apiClient.delete(`/coupons/${id}`);
    return data;
  },

  async getActivityLogs(): Promise<any[]> {
    const { data } = await apiClient.get<any[]>('/admin/activity-logs');
    return data;
  },

  async getSettings(): Promise<Record<string, string>> {
    const { data } = await apiClient.get<Record<string, string>>('/settings/all');
    return data;
  },

  async updateSettings(settings: Record<string, string>) {
    const { data } = await apiClient.put('/settings/batch', { settings });
    return data;
  },

  async getAdminUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/admin/users');
    return data;
  },

  async createAdminUser(payload: { email: string; full_name: string; password: string; role: string }): Promise<User> {
    const { data } = await apiClient.post<User>('/admin/users', payload);
    return data;
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ url: string; filename: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
};

