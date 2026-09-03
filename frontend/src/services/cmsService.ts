import { apiClient } from '@/api/client';
import { CMSBanner, Testimonial, FAQ, GalleryItem } from '@/types';

export interface WhyVKFeature {
  number: string;
  title: string;
  description: string;
}

export interface WhyVKSectionData {
  badge: string;
  title: string;
  image_url: string;
  image_badge: string;
  features: WhyVKFeature[];
}

export const cmsService = {
  async getBanners(): Promise<CMSBanner[]> {
    const response = await apiClient.get<CMSBanner[]>('/cms/banners');
    return response.data;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const response = await apiClient.get<Testimonial[]>('/cms/testimonials');
    return response.data;
  },

  async getFAQs(): Promise<FAQ[]> {
    const response = await apiClient.get<FAQ[]>('/cms/faqs');
    return response.data;
  },

  async getGallery(): Promise<GalleryItem[]> {
    const response = await apiClient.get<GalleryItem[]>('/cms/gallery');
    return response.data;
  },

  async getWhyVKSection(): Promise<WhyVKSectionData> {
    const response = await apiClient.get<WhyVKSectionData>('/cms/why-vk');
    return response.data;
  },

  async updateWhyVKSection(data: WhyVKSectionData): Promise<WhyVKSectionData> {
    const response = await apiClient.put<WhyVKSectionData>('/cms/why-vk', data);
    return response.data;
  },

  async uploadMedia(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
