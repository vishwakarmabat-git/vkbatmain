import { EventType, RealtimeMessage, ConnectionStatus, RealtimeEventHandler } from './realtimeTypes';

class RealtimeClient {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'DISCONNECTED';
  private listeners: Map<EventType | '*', Set<RealtimeEventHandler>> = new Map();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectDelay = 16000;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private isManuallyClosed = false;

  constructor() {
    // Listen to storage events to reconnect when login/logout happens in other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'vk_auth_storage') {
          this.reconnectWithAuth();
        }
      });
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => {
      try {
        fn(newStatus);
      } catch (err) {
        console.error('[Realtime] Error in status listener:', err);
      }
    });
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const authData = localStorage.getItem('vk_auth_storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.state?.token || null;
      }
    } catch (e) {
      // silent
    }
    return null;
  }

  private buildWebSocketUrl(): string {
    const apiUrl = (import.meta.env.VITE_API_URL as string) || '/api/v1';
    let wsBase: string;

    if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
      wsBase = apiUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsBase = `${protocol}//${host}${apiUrl.startsWith('/') ? apiUrl : `/${apiUrl}`}`;
    }

    const cleanBase = wsBase.replace(/\/+$/, '');
    const token = this.getAuthToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${cleanBase}/ws${query}`;
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isManuallyClosed = false;
    this.setStatus(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    const wsUrl = this.buildWebSocketUrl();
    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.setStatus('CONNECTED');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const payload: RealtimeMessage = JSON.parse(event.data);
          this.dispatchEvent(payload);
        } catch (e) {
          // Heartbeat / ping pong ignored
        }
      };

      this.socket.onerror = (error) => {
        this.setStatus('ERROR');
      };

      this.socket.onclose = (event) => {
        this.stopHeartbeat();
        if (!this.isManuallyClosed) {
          this.setStatus('DISCONNECTED');
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.setStatus('ERROR');
      this.scheduleReconnect();
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          // silent
        }
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    // Exponential backoff: 1s, 2s, 4s, 8s, max 16s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    this.setStatus('RECONNECTING');

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  public reconnectWithAuth() {
    if (this.socket) {
      this.isManuallyClosed = true;
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    this.connect();
  }

  public disconnect() {
    this.isManuallyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('DISCONNECTED');
  }

  public subscribe<T = any>(event: EventType | '*', callback: RealtimeEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Auto connect on first listener
    if (this.status === 'DISCONNECTED') {
      this.connect();
    }

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private dispatchEvent(message: RealtimeMessage) {
    // Specific event listeners
    const specificListeners = this.listeners.get(message.event);
    if (specificListeners) {
      specificListeners.forEach((cb) => {
        try {
          cb(message);
        } catch (e) {
          console.error('[Realtime] Callback error:', e);
        }
      });
    }

    // Catch-all listeners
    const allListeners = this.listeners.get('*');
    if (allListeners) {
      allListeners.forEach((cb) => {
        try {
          cb(message);
        } catch (e) {
          console.error('[Realtime] Catch-all callback error:', e);
        }
      });
    }
  }
}

export const realtimeClient = new RealtimeClient();
