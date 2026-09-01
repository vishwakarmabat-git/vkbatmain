# ⚡ Real-Time Synchronization System (WebSocket / Zero-Refresh)

The **Vishwakarma Bat House** platform features a fully reactive, bidirectional, asynchronous real-time synchronization system built with **FastAPI WebSockets** on the backend and **React 19 + TanStack Query + Zustand** on the frontend.

Whenever an authorized administrator or customer performs any database mutation (Create, Read, Update, Delete, Status change, Stock deduction), all connected clients receive event messages instantaneously over persistent WebSocket channels. **No browser refreshes (`window.location.reload()`) or polling intervals (`setInterval()`) are required.**

---

## 🏛️ Real-Time Architecture

```
┌────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                  │
│               (Single Source of Truth)                 │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. db.commit()
                           ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│             app/utils/realtime.py                      │
│       emit_realtime_event(channel, event, data)        │
└──────────────────────────┬─────────────────────────────┘
                           │ 2. Broadcast via WebSocket
                           ▼
┌────────────────────────────────────────────────────────┐
│              ConnectionManager (Singleton)             │
│                 app/core/websocket.py                  │
│                                                        │
│  • Public Channel   (All connected browsers)           │
│  • Admin Channel    (Authenticated Admins)             │
│  • User Channel     (Direct targeted customer: user_id)│
└──────────────────────────┬─────────────────────────────┘
                           │ 3. ws:// or wss:// Stream
                           ▼
┌────────────────────────────────────────────────────────┐
│             Frontend Realtime Client & Provider        │
│          frontend/src/realtime/realtimeClient.ts       │
│          frontend/src/realtime/RealtimeProvider.tsx    │
│                                                        │
│  • Auto-reconnect with exponential backoff             │
│  • JWT Handshake on login/logout                       │
│  • Heartbeat ping/pong keepalive (25s)                 │
│  • TanStack Query invalidation (['products'], etc.)    │
│  • Custom Event dispatching (vk:realtime:*)            │
│  • Live Sonner Toast notifications                     │
└────────────────────────────────────────────────────────┘
```

---

## 📡 Channel Specifications

| Channel Name | Target Audience | Access Criteria | Description |
| :--- | :--- | :--- | :--- |
| **`public`** | All active storefront visitors & admins | Open to all clients (guest & authenticated) | Broadcasts catalog changes, live stock quantity updates, new approved reviews, and hero banners. |
| **`admin`** | Store Admins & Superadmins | Valid JWT with `role: "admin"` or `role: "superadmin"` | Broadcasts live order placements, coupon modifications, review moderation queues, and executive analytics updates. |
| **`user:{user_id}`** | Individual Customer | Valid JWT where `sub == user_id` | Direct notification of personal order status changes, tracking numbers, and payment confirmations. |

---

## 📊 Real-Time Event Matrix

| Event Name | Channel | Entity | Trigger Action | Frontend Reactive Action |
| :--- | :--- | :--- | :--- | :--- |
| **`PRODUCT_CREATED`** | `public` | `product` | Admin adds new cricket bat to catalog | Invalidates `['products']`, `['categories']`, updates catalog and home page instantly. |
| **`PRODUCT_UPDATED`** | `public` | `product` | Admin modifies bat specs, price, or images | Invalidates `['products']`, updates product details, product card prices. |
| **`PRODUCT_DELETED`** | `public` | `product` | Admin deletes bat model | Removes bat from storefront and admin table instantly. |
| **`CATEGORY_CREATED`** | `public` | `category` | Admin adds new bat edition / series | Invalidate `['categories']`, updates navigation and category grids. |
| **`CATEGORY_UPDATED`** | `public` | `category` | Admin modifies edition details or banner | Invalidate `['categories']`, updates category display. |
| **`CATEGORY_DELETED`** | `public` | `category` | Admin removes category | Invalidate `['categories']`, releases category slug. |
| **`INVENTORY_UPDATED`** | `public` | `inventory` | Stock adjusted in workshop or deducted on checkout | Updates stock availability badges, low stock warnings, and disable out-of-stock Add to Cart buttons. |
| **`ORDER_CREATED`** | `admin`, `user` | `order` | Customer places an order via COD or Online | Admin receives live order toast & counter increment; customer gets private confirmation. |
| **`ORDER_STATUS_UPDATED`** | `admin`, `user` | `order` | Admin updates status to Dispatched/Delivered | Customer receives instant tracking notification; admin order timeline syncs. |
| **`REVIEW_CREATED`** | `public`, `admin` | `review` | Customer submits review | Admin receives moderation alert; public rating aggregates update upon approval. |
| **`REVIEW_STATUS_UPDATED`**| `public` | `review` | Admin approves/rejects review | Product average star rating and review list re-render immediately. |
| **`BANNER_UPDATED`** | `public` | `banner` | Admin updates hero carousel banner | Storefront hero carousel swaps slides live with smooth animations. |
| **`GALLERY_UPDATED`** | `public` | `gallery` | Admin uploads workshop craftsmanship photo | Workshop gallery displays new photo without reload. |
| **`COUPON_CREATED`** | `admin` | `coupon` | Admin issues discount code | Admin coupon table syncs instantly. |
| **`COUPON_UPDATED`** | `admin` | `coupon` | Admin edits coupon validity or limit | Admin coupon table syncs instantly. |
| **`COUPON_DELETED`** | `admin` | `coupon` | Admin removes coupon | Admin coupon table removes row instantly. |

---

## 🛠️ Frontend Integration API

### 1. Global Provider
The application is wrapped in `<RealtimeProvider>` in [App.tsx](file:///c:/Users/HARSH/OneDrive/Desktop/vkbathouse/frontend/src/App.tsx). It establishes the WebSocket singleton and syncs cache automatically.

```tsx
import { RealtimeProvider } from '@/realtime/RealtimeProvider';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RealtimeProvider>
    </QueryClientProvider>
  );
}
```

### 2. Custom Hooks
Components can subscribe to specific events or custom triggers using the provided hooks:

```tsx
import { useRealtimeSync, useRealtimeEvent } from '@/hooks/useRealtime';

// Auto-refetch when catalog updates
useRealtimeSync(['vk:realtime:products', 'vk:realtime:inventory'], fetchProducts);

// Listen to specific typed event payloads
useRealtimeEvent('ORDER_CREATED', (message) => {
  console.log('New Order Received:', message.data);
});
```

---

## 🔄 Reconnection & Fault Tolerance

1. **Exponential Backoff Reconnect**:
   - If network drops or backend redeploys, reconnection attempts fire at `1s`, `2s`, `4s`, `8s`, up to a maximum of `16s`.
2. **Keepalive Heartbeat**:
   - Ping messages are dispatched every `25s` with automatic Pong acknowledgement.
3. **Dead Socket Cleanup**:
   - Closed or broken client connections are cleaned from memory dictionaries to prevent resource leaks.
4. **Auth State Sync**:
   - When a user logs in or logs out, storage event listeners trigger `realtimeClient.reconnectWithAuth()`, upgrading or downgrading channel subscriptions on the fly.
