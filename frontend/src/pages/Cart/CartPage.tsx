import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { couponService, orderService } from '@/services/orderService';
import { toast } from 'sonner';
import { getImageUrl, handleImageError } from '@/utils/image';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    removeItem,
    updateQuantity,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getGSTAmount,
    getShippingFee,
    getGrandTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isWhatsAppOrdering, setIsWhatsAppOrdering] = useState(false);

  const subtotal = getSubtotal();
  const gstAmount = getGSTAmount();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to proceed to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidating(true);
    try {
      const res = await couponService.validateCoupon(couponInput.trim(), subtotal);
      if (res.is_valid && res.coupon) {
        applyCoupon(res.coupon, res.discount_amount);
        toast.success(res.message);
        setCouponInput('');
      } else {
        toast.error(res.message);
      }
    } catch (e: any) {
      toast.error('Error applying coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    if (items.length === 0) return;
    setIsWhatsAppOrdering(true);
    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          customization: item.customization,
        })),
        customer_name: 'Customer',
        customer_phone: 'Direct Inquiry',
        city: 'India',
        notes: appliedCoupon ? `Applied Coupon: ${appliedCoupon.code}` : undefined,
      };
      const res = await orderService.generateWhatsAppOrder(payload);
      window.open(res.whatsapp_url, '_blank');
    } catch (e) {
      toast.error('Could not generate WhatsApp order link');
    } finally {
      setIsWhatsAppOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-[#181821] border border-[#24242D] rounded-full flex items-center justify-center mx-auto text-[#71717A]">
          <ShoppingBag className="w-10 h-10 text-[#52525B]" />
        </div>
        <h2 className="text-3xl font-serif font-black text-white uppercase">
          Your Cricket Bag is Empty
        </h2>
        <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
          Explore our mastercraft blades, customize your exact weight, handle and knocking options, and add to bag.
        </p>
        <Link to="/products">
          <Button variant="gold" size="lg">
            BROWSE CRICKET BATS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-10">
      <div className="border-b border-[#24242D] pb-4">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#F4F4F5] uppercase">
          SHOPPING BAG & CUSTOMIZATIONS ({items.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-[#121216] border border-[#24242D] rounded-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-24 h-32 bg-[#09090B] rounded-sm overflow-hidden shrink-0 border border-[#24242D]">
                  <img
                    src={getImageUrl(item.product.images?.[0]?.image_url, '/VKCAT.png')}
                    alt={item.product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#F4F4F5]">
                        {item.product.name}
                      </h3>
                      <span className="text-xs font-sport text-[#71717A] uppercase">
                        SKU: {item.product.sku}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#71717A] hover:text-red-400 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Customization Details Grid */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 bg-[#181821] p-3 rounded-xs text-[11px] font-sport text-[#A1A1AA]">
                    <div>
                      <span className="text-[#71717A] block">WEIGHT:</span>
                      <span className="text-[#D4AF37] font-bold">{item.customization.weight}</span>
                    </div>
                    <div>
                      <span className="text-[#71717A] block">HANDLE:</span>
                      <span className="text-white font-bold">{item.customization.handle_shape} ({item.customization.handle_size})</span>
                    </div>
                    <div>
                      <span className="text-[#71717A] block">GRIP:</span>
                      <span className="text-white font-bold">{item.customization.grip_color} ({item.customization.grip_count})</span>
                    </div>
                    <div>
                      <span className="text-[#71717A] block">STICKER:</span>
                      <span className="text-white font-bold">{item.customization.sticker_finish}</span>
                    </div>
                    <div>
                      <span className="text-[#71717A] block">PRE-KNOCKING:</span>
                      <span className="text-white font-bold">{item.customization.pre_knocking}</span>
                    </div>
                    {item.customization.custom_engraving && (
                      <div>
                        <span className="text-[#71717A] block">ENGRAVING:</span>
                        <span className="text-[#D4AF37] font-bold">"{item.customization.custom_engraving}"</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Quantity Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center bg-[#181821] border border-[#24242D] rounded-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-[#A1A1AA] hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-sport font-bold text-[#F4F4F5]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-[#A1A1AA] hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-sport text-[#71717A]">
                        ₹{item.unit_price.toLocaleString('en-IN')} × {item.quantity}
                      </div>
                      <div className="text-lg font-sport font-black text-[#D4AF37]">
                        ₹{item.total_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#121216] border border-[#24242D] rounded-md p-6 space-y-6">
          <h3 className="font-sport font-black text-xl text-[#F4F4F5] uppercase tracking-wider pb-3 border-b border-[#24242D]">
            ORDER SUMMARY
          </h3>

          {/* Coupon input */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER COUPON CODE"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className="flex-1 bg-[#181821] border border-[#24242D] focus:border-[#D4AF37] text-xs font-sport tracking-wider text-white px-3 py-2 rounded-xs focus:outline-none uppercase"
            />
            <Button type="submit" variant="outline" size="sm" isLoading={isValidating}>
              APPLY
            </Button>
          </form>

          {appliedCoupon && (
            <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xs text-emerald-300 font-sport">
              <span>✓ '{appliedCoupon.code}' Discount Active</span>
              <button onClick={removeCoupon} className="text-red-400 underline">
                Remove
              </button>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="space-y-2.5 text-xs font-sport tracking-wider border-t border-[#24242D] pt-4">
            <div className="flex justify-between text-[#A1A1AA]">
              <span>BAG SUBTOTAL</span>
              <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>COUPON DISCOUNT</span>
                <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-[#A1A1AA]">
              <span>SHIPPING</span>
              <span className="text-[#22C55E] font-bold">FREE</span>
            </div>

            <div className="flex justify-between text-lg font-black text-[#D4AF37] pt-3 border-t border-[#24242D]">
              <span>GRAND TOTAL</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2.5 pt-2">
            <Button
              variant="gold"
              size="lg"
              className="w-full justify-between"
              onClick={handleProceedToCheckout}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              <span>PROCEED TO CHECKOUT</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </Button>

            <Button
              variant="whatsapp"
              size="md"
              className="w-full"
              onClick={handleWhatsAppOrder}
              isLoading={isWhatsAppOrdering}
              leftIcon={<MessageCircle className="w-4 h-4" />}
            >
              ORDER VIA WHATSAPP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
