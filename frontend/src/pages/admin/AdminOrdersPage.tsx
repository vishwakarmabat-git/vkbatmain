import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, Eye, Filter, CheckCircle2 } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    adminService
      .getOrders(statusFilter || undefined, search || undefined)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  // Realtime instant auto-sync without refresh
  useRealtimeSync('vk:realtime:orders', fetchOrders);

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            FULFILLMENT & DISPATCH PIPELINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            CUSTOMER ORDERS ({orders.length})
          </h1>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 font-sport text-xs">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (st) params.set('status', st);
                else params.delete('status');
                setSearchParams(params);
              }}
              className={`px-3 py-1.5 rounded-xs font-bold uppercase transition-all ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-[#09090B]'
                  : 'bg-[#121216] border border-[#24242D] text-[#A1A1AA] hover:text-white'
              }`}
            >
              {st || 'ALL ORDERS'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto flex-1 min-w-0 sm:min-w-[220px]">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-xs font-sport tracking-wider text-white pl-9 pr-3 py-2 rounded-xs focus:outline-none min-w-0"
          />
        </div>
      </div>

      {/* Orders Table */}
      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">ORDER NUMBER</th>
                <th className="py-3 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3 px-4 font-semibold">ITEMS</th>
                <th className="py-3 px-4 font-semibold">TOTAL AMOUNT</th>
                <th className="py-3 px-4 font-semibold">PAYMENT</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold">DATE</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#71717A]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#71717A]">
                    No orders matching filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#181821]/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-[#D4AF37] text-sm">
                      {o.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{o.customer_name}</div>
                      <div className="text-[11px] text-[#71717A]">{o.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#A1A1AA]">
                      {o.items?.length || 1} Custom Blade(s)
                    </td>
                    <td className="py-3.5 px-4 font-black text-white text-sm">
                      ₹{o.grand_total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-white font-bold">{o.payment_method}</span>
                      <span className="text-[10px] block text-[#71717A]">({o.payment_status})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          o.order_status === 'delivered'
                            ? 'success'
                            : o.order_status === 'cancelled'
                            ? 'red'
                            : 'gold'
                        }
                      >
                        {o.order_status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[#71717A]">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/admin/orders/${o.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          MANAGE
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View (Zero Horizontal Scrolling) */}
      <div className="md:hidden space-y-3 font-sport text-xs">
        {loading ? (
          <div className="py-8 text-center text-[#71717A]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No orders matching filter.</div>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-black text-[#D4AF37] text-sm">{o.order_number}</div>
                  <div className="text-[10px] text-[#71717A]">
                    {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge
                  variant={
                    o.order_status === 'delivered'
                      ? 'success'
                      : o.order_status === 'cancelled'
                      ? 'red'
                      : 'gold'
                  }
                >
                  {o.order_status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-white text-sm">{o.customer_name}</div>
                <div className="text-[11px] text-[#71717A]">{o.customer_phone}</div>
                <div className="text-[11px] text-[#A1A1AA]">{o.items?.length || 1} Custom Blade(s)</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#24242D]/60">
                <div>
                  <div className="font-black text-white text-base">
                    ₹{o.grand_total.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#71717A] uppercase">
                    {o.payment_method} • {o.payment_status}
                  </div>
                </div>

                <Link to={`/admin/orders/${o.id}`}>
                  <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} className="text-xs py-1.5 px-3">
                    MANAGE
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
