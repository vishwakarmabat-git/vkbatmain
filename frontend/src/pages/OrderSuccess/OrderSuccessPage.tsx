import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Copy,
  Check,
  Package,
  Truck,
  ArrowRight,
  Printer,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimatedSuccessCheckmark } from '@/components/ui/AnimatedSuccessCheckmark';
import { toast } from 'sonner';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on arrival
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#10B981', '#FFFFFF', '#F59E0B'],
      });
    } catch (e) {
      // silent
    }

    if (orderNumber) {
      orderService
        .trackOrder(orderNumber)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  const handleCopyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success('Order reference number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppChat = () => {
    const text = `Hi VK Bat House, I have placed Order #${orderNumber}. Please send workshop and dispatch updates.`;
    window.open(`https://wa.me/919274543199?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-left space-y-8">
      {/* 1. TOP CELEBRATION BANNER WITH ANIMATED GREEN CHECKMARK */}
      <div className="bg-[#121216] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.12)] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* The Animated Green Tick in the center */}
        <div className="pt-2">
          <AnimatedSuccessCheckmark size="lg" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sport font-black text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            ORDER PLACED SUCCESSFULLY
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#F4F4F5] uppercase tracking-wide">
            YOUR BESPOKE WEAPON IS IN PRODUCTION
          </h1>

          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-lg mx-auto leading-relaxed">
            Thank you for trusting <strong className="text-white">Vishwakarma Bat House</strong>. Our master craftsmen have received your bespoke willow specifications and will handcraft your blade in our Chaklasi workshop.
          </p>
        </div>

        {/* Order Reference Badge with Copy Button */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-[#181821] border border-[#2A2A36] px-5 py-2.5 rounded-xl font-sport tracking-wider text-sm mt-1 shadow-inner">
          <span className="text-[#71717A] text-xs font-bold uppercase">ORDER REFERENCE:</span>
          <span className="text-[#D4AF37] font-black text-base sm:text-lg">#{orderNumber}</span>
          <button
            onClick={handleCopyOrderNumber}
            className="flex items-center gap-1 text-[11px] font-bold text-[#A1A1AA] hover:text-white bg-[#121216] border border-[#3A3A4A] px-2.5 py-1 rounded-md transition-colors cursor-pointer ml-1"
            title="Copy Order Number"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#D4AF37]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 2. ORDER PROGRESS TIMELINE */}
      <div className="bg-[#121216] border border-[#24242D] rounded-xl p-5 sm:p-7 space-y-4 shadow-xl">
        <h3 className="font-sport font-black text-xs sm:text-sm text-[#A1A1AA] uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          ESTIMATED WORKFLOW & DISPATCH
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sport text-left">
          {/* Step 1 */}
          <div className="bg-[#181821] border border-emerald-500/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              1. ORDER RECEIVED
            </div>
            <p className="text-[10px] text-[#A1A1AA] leading-tight">Confirmed & logged in workshop queue</p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#181821] border border-[#2A2A36] rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-white text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              2. CLEFT GRADING
            </div>
            <p className="text-[10px] text-[#A1A1AA] leading-tight">Grain & density inspection</p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#181821] border border-[#2A2A36] rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[#71717A] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#3A3A4A]" />
              3. HAND SHAPING
            </div>
            <p className="text-[10px] text-[#71717A] leading-tight">Artisan pressing & binding</p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#181821] border border-[#2A2A36] rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[#71717A] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#3A3A4A]" />
              4. INSURED DISPATCH
            </div>
            <p className="text-[10px] text-[#71717A] leading-tight">Doorstep tracking via BlueDart</p>
          </div>
        </div>
      </div>

      {/* 3. ORDER SUMMARY & DETAILS */}
      {order ? (
        <div className="bg-[#121216] border border-[#24242D] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#24242D]">
            <div>
              <h3 className="font-sport font-black text-lg sm:text-xl text-[#F4F4F5] uppercase tracking-wider">
                ORDER & DISPATCH SUMMARY
              </h3>
              <span className="text-xs text-[#71717A] font-sport">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-2 font-sport">
              <Badge variant="gold">
                STATUS: {order.order_status.toUpperCase()}
              </Badge>
              <span className="text-xs px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                {order.payment_method === 'razorpay' ? 'PAID ONLINE' : 'CASH ON DELIVERY'}
              </span>
            </div>
          </div>

          {/* Recipient & Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sport tracking-wider text-[#A1A1AA]">
            <div className="bg-[#181821] border border-[#24242D] rounded-lg p-4 space-y-1">
              <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-widest block">RECIPIENT & CONTACT</span>
              <div className="text-white font-black text-sm">{order.customer_name}</div>
              <div className="text-[#D4AF37]">{order.customer_phone}</div>
              <div className="text-[#A1A1AA]">{order.customer_email}</div>
            </div>

            <div className="bg-[#181821] border border-[#24242D] rounded-lg p-4 space-y-1">
              <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-widest block">SHIPPING ADDRESS</span>
              <div className="text-white font-bold text-sm">
                {order.shipping_address.address_line1}
              </div>
              <div>
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </div>
              <div className="text-emerald-400 font-bold text-[11px] pt-0.5">
                ✓ Free Express Insured Courier
              </div>
            </div>
          </div>

          {/* Ordered Blades */}
          <div className="border-t border-[#24242D] pt-4 space-y-3">
            <span className="text-xs font-sport font-black text-[#D4AF37] uppercase tracking-widest block">
              CUSTOM CRICKET BATS IN THIS ORDER:
            </span>

            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-[#181821] rounded-lg border border-[#24242D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sport"
              >
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm sm:text-base">{item.product_name}</div>
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-[#A1A1AA]">
                    {item.customization ? (
                      <>
                        <span className="bg-[#121216] px-2 py-0.5 rounded-xs border border-[#2A2A36]">
                          ⚖️ {item.customization.weight}
                        </span>
                        <span className="bg-[#121216] px-2 py-0.5 rounded-xs border border-[#2A2A36]">
                          🪵 {item.customization.handle_shape} ({item.customization.handle_size})
                        </span>
                        {item.customization.pre_knocking !== 'Raw' && (
                          <span className="bg-[#121216] px-2 py-0.5 rounded-xs border border-[#2A2A36] text-emerald-400">
                            🔨 {item.customization.pre_knocking}
                          </span>
                        )}
                        {item.customization.custom_engraving && (
                          <span className="bg-[#121216] px-2 py-0.5 rounded-xs border border-[#2A2A36] text-[#D4AF37]">
                            ✨ "{item.customization.custom_engraving}"
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[#71717A]">Standard Tournament Specs</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#24242D]">
                  <div className="text-[#A1A1AA] text-xs">Qty: <strong className="text-white">{item.quantity}</strong></div>
                  <div className="text-[#D4AF37] font-black text-sm sm:text-base">
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="border-t border-[#24242D] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-sport">
            <div className="text-xs text-[#71717A] text-left">
              {order.payment_method === 'razorpay'
                ? 'Verified & Paid online with Razorpay Gateway'
                : 'Cash payment to be made upon delivery at your doorstep'}
            </div>

            <div className="flex items-center gap-3 text-right">
              <span className="text-sm font-bold text-[#A1A1AA] uppercase">TOTAL AMOUNT:</span>
              <span className="text-2xl sm:text-3xl font-black text-[#D4AF37]">
                ₹{order.grand_total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="py-16 text-center space-y-3 font-sport">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A1A1AA]">Retrieving order specs...</p>
        </div>
      ) : null}

      {/* 4. ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link to="/products">
          <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            CONTINUE SHOPPING
          </Button>
        </Link>

        <Button
          variant="whatsapp"
          size="md"
          onClick={handleWhatsAppChat}
          leftIcon={<MessageCircle className="w-4 h-4" />}
        >
          WHATSAPP DISPATCH INQUIRY
        </Button>

        <Link to="/orders">
          <Button variant="outline" size="md">
            VIEW ALL MY ORDERS
          </Button>
        </Link>

        <button onClick={() => window.print()} className="cursor-pointer">
          <Button variant="secondary" size="md" leftIcon={<Printer className="w-4 h-4" />}>
            PRINT INVOICE
          </Button>
        </button>
      </div>
    </div>
  );
};
