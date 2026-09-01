import React from 'react';
import { MapPin, CreditCard, Banknote, Edit3, ShieldCheck, Lock, Truck, ArrowLeft, Loader2, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CartItem, Coupon } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/image';
import { AddressFormData } from './DeliveryAddressStep';

interface ReviewOrderStepProps {
  formData: AddressFormData;
  paymentMethod: 'razorpay' | 'cod';
  items: CartItem[];
  subtotal: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  shippingFee: number;
  isSubmitting: boolean;
  onEditAddress: () => void;
  onChangePayment: () => void;
  onBack: () => void;
  onConfirmOrder: () => void;
}

export const ReviewOrderStep: React.FC<ReviewOrderStepProps> = ({
  formData,
  paymentMethod,
  items,
  subtotal,
  grandTotal,
  appliedCoupon,
  couponDiscount,
  shippingFee,
  isSubmitting,
  onEditAddress,
  onChangePayment,
  onBack,
  onConfirmOrder,
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* 1. Address & Payment Review Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Delivery Address Card */}
        <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-4 sm:p-5 space-y-3 relative shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E28] pb-2.5">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-sport font-black tracking-wider uppercase text-white">
                Delivery Address
              </span>
            </div>
            <button
              type="button"
              onClick={onEditAddress}
              disabled={isSubmitting}
              className="text-xs font-sport font-bold text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT</span>
            </button>
          </div>

          <div className="space-y-1 text-xs text-[#A1A1AA]">
            <p className="font-bold text-white text-sm">
              {formData.firstName} {formData.lastName}
            </p>
            <p className="leading-relaxed">
              {formData.address1}, {formData.city}, {formData.stateName} - {formData.pincode}
            </p>
            <p className="text-[#71717A] pt-1">
              Ph: +91 {formData.phone} • {formData.email}
            </p>
            {formData.customerNotes && (
              <p className="text-[11px] text-[#D4AF37]/90 pt-1 italic">
                Note: "{formData.customerNotes}"
              </p>
            )}
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-4 sm:p-5 space-y-3 relative shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E28] pb-2.5">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              {paymentMethod === 'razorpay' ? (
                <CreditCard className="w-4 h-4" />
              ) : (
                <Banknote className="w-4 h-4" />
              )}
              <span className="text-xs font-sport font-black tracking-wider uppercase text-white">
                Payment Method
              </span>
            </div>
            <button
              type="button"
              onClick={onChangePayment}
              disabled={isSubmitting}
              className="text-xs font-sport font-bold text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>CHANGE</span>
            </button>
          </div>

          <div className="space-y-1 text-xs text-[#A1A1AA]">
            <p className="font-bold text-white text-sm flex items-center gap-2">
              {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)'}
            </p>
            <p className="leading-relaxed">
              {paymentMethod === 'razorpay'
                ? 'UPI (GPay/PhonePe/Paytm), Cards, Net Banking & Wallets'
                : 'Pay in cash to the courier partner upon parcel delivery'}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#10B981] font-semibold">
              <Lock className="w-3 h-3" />
              <span>Verified & Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Order Items Breakdown Card */}
      <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1E1E28] pb-3">
          <h3 className="text-sm font-sport font-black text-white uppercase tracking-wider">
            Items in Order ({items.length})
          </h3>
          <span className="text-xs font-sport font-bold text-[#D4AF37]">
            ₹{grandTotal.toLocaleString('en-IN')} Total
          </span>
        </div>

        <div className="space-y-3.5 divide-y divide-[#1E1E28]">
          {items.map((item) => (
            <div key={item.id} className="pt-3.5 first:pt-0 flex gap-3.5 items-start">
              {/* Thumbnail */}
              <div className="w-14 h-18 sm:w-16 sm:h-20 bg-[#09090B] border border-[#1E1E28] rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={getImageUrl(item.product.images?.[0]?.image_url, '/VKCAT.png')}
                  alt={item.product.name}
                  onError={handleImageError}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Specs & Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-white truncate">
                    {item.product.name}
                  </h4>
                  <span className="font-sport font-black text-sm text-[#D4AF37] shrink-0">
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-xs text-[#A1A1AA]">
                  Qty: <span className="font-bold text-white">{item.quantity}</span> × ₹
                  {item.unit_price.toLocaleString('en-IN')}
                </div>

                {/* Customization Specs Badges */}
                {item.customization && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.customization.weight && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#181821] border border-[#24242D] text-[#D4AF37] rounded-xs font-sport font-semibold">
                        ⚖️ {item.customization.weight}
                      </span>
                    )}
                    {item.customization.handle_shape && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#181821] border border-[#24242D] text-[#E4E4E7] rounded-xs font-sport font-semibold">
                        🏏 {item.customization.handle_shape} ({item.customization.handle_size || 'SH'})
                      </span>
                    )}
                    {item.customization.grip_color && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#181821] border border-[#24242D] text-[#A1A1AA] rounded-xs font-sport">
                        Grip: {item.customization.grip_color}
                      </span>
                    )}
                    {item.customization.sticker_finish && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#181821] border border-[#24242D] text-[#A1A1AA] rounded-xs font-sport">
                        Sticker: {item.customization.sticker_finish}
                      </span>
                    )}
                    {item.customization.custom_engraving && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#181821] border border-[#D4AF37]/30 text-[#D4AF37] rounded-xs font-sport font-bold">
                        ✍️ "{item.customization.custom_engraving}"
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Security Trust Seals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#121216] border border-[#1E1E28] p-3 rounded-lg flex items-center gap-2.5">
          <Award className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-white font-sport uppercase">100% Genuine Willow</div>
            <div className="text-[10px] text-[#71717A]">Handcrafted in India</div>
          </div>
        </div>
        <div className="bg-[#121216] border border-[#1E1E28] p-3 rounded-lg flex items-center gap-2.5">
          <Truck className="w-5 h-5 text-[#10B981] shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-white font-sport uppercase">Insured Express Delivery</div>
            <div className="text-[10px] text-[#71717A]">Real-time Tracking</div>
          </div>
        </div>
        <div className="bg-[#121216] border border-[#1E1E28] p-3 rounded-lg flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-[#3B82F6] shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-white font-sport uppercase">Bank-Grade Security</div>
            <div className="text-[10px] text-[#71717A]">256-Bit SSL Protected</div>
          </div>
        </div>
      </div>

      {/* 4. Action & Final Payment Trigger Button */}
      <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-[#A1A1AA] uppercase font-sport tracking-wider">
              Total Payable Amount
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37] font-sport">
              ₹{grandTotal.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right text-xs text-[#10B981] font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero Hidden Charges</span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO PAYMENT</span>
          </Button>

          <Button
            type="button"
            variant="gold"
            size="xl"
            disabled={isSubmitting}
            onClick={onConfirmOrder}
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-black shadow-[0_0_30px_rgba(212,175,55,0.4)] tracking-wider"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>PROCESSING ORDER...</span>
              </>
            ) : paymentMethod === 'razorpay' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>PAY ₹{grandTotal.toLocaleString('en-IN')} SECURELY</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>PLACE COD ORDER (₹{grandTotal.toLocaleString('en-IN')})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
