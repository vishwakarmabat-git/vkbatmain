export type EventType =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'INVENTORY_UPDATED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'REVIEW_CREATED'
  | 'REVIEW_STATUS_UPDATED'
  | 'BANNER_UPDATED'
  | 'GALLERY_UPDATED'
  | 'CMS_UPDATED'
  | 'WHY_VK_UPDATED'
  | 'BULK_ORDER_CREATED'
  | 'BULK_ORDER_UPDATED'
  | 'BULK_ORDER_DELETED'
  | 'COUPON_CREATED'
  | 'COUPON_UPDATED'
  | 'COUPON_DELETED'
  | 'CONNECTED';

export interface RealtimeMessage<T = any> {
  channel: 'public' | 'admin' | string;
  event: EventType;
  entity: 'product' | 'category' | 'order' | 'inventory' | 'review' | 'banner' | 'gallery' | 'coupon' | 'bulk_order' | 'cms' | 'system';
  data: T;
}

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';

export type RealtimeEventHandler<T = any> = (message: RealtimeMessage<T>) => void;
