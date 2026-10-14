import React, { useEffect, useState } from 'react';
import { X, Truck, Package, Box, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { shippingService } from '@/services/shippingService';
import { Order, CourierQuote } from '@/types';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface ShipmentBookingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ShipmentBookingModal: React.FC<ShipmentBookingModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [lengthCm, setLengthCm] = useState<number>(90.0);
  const [widthCm, setWidthCm] = useState<number>(14.0);
  const [heightCm, setHeightCm] = useState<number>(10.0);

  const [isLoadingQuotes, setIsLoadingQuotes] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<CourierQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<CourierQuote | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize weights & dimensions based on order items
  useEffect(() => {
    if (order && isOpen) {
      const batCount = (order.items || []).reduce((sum, it) => sum + it.quantity, 0) || 1;
      setWeightKg(Number((batCount * 1.35).toFixed(2)));
      setLengthCm(90.0);
      setWidthCm(Number((14.0 * Math.min(batCount, 4)).toFixed(1)));
      setHeightCm(Number((10.0 * Math.ceil(batCount / 4)).toFixed(1)));
      fetchQuotes();
    }
  }, [order, isOpen]);

  const fetchQuotes = async () => {
    if (!order) return;
    setIsLoadingQuotes(true);
    setErrorMsg(null);
    try {
      const mode = order.payment_method === 'cod' ? 'COD' : 'PREPAID';
      const codAmt = order.payment_method === 'cod' ? Number(order.grand_total || 0) : 0;

      const res = await shippingService.calculateRates({
        destination_pincode: order.shipping_address?.pincode || '',
        payment_mode: mode,
        cod_amount: codAmt,
        items: (order.items || []).map((i) => ({ product_id: i.product_id || '', quantity: i.quantity })),
      });

      if (res.couriers && res.couriers.length > 0) {
        setQuotes(res.couriers);
        const match = res.couriers.find((c) => c.recommended) || res.couriers[0];
        setSelectedQuote(match);
      } else {
        setQuotes([]);
        setErrorMsg('No active couriers found for this route.');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to calculate courier quotes.');
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleBook = async () => {
    if (!order || !selectedQuote) {
      toast.error('Please select a courier to book shipment.');
      return;
    }

    setIsBooking(true);
    try {
      const mode = order.payment_method === 'cod' ? 'COD' : 'PREPAID';
      const codAmt = order.payment_method === 'cod' ? Number(order.grand_total) : 0;

      const shipment = await shippingService.bookShipment(order.id, {
        courier_code: selectedQuote.courier_code,
        courier_name: selectedQuote.courier_name,
        courier_service: selectedQuote.service,
        weight_kg: weightKg,
        length_cm: lengthCm,
        width_cm: widthCm,
        height_cm: heightCm,
        payment_mode: mode,
        cod_amount: codAmt,
      });

      toast.success(
        `Shipment booked successfully with ${shipment.courier_name}! AWB: ${shipment.courier_awb || shipment.tracking_id}`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Shipment booking failed.';
      toast.error(detail);
      setErrorMsg(detail);
    } finally {
      setIsBooking(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121216] border border-[#24242D] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left">
        {/* Header */}
        <div className="p-5 border-b border-[#24242D] flex items-center justify-between bg-[#181822]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sport font-black tracking-widest text-[#D4AF37] uppercase block">
                COURIER UNCLE DISPATCH CONSOLE
              </span>
              <h2 className="text-lg font-serif font-black text-white uppercase">
                BOOK SHIPMENT FOR ORDER #{order.order_number}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-white transition-colors rounded-lg hover:bg-[#242430] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Destination Details */}
          <div className="bg-[#09090C] border border-[#24242D] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[#71717A] uppercase text-[10px] block">DELIVERY DESTINATION</span>
              <div className="font-bold text-white text-sm mt-0.5">
                {order.customer_name}
              </div>
              <div className="text-[#A1A1AA] mt-0.5">
                {order.shipping_address.address_line1}, {order.shipping_address.city},{' '}
                {order.shipping_address.state} -{' '}
                <span className="font-bold text-[#D4AF37]">{order.shipping_address.pincode}</span>
              </div>
              <div className="text-[#71717A] mt-1">Phone: +91 {order.shipping_address.phone}</div>
            </div>

            <div className="sm:border-l sm:border-[#24242D] sm:pl-4 space-y-2">
              <div>
                <span className="text-[#71717A] uppercase text-[10px] block">ORDER VALUE & MODE</span>
                <div className="font-sport font-bold text-base text-[#D4AF37]">
                  ₹{Number(order.grand_total).toLocaleString('en-IN')}{' '}
                  <span className="text-xs uppercase text-white font-normal">
                    ({order.payment_method})
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-[#A1A1AA]">
                Items: {order.items.length} ({order.items.reduce((s, i) => s + i.quantity, 0)} bats)
              </div>
            </div>
          </div>

          {/* Parcel Specifications (Cricket Bat Dimensions) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider">
                <Box className="w-4 h-4 text-[#D4AF37]" />
                <span>Parcel Packaging Dimensions</span>
              </div>
              <span className="text-[11px] text-[#71717A]">
                Volumetric Formula: (L × W × H) / 5000
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-sport text-[#71717A] uppercase">
                  Dead Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white p-2 rounded-md outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sport text-[#71717A] uppercase">
                  Length (CM)
                </label>
                <input
                  type="number"
                  step="1"
                  min="10"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(parseFloat(e.target.value) || 90)}
                  className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white p-2 rounded-md outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sport text-[#71717A] uppercase">
                  Width (CM)
                </label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  value={widthCm}
                  onChange={(e) => setWidthCm(parseFloat(e.target.value) || 14)}
                  className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white p-2 rounded-md outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sport text-[#71717A] uppercase">
                  Height (CM)
                </label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 10)}
                  className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white p-2 rounded-md outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Courier Quotes Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider">
                Select Courier Service Provider
              </span>
              <button
                type="button"
                onClick={fetchQuotes}
                disabled={isLoadingQuotes}
                className="text-[11px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingQuotes ? 'animate-spin' : ''}`} />
                <span>Recalculate Rates</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isLoadingQuotes ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin mx-auto" />
                <span className="text-[#71717A]">Fetching live courier quotes...</span>
              </div>
            ) : quotes.length > 0 ? (
              <div className="space-y-2">
                {quotes.map((q) => {
                  const isSelected = selectedQuote?.courier_code === q.courier_code;
                  return (
                    <div
                      key={q.courier_code}
                      onClick={() => setSelectedQuote(q)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#181822] border-[#D4AF37] shadow-sm'
                          : 'bg-[#09090C] border-[#1E1E28] hover:border-[#323242]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#52525B]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{q.courier_name}</span>
                            <span className="text-[10px] px-1 py-0.5 rounded-xs bg-[#242430] text-[#A1A1AA] uppercase font-mono">
                              {q.service_label}
                            </span>
                            {q.recommended && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#D4AF37]/20 text-[#D4AF37] font-bold uppercase">
                                Best Value
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#71717A]">
                            Est. {q.estimated_days} days transit • Zone {q.zone}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-sport font-black text-sm text-[#D4AF37]">
                          ₹{q.total_with_gst.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#71717A]">
                          Base: ₹{q.freight} + GST: ₹{q.gst_amount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#24242D] bg-[#0E0E12] flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isBooking}>
            CANCEL
          </Button>

          <Button
            variant="gold"
            size="md"
            onClick={handleBook}
            disabled={!selectedQuote || isBooking}
            leftIcon={
              isBooking ? (
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Truck className="w-4 h-4 shrink-0" />
              )
            }
          >
            {isBooking ? 'BOOKING DISPATCH...' : `CONFIRM DISPATCH (₹${selectedQuote?.total_with_gst.toFixed(2) || '0'})`}
          </Button>
        </div>
      </div>
    </div>
  );
};
