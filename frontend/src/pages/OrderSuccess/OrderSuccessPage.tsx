import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, Phone } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire celebratory confetti on arrival
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#E31B23', '#FFFFFF'],
    });

    if (orderNumber) {
      orderService
        .trackOrder(orderNumber)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-left space-y-10">
      {/* Top Banner */}
      <div className="bg-[#121216] border border-[#D4AF37]/40 rounded-md p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
          CONGRATULATIONS & ORDER CONFIRMED
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#F4F4F5] uppercase">
          YOUR CRICKET WEAPON IS IN PRODUCTION
        </h1>

        <p className="text-xs text-[#A1A1AA] max-w-lg mx-auto leading-relaxed">
          Thank you for choosing Vishwakarma Bat House. Our master craftsmen have received your bespoke blade order and will initiate cleft grading and workshop preparation.
        </p>

        <div className="inline-flex items-center gap-3 bg-[#181821] border border-[#24242D] px-6 py-3 rounded-xs font-sport tracking-wider text-sm mt-2">
          <span className="text-[#71717A]">ORDER NUMBER:</span>
          <span className="text-[#D4AF37] font-black text-lg">{orderNumber}</span>
        </div>
      </div>

      {/* Order Summary Details */}
      {order && (
        <div className="bg-[#121216] border border-[#24242D] rounded-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#24242D]">
            <h3 className="font-sport font-black text-xl text-[#F4F4F5] uppercase tracking-wider">
              ORDER & DISPATCH SUMMARY
            </h3>
            <Badge variant="gold">
              STATUS: {order.order_status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sport tracking-wider text-[#A1A1AA]">
            <div>
              <span className="text-[#71717A] uppercase block">RECIPIENT & CONTACT</span>
              <div className="text-white font-bold mt-1">{order.customer_name}</div>
              <div>{order.customer_phone} | {order.customer_email}</div>
            </div>

            <div>
              <span className="text-[#71717A] uppercase block">DELIVERY ADDRESS</span>
              <div className="text-white font-bold mt-1">
                {order.shipping_address.address_line1}, {order.shipping_address.city} - {order.shipping_address.pincode}
              </div>
            </div>
          </div>

          {/* Ordered items */}
          <div className="border-t border-[#24242D] pt-4 space-y-3">
            <span className="text-xs font-sport font-bold text-[#D4AF37] uppercase tracking-widest block">
              CUSTOM BLADES IN THIS ORDER:
            </span>
            {order.items.map((item) => (
              <div key={item.id} className="p-3 bg-[#181821] rounded-xs border border-[#24242D] flex items-center justify-between text-xs font-sport">
                <div>
                  <div className="font-bold text-white text-sm">{item.product_name}</div>
                  <div className="text-[11px] text-[#A1A1AA]">
                    {item.customization ? `${item.customization.weight} | ${item.customization.handle_shape} handle | Knocking: ${item.customization.pre_knocking}` : 'Standard Specs'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">Qty: {item.quantity}</div>
                  <div className="text-[#D4AF37] font-black">₹{item.total_price.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#24242D] pt-4 flex items-center justify-between font-sport">
            <span className="text-sm font-bold text-[#A1A1AA] uppercase">TOTAL AMOUNT PAYABLE</span>
            <span className="text-2xl font-black text-[#D4AF37]">₹{order.grand_total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/products">
          <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            CONTINUE SHOPPING
          </Button>
        </Link>
        <Link to="/orders">
          <Button variant="outline" size="md">
            VIEW ALL MY ORDERS
          </Button>
        </Link>
        <button onClick={() => window.print()}>
          <Button variant="secondary" size="md" leftIcon={<Printer className="w-4 h-4" />}>
            PRINT INVOICE
          </Button>
        </button>
      </div>
    </div>
  );
};
