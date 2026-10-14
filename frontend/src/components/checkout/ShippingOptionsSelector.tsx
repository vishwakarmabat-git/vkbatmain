import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, AlertCircle, Clock, ShieldCheck, Box, RefreshCw } from 'lucide-react';
import { shippingService } from '@/services/shippingService';
import { useCartStore } from '@/store/cartStore';
import { CourierQuote, ServiceabilityResult } from '@/types';
import { toast } from 'sonner';

interface ShippingOptionsSelectorProps {
  destinationPincode: string;
  paymentMode: 'PREPAID' | 'COD';
  onServiceabilityChange?: (isServiceable: boolean) => void;
}

export const ShippingOptionsSelector: React.FC<ShippingOptionsSelectorProps> = ({
  destinationPincode,
  paymentMode,
  onServiceabilityChange,
}) => {
  const { items, selectedShippingQuote, setSelectedShippingQuote } = useCartStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<CourierQuote[]>([]);
  const [serviceability, setServiceability] = useState<ServiceabilityResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const cleanPin = destinationPincode.trim();
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setQuotes([]);
      setServiceability(null);
      setErrorMsg(null);
      setSelectedShippingQuote(null);
      onServiceabilityChange?.(false);
      return;
    }

    let isMounted = true;

    const fetchRates = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        // 1. Check Serviceability
        const sRes = await shippingService.checkServiceability(cleanPin, undefined, paymentMode);
        if (!isMounted) return;
        setServiceability(sRes);

        if (!sRes.serviceable) {
          setErrorMsg(sRes.message || 'Delivery is currently not serviceable to this pincode.');
          setQuotes([]);
          setSelectedShippingQuote(null);
          onServiceabilityChange?.(false);
          return;
        }

        onServiceabilityChange?.(true);

        // 2. Fetch authoritative Courier Quotes
        const rRes = await shippingService.calculateRates({
          destination_pincode: cleanPin,
          payment_mode: paymentMode,
          items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        });

        if (!isMounted) return;

        if (rRes.couriers && rRes.couriers.length > 0) {
          setQuotes(rRes.couriers);
          // If no quote selected yet, select the recommended or first quote
          if (!selectedShippingQuote || !rRes.couriers.some((c) => c.courier_code === selectedShippingQuote.courier_code)) {
            const recommended = rRes.couriers.find((c) => c.recommended) || rRes.couriers[0];
            setSelectedShippingQuote(recommended);
          }
        } else {
          setQuotes([]);
          setErrorMsg('No active couriers available for this route.');
          setSelectedShippingQuote(null);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Shipping calculation error:', err);
        const detail = err?.response?.data?.detail || 'Unable to compute courier shipping rates.';
        setErrorMsg(detail);
        setQuotes([]);
        setSelectedShippingQuote(null);
        onServiceabilityChange?.(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchRates, 350);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [destinationPincode, paymentMode, items.length]);

  if (!destinationPincode || destinationPincode.trim().length < 6) {
    return (
      <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-4 text-xs text-[#71717A] flex items-center gap-2">
        <Truck className="w-4 h-4 text-[#D4AF37]" />
        <span>Enter a valid 6-digit PIN code above to view live courier options & delivery estimates.</span>
      </div>
    );
  }

  return (
    <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-4 sm:p-5 space-y-4 shadow-lg text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E1E28] pb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-sport font-black uppercase text-white tracking-wider">
            Courier Service & Delivery Option
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-1.5 text-xs text-[#D4AF37]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono text-[11px]">Calculating rates...</span>
          </div>
        ) : serviceability?.serviceable ? (
          <div className="flex items-center gap-1 text-xs text-[#10B981] font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Serviceable via Courier Uncle</span>
          </div>
        ) : null}
      </div>

      {/* Cricket Bat Packaging Note */}
      <div className="bg-[#09090C] border border-[#1E1E28] rounded-lg p-2.5 flex items-start gap-2.5 text-[11px] text-[#A1A1AA]">
        <Box className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-white">Reinforced Cricket Bat Packaging:</span> Heavy-duty 90cm master carton with dual-end bubble inserts and full in-transit damage insurance.
        </p>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && quotes.length === 0 && (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-[#181820] animate-pulse rounded-lg border border-[#242430]" />
          ))}
        </div>
      )}

      {/* Courier Options List */}
      {quotes.length > 0 && (
        <div className="space-y-2.5">
          {quotes.map((quote) => {
            const isSelected = selectedShippingQuote?.courier_code === quote.courier_code;
            const isCodDisabled = paymentMode === 'COD' && serviceability && !serviceability.cod_available;

            return (
              <div
                key={quote.courier_code}
                onClick={() => {
                  if (!isCodDisabled) {
                    setSelectedShippingQuote(quote);
                    toast.success(`Selected ${quote.courier_name} (${quote.service_label})`);
                  }
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#181822] border-[#D4AF37] shadow-md shadow-[#D4AF37]/5'
                    : 'bg-[#0E0E12] border-[#1E1E28] hover:border-[#323242]'
                } ${isCodDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* Radio Indicator */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#52525B]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>

                  {/* Courier Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {quote.courier_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#1E1E28] text-[#A1A1AA] uppercase font-mono">
                        {quote.service_label}
                      </span>
                      {quote.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#D4AF37]/20 text-[#D4AF37] font-bold uppercase tracking-wider">
                          Recommended
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#71717A]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#A1A1AA]" />
                        Est. {quote.estimated_days} {quote.estimated_days === 1 ? 'day' : 'days'}
                      </span>
                      <span>•</span>
                      <span>Standard Bat Dimensions</span>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#D4AF37] font-sport">
                    ₹{quote.total_with_gst.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#71717A]">
                    Incl. 18% GST (₹{quote.gst_amount})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COD Availability Warning */}
      {paymentMode === 'COD' && serviceability && !serviceability.cod_available && (
        <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Cash on Delivery is unavailable to PIN {destinationPincode}. Please choose Prepaid / Online payment.</span>
        </div>
      )}
    </div>
  );
};
