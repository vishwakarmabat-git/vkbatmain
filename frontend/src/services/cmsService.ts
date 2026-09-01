import { apiClient } from '@/api/client';
import { CMSBanner, Testimonial, FAQ, GalleryItem } from '@/types';

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
};
