import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, ChevronRight, Tag, MessageCircle, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { couponService, orderService } from '@/services/orderService';
import { toast } from 'sonner';
import { getImageUrl, handleImageError } from '@/utils/image';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    removeItem,
    updateQuantity,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getGrandTotal,
  } = useCartStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isWhatsAppOrdering, setIsWhatsAppOrdering] = useState(false);

  const subtotal = getSubtotal();
  const grandTotal = getGrandTotal();
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const firstItemImage = items[0]?.product?.images?.[0]?.image_url || '/VKCAT.png';

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await couponService.validateCoupon(couponCodeInput.trim(), subtotal);
      if (res.is_valid && res.coupon) {
        applyCoupon(res.coupon, res.discount_amount);
        toast.success(res.message);
        setCouponCodeInput('');
      } else {
        toast.error(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error validating coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleWhatsAppCartOrder = async () => {
    if (items.length === 0) return;
    setIsWhatsAppOrdering(true);
    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          customization: item.customization,
        })),
        customer_name: 'Direct Customer',
        customer_phone: 'WhatsApp Inquiry',
        city: 'India',
        notes: appliedCoupon ? `Applied Coupon: ${appliedCoupon.code}` : undefined,
      };
      const res = await orderService.generateWhatsAppOrder(payload);
      window.open(res.whatsapp_url, '_blank');
    } catch (e) {
      toast.error('Could not generate WhatsApp order');
    } finally {
      setIsWhatsAppOrdering(false);
    }
  };

  const { isAuthenticated } = useAuthStore();

  const handleProceedToCheckout = () => {
    closeDrawer();
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to proceed to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      {/* 1. CRICKET WILLOW & LEATHER FLOATING BOTTOM CART BAR (MOBILE ONLY) */}
      <AnimatePresence>
        {items.length > 0 && !isDrawerOpen && location.pathname !== '/checkout' && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 sm:hidden"
          >
            <button
              onClick={openDrawer}
              className="relative overflow-hidden bg-gradient-to-r from-[#DDA843] via-[#FFE8A3] to-[#B8860B] text-black rounded-full pl-2 pr-4 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_25px_rgba(221,168,67,0.45)] border-2 border-[#FFE8A3] flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer whitespace-nowrap bat-swing-shine"
            >
              {/* Left: Circular Image Preview with Red Cricket Ball Ring */}
              <div className="relative w-8 h-8 rounded-full bg-black p-0.5 shrink-0 overflow-hidden shadow-sm ring-2 ring-[#C9182B]">
                <img
                  src={getImageUrl(firstItemImage, '/VKCAT.png')}
                  alt="Cart preview"
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                />
                {items.length > 1 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#8B1220] to-[#C9182B] text-white text-[8px] font-sport font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {items.length}
                  </span>
                )}
              </div>

              {/* Center: View Cart Text & Item Count */}
              <div className="text-left font-sport leading-tight">
                <div className="font-black text-xs tracking-wider uppercase text-black flex items-center gap-1">
                  <span>VIEW WEAPONS</span>
                </div>
                <div className="text-[10px] font-bold text-black/80">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} • ₹{grandTotal.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Right: Chevron Arrow */}
              <div className="pl-0.5 text-black">
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CART MODAL / DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden text-left">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            />

            {/* A) MOBILE VIEW: BLINKIT-STYLE BOTTOM SHEET (SLIDES UP FROM BOTTOM) */}
            <div className="sm:hidden fixed inset-x-0 bottom-0 z-50">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="w-full max-h-[88vh] bg-[#121216] border-t border-[#D4AF37]/50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
              >
                {/* Pull Handle */}
                <div className="pt-2.5 pb-1 flex justify-center cursor-pointer" onClick={closeDrawer}>
                  <div className="w-12 h-1.5 bg-[#3A3A4A] rounded-full" />
                </div>

                {/* Mobile Header */}
                <div className="px-4 py-3 border-b border-[#24242D] flex items-center justify-between bg-[#181821]/60">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="font-sport font-black text-sm text-[#F4F4F5] uppercase tracking-wider">
                      YOUR CRICKET BAG ({totalItemsCount})
                    </h3>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="w-7 h-7 rounded-full bg-[#181821] text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Items List */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                  {items.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#181821] border border-[#24242D] flex items-center justify-center mx-auto text-[#71717A]">
                        <ShoppingBag className="w-6 h-6 text-[#52525B]" />
                      </div>
                      <h4 className="font-sport font-bold text-sm text-[#F4F4F5] uppercase">
                        Your Bat Bag is Empty
                      </h4>
                      <Button variant="gold" size="sm" onClick={() => { closeDrawer(); navigate('/products'); }}>
                        EXPLORE CRICKET BATS
                      </Button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#181821] border border-[#24242D] rounded-xl space-y-2"
                      >
                        <div className="flex gap-2.5">
                          {/* Clickable Image Link */}
                          <Link
                            to={`/products/${item.product.slug}`}
                            onClick={closeDrawer}
                            className="w-14 h-18 bg-[#09090B] rounded-lg overflow-hidden shrink-0 border border-[#24242D] block group p-1"
                          >
                            <img
                              src={getImageUrl(item.product.images?.[0]?.image_url, '/VKCAT.png')}
                              alt={item.product.name}
                              onError={handleImageError}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              {/* Clickable Product Name */}
                              <Link
                                to={`/products/${item.product.slug}`}
                                onClick={closeDrawer}
                                className="font-serif font-black text-xs text-[#F4F4F5] hover:text-[#D4AF37] transition-colors truncate block"
                              >
                                {item.product.name}
                              </Link>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[#52525B] hover:text-red-400 transition-colors p-1 shrink-0"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-xs font-sport font-black text-[#D4AF37] mt-0.5">
                              ₹{item.unit_price.toLocaleString('en-IN')}
                            </div>

                            {/* Customization Chips */}
                            <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-sport text-[#A1A1AA]">
                              <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D]">
                                ⚖️ {item.customization.weight}
                              </span>
                              <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D]">
                                🪵 {item.customization.handle_shape} ({item.customization.handle_size})
                              </span>
                              {item.customization.pre_knocking !== 'Raw' && (
                                <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D] text-emerald-400">
                                  🔨 {item.customization.pre_knocking.split(' ')[0]} Knocks
                                </span>
                              )}
                              {item.customization.custom_engraving && (
                                <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D] text-[#D4AF37]">
                                  ✨ "{item.customization.custom_engraving}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stepper & Item Total */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-[#24242D]/60">
                          <div className="flex items-center bg-[#121216] border border-[#24242D] rounded-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-sport font-bold text-[#F4F4F5]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-xs font-sport font-black text-[#F4F4F5]">
                            ₹{item.total_price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Mobile Footer */}
                {items.length > 0 && (
                  <div className="p-3.5 border-t border-[#24242D] bg-[#181821]/90 space-y-2.5">
                    {/* Coupon */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3 h-3 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="COUPON CODE"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-[10px] font-sport tracking-wider text-[#F4F4F5] pl-7 pr-2 py-1.5 rounded-xs focus:outline-none placeholder:text-[#52525B]"
                        />
                      </div>
                      <Button type="submit" variant="outline" size="sm" isLoading={isValidatingCoupon}>
                        APPLY
                      </Button>
                    </form>

                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-[10px] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-xs text-emerald-300 font-sport">
                        <span>✓ Coupon '{appliedCoupon.code}' Applied</span>
                        <button onClick={removeCoupon} className="text-red-400 hover:text-red-300 underline">
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="space-y-1 text-[11px] font-sport tracking-wider border-t border-[#24242D] pt-1.5">
                      <div className="flex justify-between text-[#A1A1AA]">
                        <span>SUBTOTAL</span>
                        <span className="text-[#F4F4F5]">₹{subtotal.toLocaleString('en-IN')}</span>
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
                      <div className="flex justify-between text-xs font-black text-[#D4AF37] pt-1 border-t border-[#24242D]">
                        <span>TOTAL</span>
                        <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Mobile CTAs */}
                    <div className="space-y-1.5 pt-0.5">
                      <Button
                        variant="cricket-ball"
                        size="md"
                        className="w-full justify-between shadow-[0_0_20px_rgba(201,24,43,0.5)]"
                        onClick={handleProceedToCheckout}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        <span>PROCEED TO CHECKOUT</span>
                        <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                      </Button>

                      <Button
                        variant="whatsapp"
                        size="sm"
                        className="w-full"
                        onClick={handleWhatsAppCartOrder}
                        isLoading={isWhatsAppOrdering}
                        leftIcon={<MessageCircle className="w-4 h-4" />}
                      >
                        ORDER ALL VIA WHATSAPP
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* B) DESKTOP VIEW: SLEEK RIGHT-SIDE DRAWER */}
            <div className="hidden sm:flex fixed inset-y-0 right-0 max-w-full pl-0 sm:pl-4">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-[min(100vw,28rem)] bg-[#121216] border-l border-[#24242D] shadow-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* Desktop Drawer Header */}
                <div className="p-5 border-b border-[#24242D] flex items-center justify-between bg-[#181821]/50">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="font-sport font-black text-lg text-[#F4F4F5] uppercase tracking-wider">
                      YOUR CRICKET BAG ({totalItemsCount})
                    </h3>
                  </div>

                  <button
                    onClick={closeDrawer}
                    className="p-1.5 rounded-sm text-[#71717A] hover:text-white hover:bg-[#181821] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Desktop Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {items.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-[#181821] border border-[#24242D] flex items-center justify-center mx-auto text-[#71717A]">
                        <ShoppingBag className="w-8 h-8 text-[#52525B]" />
                      </div>
                      <div>
                        <h4 className="font-sport font-bold text-lg text-[#F4F4F5] uppercase">
                          Your Bat Bag is Empty
                        </h4>
                        <p className="text-xs text-[#71717A] mt-1">
                          Explore our handcrafted blade series and configure your weapon.
                        </p>
                      </div>
                      <Button variant="gold" size="md" onClick={() => { closeDrawer(); navigate('/products'); }}>
                        EXPLORE CRICKET BATS
                      </Button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-[#181821] border border-[#24242D] rounded-sm space-y-3 relative group"
                      >
                        <div className="flex gap-3">
                          {/* Clickable Image Link */}
                          <Link
                            to={`/products/${item.product.slug}`}
                            onClick={closeDrawer}
                            className="w-16 h-20 bg-[#09090B] rounded-xs overflow-hidden shrink-0 border border-[#24242D] block group p-1"
                          >
                            <img
                              src={getImageUrl(item.product.images?.[0]?.image_url, '/VKCAT.png')}
                              alt={item.product.name}
                              onError={handleImageError}
                              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform"
                            />
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              {/* Clickable Product Name Link */}
                              <Link
                                to={`/products/${item.product.slug}`}
                                onClick={closeDrawer}
                                className="font-serif font-bold text-sm text-[#F4F4F5] hover:text-[#D4AF37] transition-colors truncate block"
                              >
                                {item.product.name}
                              </Link>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[#52525B] hover:text-red-400 transition-colors p-1"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-xs font-sport font-black text-[#D4AF37] mt-0.5">
                              ₹{item.unit_price.toLocaleString('en-IN')} each
                            </div>

                            {/* Customization Badges */}
                            <div className="flex flex-wrap gap-1 mt-1.5 text-[10px] font-sport text-[#A1A1AA]">
                              <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D]">
                                ⚖️ {item.customization.weight}
                              </span>
                              <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D]">
                                🪵 {item.customization.handle_shape} ({item.customization.handle_size})
                              </span>
                              {item.customization.pre_knocking !== 'Raw' && (
                                <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D] text-emerald-400">
                                  🔨 {item.customization.pre_knocking.split(' ')[0]} Knocks
                                </span>
                              )}
                              {item.customization.custom_engraving && (
                                <span className="bg-[#121216] px-1.5 py-0.5 rounded-xs border border-[#24242D] text-[#D4AF37]">
                                  ✨ "{item.customization.custom_engraving}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity & Item Subtotal */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#24242D]/60">
                          <div className="flex items-center bg-[#121216] border border-[#24242D] rounded-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-sport font-bold text-[#F4F4F5]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-sm font-sport font-black text-[#F4F4F5]">
                            ₹{item.total_price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Drawer Footer */}
                {items.length > 0 && (
                  <div className="p-5 border-t border-[#24242D] bg-[#181821]/80 space-y-4">
                    {/* Coupon */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="COUPON (e.g. VKCHAMP10)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-xs font-sport tracking-wider text-[#F4F4F5] pl-8 pr-3 py-2 rounded-xs focus:outline-none placeholder:text-[#52525B]"
                        />
                      </div>
                      <Button type="submit" variant="outline" size="sm" isLoading={isValidatingCoupon}>
                        APPLY
                      </Button>
                    </form>

                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xs text-emerald-300 font-sport">
                        <span>✓ Coupon '{appliedCoupon.code}' Applied</span>
                        <button
                          onClick={removeCoupon}
                          className="text-red-400 hover:text-red-300 ml-2 underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Breakdown */}
                    <div className="space-y-1.5 text-xs font-sport tracking-wider border-t border-[#24242D] pt-3">
                      <div className="flex justify-between text-[#A1A1AA]">
                        <span>SUBTOTAL</span>
                        <span className="text-[#F4F4F5]">₹{subtotal.toLocaleString('en-IN')}</span>
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

                      <div className="flex justify-between text-base font-black text-[#D4AF37] pt-2 border-t border-[#24242D]">
                        <span>TOTAL</span>
                        <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="space-y-2 pt-2">
                      <Button
                        variant="cricket-ball"
                        size="lg"
                        className="w-full justify-between shadow-[0_0_25px_rgba(201,24,43,0.55)]"
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
                        onClick={handleWhatsAppCartOrder}
                        isLoading={isWhatsAppOrdering}
                        leftIcon={<MessageCircle className="w-4 h-4" />}
                      >
                        ORDER ALL VIA WHATSAPP
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
