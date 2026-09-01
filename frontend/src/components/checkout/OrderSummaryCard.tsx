import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, Tag, ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { CartItem, Coupon } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/image';
import { couponService } from '@/services/orderService';
import { toast } from 'sonner';

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  onApplyCoupon: (coupon: Coupon, discount: number) => void;
  onRemoveCoupon: () => void;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  items,
  subtotal,
  grandTotal,
  appliedCoupon,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await couponService.validateCoupon(couponCodeInput.trim(), subtotal);
      if (res.is_valid && res.coupon) {
        onApplyCoupon(res.coupon, res.discount_amount);
        toast.success(`Coupon ${res.coupon.code} applied! Saved ₹${res.discount_amount}`);
        setCouponCodeInput('');
      } else {
        toast.error(res.message || 'Invalid or expired coupon code');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to apply coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Mobile Collapsible Header Bar */}
      <div className="lg:hidden bg-[#121216] border border-[#1E1E28] rounded-xl overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-[#181821] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-sport font-black uppercase text-white tracking-wider">
              ORDER SUMMARY ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#D4AF37] font-sport">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
            {mobileExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#71717A]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#71717A]" />
            )}
          </div>
        </button>

        {/* Mobile Expanded Drawer */}
        {mobileExpanded && (
          <div className="p-4 border-t border-[#1E1E28] bg-[#0E0E12] space-y-4">
            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-[#1E1E28]">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-12 bg-[#09090B] border border-[#1E1E28] rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={getImageUrl(item.product.images?.[0]?.image_url, '/VKCAT.png')}
                        alt={item.product.name}
                        onError={handleImageError}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.product.name}</div>
                      <div className="text-[10px] text-[#71717A]">
                        Qty: {item.quantity} × ₹{item.unit_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-sport font-black text-white shrink-0">
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-[#1E1E28] text-xs">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Items Subtotal</span>
                <span className="text-white font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Express Delivery</span>
                <span className="text-[#10B981] font-bold">FREE</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sticky Order Summary Card */}
      <div className="hidden lg:block bg-[#121216] border border-[#1E1E28] rounded-xl p-6 space-y-6 shadow-xl text-left sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E1E28] pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-sport font-black text-base text-white uppercase tracking-wider">
              Order Summary
            </h3>
          </div>
          <span className="text-xs font-sport px-2 py-0.5 rounded-full bg-[#1E1E28] text-[#A1A1AA]">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Products List Preview */}
        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 divide-y divide-[#1E1E28]">
          {items.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-14 bg-[#09090B] border border-[#1E1E28] rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={getImageUrl(item.product.images?.[0]?.image_url, '/VKCAT.png')}
                    alt={item.product.name}
                    onError={handleImageError}
                    className="w-full h-full object-contain p-1"
                  />
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {item.quantity}
                  </span>
                </div>

                <div className="min-w-0 space-y-0.5">
                  <h4 className="font-bold text-xs text-white truncate">{item.product.name}</h4>
                  <div className="text-[11px] text-[#71717A] truncate">
                    {item.customization?.weight || 'SH'} • {item.customization?.handle_shape || 'Round'}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-sport font-black text-xs text-white">
                ₹{item.total_price.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Code Box */}
        <div className="space-y-2 pt-2 border-t border-[#1E1E28]">
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/30">
              <div className="flex items-center gap-2 text-xs">
                <Tag className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="font-bold text-white uppercase">{appliedCoupon.code}</span>
                <span className="text-[#10B981] font-semibold">
                  (-₹{couponDiscount.toLocaleString('en-IN')})
                </span>
              </div>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-[#71717A] hover:text-red-400 p-1 cursor-pointer transition-colors"
                title="Remove coupon"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE (e.g. VKCHAMP10)"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-[#09090C] border border-[#1E1E28] focus:border-[#D4AF37] text-white px-3 py-2 text-xs rounded-md outline-none uppercase font-sport tracking-wider placeholder:text-[#52525B]"
              />
              <button
                type="submit"
                disabled={!couponCodeInput.trim() || isValidatingCoupon}
                className="px-3 py-2 bg-[#D4AF37] hover:bg-[#E5B539] text-black font-sport font-bold text-xs rounded-md uppercase tracking-wider transition-all disabled:opacity-40 shrink-0 cursor-pointer"
              >
                {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'APPLY'}
              </button>
            </form>
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-2.5 pt-4 border-t border-[#1E1E28] text-xs font-sans">
          <div className="flex justify-between text-[#A1A1AA]">
            <span>Items Subtotal</span>
            <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-[#A1A1AA]">
            <span>Insured Express Shipping</span>
            <span className="font-bold text-[#10B981]">FREE</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-[#10B981]">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span className="font-bold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-3 border-t border-[#1E1E28]">
            <div>
              <span className="font-sport font-black text-sm text-white uppercase tracking-wider block">
                Total Amount
              </span>
              <span className="text-[10px] text-[#71717A]">All-inclusive pricing • Zero hidden fees</span>
            </div>
            <span className="font-sport font-extrabold text-2xl text-[#D4AF37]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Guarantee Seal */}
        <div className="bg-[#09090C] border border-[#1E1E28] p-3 rounded-lg flex items-center gap-2.5 text-[11px] text-[#A1A1AA]">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>Hand-balanced & inspected by master batmakers before final dispatch.</span>
        </div>
      </div>
    </div>
  );
};
