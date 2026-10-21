import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Calendar, ShoppingBag, ArrowRight, FileText } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-left space-y-8">
      <div className="border-b border-[#24242D] pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            PURCHASE HISTORY
          </span>
          <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            MY CRICKET BAT ORDERS
          </h1>
        </div>

        <Link to="/products">
          <Button variant="gold" size="sm">
            EXPLORE BATS
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-[#121216] border border-[#24242D] rounded-md animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#121216] border border-[#24242D] rounded-md p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-[#52525B] mx-auto" />
          <h3 className="font-serif font-bold text-xl text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-[#A1A1AA]">
            When you purchase handcrafted bats, your order tracking will appear here.
          </p>
          <Link to="/products">
            <Button variant="gold" size="md">
              START CUSTOMIZING
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-6 space-y-4 shadow-xl"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#24242D]">
                <div>
                  <span className="text-xs font-sport text-[#71717A] uppercase block">ORDER NUMBER</span>
                  <span className="font-sport font-black text-lg text-[#D4AF37] tracking-wider">
                    {order.order_number}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={order.order_status === 'delivered' ? 'success' : 'gold'}>
                    STATUS: {order.order_status.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-sport text-[#71717A]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#181821] rounded-xs border border-[#24242D] flex items-center justify-between text-xs font-sport"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{item.product_name}</div>
                      <div className="text-[11px] text-[#A1A1AA]">
                        {item.customization ? `${item.customization.weight} | ${item.customization.handle_shape} handle | Knocking: ${item.customization.pre_knocking}` : 'Standard Specs'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#A1A1AA]">Qty: {item.quantity}</div>
                      <div className="text-[#D4AF37] font-black">
                        ₹{item.total_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-[#24242D] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-sport text-[#71717A]">
                  Payment: <span className="text-white uppercase font-bold">{order.payment_method}</span> ({order.payment_status})
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/order-success/${order.order_number}`}>
                    <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}>
                      INVOICE & STATUS
                    </Button>
                  </Link>

                  <div className="text-right">
                    <span className="text-xs font-sport text-[#A1A1AA] uppercase mr-2">Grand Total:</span>
                    <span className="text-xl font-sport font-black text-[#D4AF37]">
                      ₹{order.grand_total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
