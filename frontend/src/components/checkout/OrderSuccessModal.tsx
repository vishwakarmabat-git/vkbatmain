import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ArrowRight, ShoppingBag, ShieldCheck, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedSuccessCheckmark } from '@/components/ui/AnimatedSuccessCheckmark';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderNumber: string;
  paymentMethod: 'razorpay' | 'cod';
  grandTotal: number;
  customerName: string;
  itemsCount: number;
  deliveryCity: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  orderNumber,
  paymentMethod,
  grandTotal,
  customerName,
  itemsCount,
  deliveryCity,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      // Launch celebratory confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#D4AF37', '#10B981', '#FFFFFF', '#F59E0B'],
        });
      } catch (e) {
        // silent
      }
    }
  }, [isOpen]);

  const handleCopyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success('Order number copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToOrderDetails = () => {
    navigate(`/order-success/${orderNumber}`);
  };

  const handleWhatsAppInquiry = () => {
    const text = `Hello VK Bat House, I have placed order #${orderNumber} for ₹${grandTotal.toLocaleString('en-IN')}. Please confirm workshop dispatch details.`;
    window.open(`https://wa.me/919274543199?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[min(calc(100vw-1.5rem),32rem)] bg-[#111116] border border-[#D4AF37]/40 rounded-2xl p-5 sm:p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] space-y-5 my-auto z-10 max-h-[90dvh] overflow-y-auto overscroll-contain"
          >
            {/* Top Glowing Ambient Light */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* 1. GREEN TICK ANIMATION */}
            <div className="pt-2">
              <AnimatedSuccessCheckmark size="md" />
            </div>

            {/* 2. HEADER & SUCCESS MESSAGE */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sport font-black text-[11px] uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                {paymentMethod === 'razorpay' ? 'Payment Verified & Confirmed' : 'Cash on Delivery (COD) Confirmed'}
              </div>

              <h2 className="font-serif font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
                Order Placed Successfully!
              </h2>

              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
                Thank you <strong className="text-white">{customerName || 'Champion'}</strong>! Your handcrafted bat order has been recorded and scheduled for mastercraft workshop shaping.
              </p>
            </div>

            {/* 3. ORDER NUMBER BADGE */}
            <div className="bg-[#181821] border border-[#2A2A36] rounded-xl p-3 flex items-center justify-between font-sport">
              <div className="text-left">
                <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider block">
                  ORDER REFERENCE NUMBER
                </span>
                <span className="text-base sm:text-lg font-black text-[#D4AF37] tracking-wider block">
                  #{orderNumber}
                </span>
              </div>

              <button
                onClick={handleCopyOrderNumber}
                className="flex items-center gap-1.5 bg-[#121216] hover:bg-[#20202B] text-xs font-bold text-[#F4F4F5] border border-[#3A3A4A] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Copy Order Reference"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* 4. SUMMARY CHIPS */}
            <div className="grid grid-cols-3 gap-2 text-left font-sport">
              <div className="bg-[#16161E] border border-[#24242D] rounded-lg p-2.5">
                <span className="text-[10px] text-[#71717A] uppercase font-bold block">ITEMS</span>
                <span className="text-xs font-black text-white block mt-0.5">
                  {itemsCount} {itemsCount === 1 ? 'Bat' : 'Bats'}
                </span>
              </div>

              <div className="bg-[#16161E] border border-[#24242D] rounded-lg p-2.5">
                <span className="text-[10px] text-[#71717A] uppercase font-bold block">TOTAL</span>
                <span className="text-xs font-black text-[#D4AF37] block mt-0.5">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-[#16161E] border border-[#24242D] rounded-lg p-2.5">
                <span className="text-[10px] text-[#71717A] uppercase font-bold block">DELIVERY</span>
                <span className="text-xs font-black text-emerald-400 block mt-0.5 truncate">
                  {deliveryCity || 'Free Express'}
                </span>
              </div>
            </div>

            {/* 5. ACTION BUTTONS */}
            <div className="space-y-2 pt-2">
              <Button
                variant="gold"
                size="lg"
                className="w-full justify-between font-sport font-black tracking-wider"
                onClick={handleGoToOrderDetails}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                <span>VIEW ORDER & INVOICE DETAILS</span>
                <span>#{orderNumber}</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="whatsapp"
                  size="sm"
                  className="w-full text-xs font-sport"
                  onClick={handleWhatsAppInquiry}
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  WHATSAPP UPDATES
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-sport"
                  onClick={() => navigate('/products')}
                  leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                >
                  SHOP MORE BATS
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
