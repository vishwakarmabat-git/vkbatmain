export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin' | 'superadmin';
  is_active: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  blade_type?: string;
  image_url?: string;
  starting_price: number;
  display_order: number;
  is_active: boolean;
  products_count?: number;
  created_at: string;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface Variant {
  id?: string;
  sku: string;
  weight_option: string;
  handle_shape: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id?: string;
  category_name?: string;
  short_description?: string;
  full_description?: string;
  price: number;
  compare_price?: number;
  discount_percent: number;
  
  willow_grade?: string;
  blade_architecture?: string;
  pressing_type?: string;
  edge_thickness?: string;
  spine_height?: string;
  sweet_spot?: string;
  handle_cane?: string;
  toe_profile?: string;
  grain_count?: string;
  bow_profile?: string;
  
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  status: 'active' | 'draft' | 'archived';
  rating_avg: number;
  reviews_count: number;
  
  seo_title?: string;
  seo_description?: string;
  
  created_at: string;
  images: ProductImage[];
  variants: Variant[];
}

export interface BatCustomization {
  weight: string;
  handle_shape: string;
  handle_size: string;
  grip_pattern: string;
  grip_color: string;
  grip_count: string;
  sticker_finish: string;
  pre_knocking: string;
  oiling: string;
  face_protection: string;
  custom_engraving?: string;
  extra_cost: number;
}

export interface CartItem {
  id: string; // unique item uuid in cart
  product: Product;
  quantity: number;
  customization: BatCustomization;
  unit_price: number;
  total_price: number;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  product_id?: string;
  product_name: string;
  product_sku: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  customization?: BatCustomization;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  gst_percent: number;
  gst_amount: number;
  shipping_fee: number;
  discount_amount: number;
  grand_total: number;
  coupon_code?: string;
  payment_method: 'razorpay' | 'cod' | 'whatsapp';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  shipping_carrier?: string;
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  items: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  times_used: number;
  is_active: boolean;
  valid_until?: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  reviewer_name: string;
  reviewer_email?: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  created_at: string;
  product_name?: string;
}

export interface CMSBanner {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  image_url?: string;
  video_url?: string;
  position: string;
  display_order: number;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role_or_club?: string;
  avatar_url?: string;
  content: string;
  bat_model?: string;
  rating: number;
  display_order: number;
  is_active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

export interface PublicSettings {
  brand_name: string;
  tagline: string;
  gst_percentage: number;
  default_shipping_fee: number;
  free_shipping_threshold: number;
  whatsapp_number: string;
  contact_email: string;
  contact_phone: string;
  workshop_address: string;
  announcement_bar: string;
}

export interface AdminDashboardStats {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  total_products: number;
  low_stock_products: number;
  total_customers: number;
  revenue_growth_percent: number;
  orders_growth_percent: number;
  revenue_chart: { date: string; revenue: number; orders: number }[];
  orders_by_status: { status: string; count: number }[];
  top_selling_products: { name: string; sold: number; revenue: number }[];
  category_sales_distribution: { category: string; value: number }[];
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
