import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { realtimeClient } from './realtimeClient';
import { ConnectionStatus, RealtimeMessage } from './realtimeTypes';
import { useAuthStore } from '@/store/authStore';

interface RealtimeContextType {
  status: ConnectionStatus;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  status: 'DISCONNECTED',
  isConnected: false,
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>(realtimeClient.getStatus());
  const queryClient = useQueryClient();
  const { isAdmin, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 1. Listen for connection status changes
    const unsubStatus = realtimeClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // 2. Connect client
    realtimeClient.connect();

    // 3. Central Realtime Event Dispatcher & Query Cache Sync
    const unsubEvents = realtimeClient.subscribe('*', (message: RealtimeMessage) => {
      const { event, entity, data } = message;

      switch (event) {
        case 'PRODUCT_CREATED':
        case 'PRODUCT_UPDATED':
        case 'PRODUCT_DELETED':
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['categories'] });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:products', { detail: message }));
          break;

        case 'CATEGORY_CREATED':
        case 'CATEGORY_UPDATED':
        case 'CATEGORY_DELETED':
          queryClient.invalidateQueries({ queryKey: ['categories'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:categories', { detail: message }));
          break;

        case 'INVENTORY_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:inventory', { detail: message }));
          break;

        case 'ORDER_CREATED':
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['my-orders'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:orders', { detail: message }));

          if (isAdmin) {
            toast.info(`🔔 New Order #${data?.order_number || ''}`, {
              description: `Amount: ₹${Number(data?.grand_total || 0).toLocaleString()} • ${data?.customer_name || 'Customer'}`
            });
          }
          break;

        case 'ORDER_STATUS_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          queryClient.invalidateQueries({ queryKey: ['my-orders'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:orders', { detail: message }));

          if (!isAdmin && isAuthenticated) {
            toast.success(`📦 Order #${data?.order_number || ''} Updated`, {
              description: `Current status: ${(data?.order_status || '').toUpperCase()}`
            });
          }
          break;

        case 'BANNER_UPDATED':
        case 'CMS_UPDATED':
        case 'GALLERY_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['cms-banners'] });
          queryClient.invalidateQueries({ queryKey: ['cms'] });
          queryClient.invalidateQueries({ queryKey: ['gallery'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:cms', { detail: message }));
          break;

        case 'REVIEW_CREATED':
        case 'REVIEW_STATUS_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['reviews'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:reviews', { detail: message }));
          break;

        case 'COUPON_CREATED':
        case 'COUPON_UPDATED':
        case 'COUPON_DELETED':
          queryClient.invalidateQueries({ queryKey: ['coupons'] });
          window.dispatchEvent(new CustomEvent('vk:realtime:coupons', { detail: message }));
          break;

        default:
          break;
      }
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [queryClient, isAdmin, isAuthenticated]);

  return (
    <RealtimeContext.Provider value={{ status, isConnected: status === 'CONNECTED' }}>
      {children}
    </RealtimeContext.Provider>
  );
};
