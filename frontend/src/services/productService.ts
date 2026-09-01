import { apiClient } from '@/api/client';
import { Product, Category } from '@/types';

export interface ProductFilterParams {
  category_slug?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  willow_grade?: string;
  pressing_type?: string;
  blade_architecture?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<ProductListResponse> {
    const { data } = await apiClient.get<ProductListResponse>('/products', { params });
    return data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/slug/${slug}`);
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async createProduct(payload: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
  },

  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  }
};

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const { data } = await apiClient.get<Category>(`/categories/${slug}`);
    return data;
  },

  async createCategory(payload: Partial<Category>): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', payload);
    return data;
  },

  async updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  }
};
