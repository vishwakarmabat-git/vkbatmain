import { useEffect } from 'react';
import { realtimeClient } from '@/realtime/realtimeClient';
import { EventType, RealtimeEventHandler } from '@/realtime/realtimeTypes';

/**
 * Hook to subscribe to specific realtime events within any component.
 */
export function useRealtimeEvent<T = any>(event: EventType | '*', callback: RealtimeEventHandler<T>) {
  useEffect(() => {
    const unsub = realtimeClient.subscribe<T>(event, callback);
    return () => {
      unsub();
    };
  }, [event, callback]);
}

/**
 * Hook to automatically trigger a refetch function whenever specific custom events fire.
 */
export function useRealtimeSync(eventNames: string | string[], refetchFn: () => void) {
  useEffect(() => {
    const names = Array.isArray(eventNames) ? eventNames : [eventNames];
    const handler = () => {
      refetchFn();
    };

    names.forEach((name) => {
      window.addEventListener(name, handler);
    });

    return () => {
      names.forEach((name) => {
        window.removeEventListener(name, handler);
      });
    };
  }, [eventNames, refetchFn]);
}
