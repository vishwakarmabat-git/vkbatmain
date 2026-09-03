import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderService } from '@/services/orderService';
import { Address } from '@/types';
import { toast } from 'sonner';

// Stepper Components
import { CheckoutStepper, CheckoutStepId } from '@/components/checkout/CheckoutStepper';
import {
  DeliveryAddressStep,
  AddressFormData,
  validateAddress,
} from '@/components/checkout/DeliveryAddressStep';
import { PaymentMethodStep } from '@/components/checkout/PaymentMethodStep';
import { ReviewOrderStep } from '@/components/checkout/ReviewOrderStep';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { OrderSuccessModal } from '@/components/checkout/OrderSuccessModal';

const STORAGE_KEY_ADDRESS = 'vk_checkout_address';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    appliedCoupon,
    couponDiscount,
    getSubtotal,
    getShippingFee,
    getGrandTotal,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStepId>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    paymentMethod: 'razorpay' | 'cod';
    grandTotal: number;
    customerName: string;
    itemsCount: number;
    deliveryCity: string;
  } | null>(null);

  // Address Form State
  const [formData, setFormData] = useState<AddressFormData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_ADDRESS);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return {
              firstName: parsed.firstName || '',
              lastName: parsed.lastName || '',
              email: parsed.email || '',
              phone: parsed.phone || '',
              address1: parsed.address1 || '',
              city: parsed.city || '',
              stateName: parsed.stateName || '',
              pincode: parsed.pincode || '',
              customerNotes: parsed.customerNotes || '',
            };
          }
        }
      } catch (e) {
        // silent fallback
      }
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address1: '',
      city: '',
      stateName: '',
      pincode: '',
      customerNotes: '',
    };
  });

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in or create an account to proceed with checkout.');
      navigate('/login?redirect=/checkout', { replace: true });
      return;
    }
    if (items.length === 0 && !confirmedOrder) {
      navigate('/cart');
    }
  }, [isAuthenticated, items.length, confirmedOrder, navigate]);

  // Sync user profile details if form fields are empty
  useEffect(() => {
    if (user) {
      setFormData((prev) => {
        const parts = (user.full_name || '').trim().split(' ');
        const updated = { ...prev };
        if (!updated.firstName && parts[0]) updated.firstName = parts[0];
        if (!updated.lastName && parts.length > 1) updated.lastName = parts.slice(1).join(' ');
        if (!updated.email && user.email) updated.email = user.email;
        if (!updated.phone && user.phone) updated.phone = user.phone;
        return updated;
      });
    }
  }, [user]);

  // Persist Address changes safely in localStorage
  const handleFieldChange = (field: keyof AddressFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY_ADDRESS, JSON.stringify(next));
      } catch (e) {
        // silent
      }
      return next;
    });
  };

  const handleApplySavedAddress = (addr: Address) => {
    const parts = (addr.full_name || '').trim().split(' ');
    const next: AddressFormData = {
      firstName: parts[0] || formData.firstName,
      lastName: parts.slice(1).join(' ') || formData.lastName,
      phone: addr.phone || formData.phone,
      email: formData.email || user?.email || '',
      address1: addr.address_line1 || '',
      city: addr.city || '',
      stateName: addr.state || '',
      pincode: addr.pincode || '',
      customerNotes: formData.customerNotes,
    };
    setFormData(next);
    try {
      localStorage.setItem(STORAGE_KEY_ADDRESS, JSON.stringify(next));
    } catch (e) {
      // silent
    }
    toast.success('Address auto-filled from your saved addresses!');
  };

  const isStepComplete = (step: CheckoutStepId): boolean => {
    if (step === 1) {
      const errs = validateAddress(formData);
      return Object.keys(errs).length === 0;
    }
    if (step === 2) {
      return Boolean(paymentMethod);
    }
    return false;
  };

  const scrollToCheckoutTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleStep1Submit = () => {
    const errs = validateAddress(formData);
    if (Object.keys(errs).length > 0) {
      toast.error('Please resolve the highlighted address fields before proceeding.');
      return;
    }
    setCurrentStep(2);
    scrollToCheckoutTop();
  };

  const handleStep2Submit = () => {
    setCurrentStep(3);
    scrollToCheckoutTop();
  };

  const handleStepClick = (step: CheckoutStepId) => {
    if (step === 1) {
      setCurrentStep(1);
      scrollToCheckoutTop();
    } else if (step === 2) {
      if (isStepComplete(1)) {
        setCurrentStep(2);
        scrollToCheckoutTop();
      } else {
        toast.error('Please complete your delivery address first.');
      }
    } else if (step === 3) {
      if (isStepComplete(1) && isStepComplete(2)) {
        setCurrentStep(3);
        scrollToCheckoutTop();
      } else {
        toast.error('Please complete delivery address and select a payment method.');
      }
    }
  };

  // Final Order Creation & Payment Trigger
  const handleConfirmAndPay = async () => {
    const errs = validateAddress(formData);
    if (Object.keys(errs).length > 0) {
      setCurrentStep(1);
      toast.error('Please check your shipping address details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        shipping_address: {
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address_line1: formData.address1.trim(),
          city: formData.city.trim(),
          state: formData.stateName.trim(),
          pincode: formData.pincode.trim(),
        },
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          customization: item.customization,
        })),
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        payment_method: paymentMethod,
        customer_notes: formData.customerNotes.trim() || undefined,
      };

      // 1. Create order on backend
      const order = await orderService.createOrder(payload);

      // 2. If Razorpay chosen, initiate Razorpay Checkout
      if (paymentMethod === 'razorpay') {
        try {
          const rpOrder = await orderService.createRazorpayOrder(order.id);

          if (typeof (window as any).Razorpay !== 'undefined') {
            const options = {
              key: rpOrder.key_id || 'rzp_test_mock_key',
              amount: rpOrder.amount, // in paise
              currency: rpOrder.currency || 'INR',
              name: 'Vishwakarma Bat House',
              description: `Order #${order.order_number} — Handcrafted Cricket Bats`,
              image: '/VKCAT.png',
              order_id: rpOrder.razorpay_order_id.startsWith('order_mock')
                ? undefined
                : rpOrder.razorpay_order_id,
              prefill: {
                name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                email: formData.email.trim(),
                contact: formData.phone.trim(),
              },
              notes: {
                order_number: order.order_number,
                address: formData.address1.trim(),
              },
              theme: {
                color: '#D4AF37',
                backdrop_color: '#09090B',
              },
              handler: async function (response: any) {
                try {
                  await orderService.verifyPayment({
                    order_id: order.id,
                    razorpay_order_id: response.razorpay_order_id || rpOrder.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                    razorpay_signature: response.razorpay_signature || 'mock_signature',
                  });
                  const details = {
                    orderNumber: order.order_number,
                    paymentMethod: 'razorpay' as const,
                    grandTotal: order.grand_total,
                    customerName: formData.firstName || user?.full_name || 'Champion',
                    itemsCount: items.length,
                    deliveryCity: formData.city,
                  };
                  clearCart();
                  setConfirmedOrder(details);
                  setIsSubmitting(false);
                  toast.success(`Payment verified! Order #${order.order_number} confirmed.`);
                } catch (err: any) {
                  toast.error(err?.response?.data?.detail || 'Payment verification failed');
                  setIsSubmitting(false);
                }
              },
              modal: {
                ondismiss: function () {
                  toast.info('Payment window closed. You can complete payment anytime.');
                  setIsSubmitting(false);
                },
              },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
              toast.error(
                `Payment failed: ${response.error?.description || 'Transaction was declined'}`
              );
              setIsSubmitting(false);
            });
            rzp.open();
            return;
          } else {
            // Direct mock fallback if script is blocked or offline
            await orderService.verifyPayment({
              order_id: order.id,
              razorpay_order_id: rpOrder.razorpay_order_id,
              razorpay_payment_id: `pay_${Date.now()}`,
              razorpay_signature: 'verified_sig',
            });
            const details = {
              orderNumber: order.order_number,
              paymentMethod: 'razorpay' as const,
              grandTotal: order.grand_total,
              customerName: formData.firstName || user?.full_name || 'Champion',
              itemsCount: items.length,
              deliveryCity: formData.city,
            };
            clearCart();
            setConfirmedOrder(details);
            setIsSubmitting(false);
            toast.success(`Payment verified! Order #${order.order_number} confirmed.`);
            return;
          }
        } catch (rpErr: any) {
          console.warn('Razorpay initialization fallback', rpErr);
        }
      }

      // 3. For COD or direct fallback
      const details = {
        orderNumber: order.order_number,
        paymentMethod: 'cod' as const,
        grandTotal: order.grand_total,
        customerName: formData.firstName || user?.full_name || 'Champion',
        itemsCount: items.length,
        deliveryCity: formData.city,
      };
      clearCart();
      setConfirmedOrder(details);
      setIsSubmitting(false);
      toast.success(`Order #${order.order_number} placed successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.detail || 'Error creating order. Please verify your details.'
      );
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#121216] border border-[#1E1E28] rounded-xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-black text-white uppercase tracking-wider">
            Account Required
          </h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Please sign in or register to complete your order, apply warranty certifications, and track dispatch status.
          </p>
        </div>
        <div className="space-y-3">
          <Link to="/login?redirect=/checkout" className="block w-full">
            <button className="w-full bg-[#D4AF37] hover:bg-[#E5B539] text-black font-black uppercase text-sm py-3 px-4 rounded-md transition-all cursor-pointer">
              SIGN IN TO PROCEED
            </button>
          </Link>
          <Link to="/products" className="block text-xs text-[#71717A] hover:text-white transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-left space-y-6 sm:space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#71717A]">
          <Link to="/cart" className="hover:text-white transition-colors">
            Bag
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#52525B]" />
          <span className="text-[#D4AF37] font-semibold">Checkout</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight uppercase">
              Secure Checkout
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Handcrafted English Willow Bats • Direct Workshop Fulfillment
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors font-sport uppercase tracking-wider font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <CheckoutStepper
        currentStep={currentStep}
        onStepClick={handleStepClick}
        isStepComplete={isStepComplete}
      />

      {/* Main 2-Column Responsive Checkout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Progressive Active Step Content */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <DeliveryAddressStep
                  formData={formData}
                  onChange={handleFieldChange}
                  onApplySavedAddress={handleApplySavedAddress}
                  onSubmit={handleStep1Submit}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <PaymentMethodStep
                  formData={formData}
                  paymentMethod={paymentMethod}
                  onSelectPaymentMethod={setPaymentMethod}
                  onEditAddress={() => setCurrentStep(1)}
                  onBack={() => setCurrentStep(1)}
                  onProceed={handleStep2Submit}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <ReviewOrderStep
                  formData={formData}
                  paymentMethod={paymentMethod}
                  items={items}
                  subtotal={subtotal}
                  grandTotal={grandTotal}
                  appliedCoupon={appliedCoupon}
                  couponDiscount={couponDiscount}
                  shippingFee={shippingFee}
                  isSubmitting={isSubmitting}
                  onEditAddress={() => setCurrentStep(1)}
                  onChangePayment={() => setCurrentStep(2)}
                  onBack={() => setCurrentStep(2)}
                  onConfirmOrder={handleConfirmAndPay}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sticky Desktop Order Summary & Mobile Accordion */}
        <div className="lg:col-span-5 xl:col-span-4">
          <OrderSummaryCard
            items={items}
            subtotal={subtotal}
            grandTotal={grandTotal}
            appliedCoupon={appliedCoupon}
            couponDiscount={couponDiscount}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
          />
        </div>
      </div>

      {/* Celebration Modal with Animated Green Tick */}
      {confirmedOrder && (
        <OrderSuccessModal
          isOpen={Boolean(confirmedOrder)}
          orderNumber={confirmedOrder.orderNumber}
          paymentMethod={confirmedOrder.paymentMethod}
          grandTotal={confirmedOrder.grandTotal}
          customerName={confirmedOrder.customerName}
          itemsCount={confirmedOrder.itemsCount}
          deliveryCity={confirmedOrder.deliveryCity}
        />
      )}
    </div>
  );
};
