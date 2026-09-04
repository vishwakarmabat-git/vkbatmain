import React from 'react';
import { CreditCard, Banknote, ShieldCheck, ArrowRight, ArrowLeft, Edit3, CheckCircle2, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddressFormData } from './DeliveryAddressStep';

interface PaymentMethodStepProps {
  formData: AddressFormData;
  paymentMethod: 'razorpay' | 'cod';
  onSelectPaymentMethod: (method: 'razorpay' | 'cod') => void;
  onEditAddress: () => void;
  onBack: () => void;
  onProceed: () => void;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  formData,
  paymentMethod,
  onSelectPaymentMethod,
  onEditAddress,
  onBack,
  onProceed,
}) => {
  return (
    <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-5 sm:p-8 space-y-6 shadow-xl text-left">
      {/* Step Header */}
      <div className="border-b border-[#1E1E28] pb-4 space-y-1">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <CreditCard className="w-5 h-5" />
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide uppercase">
            Choose Payment Method
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA]">
          Select your preferred secure payment method to complete the order.
        </p>
      </div>

      {/* Compact Address Summary Banner with [Edit Address] */}
      <div className="bg-[#09090C] border border-[#242436] rounded-lg p-4 flex items-start justify-between gap-3 shadow-inner">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sport font-black text-[#10B981] uppercase tracking-wider bg-[#10B981]/10 px-2 py-0.5 rounded-xs">
              ✓ DELIVERING TO
            </span>
            <span className="text-xs font-bold text-white truncate">
              {formData.firstName} {formData.lastName}
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed truncate">
            {formData.address1}, {formData.city}, {formData.stateName} - {formData.pincode}
          </p>
          <p className="text-[11px] text-[#71717A]">
            Ph: +91 {formData.phone} • {formData.email}
          </p>
        </div>

        <button
          type="button"
          onClick={onEditAddress}
          className="inline-flex items-center gap-1 text-xs font-sport font-bold text-[#D4AF37] hover:text-[#F3E5AB] transition-colors p-1.5 rounded-sm hover:bg-[#181821] shrink-0 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>EDIT</span>
        </button>
      </div>

      {/* Payment Options */}
      <div className="space-y-3.5">
        {/* Option 1: Online Payment via Razorpay */}
        <label
          onClick={() => onSelectPaymentMethod('razorpay')}
          className={`relative block p-4 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
            paymentMethod === 'razorpay'
              ? 'bg-gradient-to-r from-[#181824] to-[#12121A] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/40'
              : 'bg-[#09090C] border-[#1E1E28] hover:border-[#2D2D3E] hover:bg-[#101015]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {/* Custom Radio Circle */}
            <div className="pt-0.5 shrink-0">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#D4AF37] bg-[#D4AF37]'
                    : 'border-[#52525B] bg-transparent'
                }`}
              >
                {paymentMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-white">
                    Online Payment (Razorpay)
                  </span>
                  <span className="text-[10px] font-sport font-black uppercase px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full">
                    Recommended
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#10B981] font-semibold">
                  <Lock className="w-3 h-3" />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                UPI (Google Pay, PhonePe, Paytm), Credit / Debit Cards, Net Banking & Wallets
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {['UPI', 'Google Pay', 'PhonePe', 'Visa', 'Mastercard', 'RuPay', 'NetBanking'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="px-2 py-0.5 rounded-xs bg-[#1A1A24] border border-[#242436] text-[10px] text-[#A1A1AA] font-sport uppercase tracking-wider font-semibold"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] font-medium pt-0.5">
                <Zap className="w-3.5 h-3.5 fill-[#D4AF37]" />
                <span>Instant dispatch confirmation & zero payment gateway surcharge</span>
              </div>
            </div>
          </div>
        </label>

        {/* Option 2: Cash on Delivery */}
        <label
          onClick={() => onSelectPaymentMethod('cod')}
          className={`relative block p-4 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
            paymentMethod === 'cod'
              ? 'bg-gradient-to-r from-[#181824] to-[#12121A] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/40'
              : 'bg-[#09090C] border-[#1E1E28] hover:border-[#2D2D3E] hover:bg-[#101015]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {/* Custom Radio Circle */}
            <div className="pt-0.5 shrink-0">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#D4AF37] bg-[#D4AF37]'
                    : 'border-[#52525B] bg-transparent'
                }`}
              >
                {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-white">
                    Cash on Delivery (COD)
                  </span>
                  <Banknote className="w-4 h-4 text-[#A1A1AA]" />
                </div>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Pay in cash when your handcrafted bat is delivered safely to your doorstep.
              </p>

              <div className="text-[11px] text-[#71717A] pt-0.5">
                Please keep exact cash ready at the time of courier handover.
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-[#1E1E28] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 shrink-0" />}
          className="w-full sm:w-auto"
        >
          BACK TO ADDRESS
        </Button>

        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={onProceed}
          rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
          className="w-full sm:w-auto font-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          CONTINUE TO REVIEW
        </Button>
      </div>
    </div>
  );
};
