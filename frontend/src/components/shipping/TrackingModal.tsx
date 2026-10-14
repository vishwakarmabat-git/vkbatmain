import React, { useEffect, useState } from 'react';
import { X, Truck, CheckCircle2, Clock, MapPin, ExternalLink, AlertCircle, RefreshCw, Box } from 'lucide-react';
import { shippingService } from '@/services/shippingService';
import { ShipmentTracking } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface TrackingModalProps {
  orderId?: string;
  trackingId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  orderId,
  trackingId,
  isOpen,
  onClose,
}) => {
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    if (!orderId && !trackingId) return;
    setLoading(true);
    setError(null);
    try {
      let data: ShipmentTracking;
      if (trackingId) {
        data = await shippingService.getPublicTracking(trackingId);
      } else if (orderId) {
        data = await shippingService.getOrderTracking(orderId);
      } else {
        return;
      }
      setTracking(data);
    } catch (err: any) {
      console.error('Failed to load tracking:', err);
      setError(
        err?.response?.data?.detail || 'Shipment tracking information is temporarily unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTracking();
    }
  }, [isOpen, orderId, trackingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121216] border border-[#24242D] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        {/* Header */}
        <div className="p-5 border-b border-[#24242D] flex items-center justify-between bg-[#181822]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sport font-black tracking-widest text-[#D4AF37] uppercase block">
                COURIER UNCLE LOGISTICS
              </span>
              <h2 className="text-lg font-serif font-black text-white uppercase">
                SHIPMENT TRACKING {tracking?.courier_awb ? `• ${tracking.courier_awb}` : ''}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTracking}
              disabled={loading}
              className="p-2 text-[#71717A] hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-[#242430] cursor-pointer"
              title="Refresh tracking status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#71717A] hover:text-white transition-colors rounded-lg hover:bg-[#242430] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
              <p className="text-xs font-sport tracking-wider text-[#A1A1AA] uppercase">
                Synchronizing with carrier network...
              </p>
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Tracking Unavailable</h4>
                <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchTracking}>
                RETRY LOOKUP
              </Button>
            </div>
          ) : tracking ? (
            <>
              {/* Parcel Summary Card */}
              <div className="bg-[#09090C] border border-[#24242D] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sport">
                <div>
                  <span className="text-[#71717A] uppercase block text-[10px]">CURRENT STATUS</span>
                  <span className="font-extrabold text-white text-sm block mt-0.5">
                    {tracking.status_label || tracking.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#71717A] uppercase block text-[10px]">CARRIER & SERVICE</span>
                  <span className="font-bold text-[#D4AF37] block mt-0.5">
                    {tracking.carrier} ({tracking.service})
                  </span>
                </div>
                <div>
                  <span className="text-[#71717A] uppercase block text-[10px]">AWB / TRACKING ID</span>
                  <span className="font-mono text-white block mt-0.5">
                    {tracking.courier_awb || tracking.tracking_id || 'PENDING'}
                  </span>
                </div>
                <div>
                  <span className="text-[#71717A] uppercase block text-[10px]">PAYMENT MODE</span>
                  <span className="font-bold text-white block mt-0.5">
                    {tracking.payment_mode} {tracking.payment_mode === 'COD' ? `(₹${tracking.cod_amount})` : ''}
                  </span>
                </div>
              </div>

              {/* External Carrier Link */}
              {tracking.tracking_url && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-xs">
                  <span className="text-[#A1A1AA]">
                    Live carrier tracking enabled by Courier Uncle
                  </span>
                  <a
                    href={tracking.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-bold text-[#D4AF37] hover:underline"
                  >
                    <span>OPEN CARRIER PORTAL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Visual Status Stepper */}
              <div className="space-y-4">
                <h4 className="text-xs font-sport font-black uppercase text-[#A1A1AA] tracking-wider">
                  SHIPMENT TIMELINE
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#24242D]">
                  {tracking.timeline && tracking.timeline.length > 0 ? (
                    tracking.timeline.map((event, idx) => (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            idx === 0
                              ? 'bg-[#D4AF37] border-white shadow-[0_0_10px_rgba(212,175,55,0.6)]'
                              : 'bg-[#181821] border-[#52525B]'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-black' : 'bg-[#A1A1AA]'}`} />
                        </div>

                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold uppercase tracking-wide ${idx === 0 ? 'text-[#D4AF37]' : 'text-white'}`}>
                              {event.status}
                            </span>
                            {event.timestamp && (
                              <span className="text-[10px] text-[#71717A] font-mono">
                                {new Date(event.timestamp).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          {event.notes && (
                            <p className="text-xs text-[#A1A1AA] leading-relaxed">{event.notes}</p>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 text-[11px] text-[#71717A] pt-0.5">
                              <MapPin className="w-3 h-3 text-[#D4AF37]" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#71717A] py-2">
                      Order is being prepared in the workshop. Courier manifest scheduled shortly.
                    </div>
                  )}
                </div>
              </div>

              {/* Transit Scans */}
              {tracking.scans && tracking.scans.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#24242D]">
                  <h4 className="text-xs font-sport font-black uppercase text-[#A1A1AA] tracking-wider">
                    CARRIER HUB SCANS ({tracking.scans.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {tracking.scans.map((scan, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-md bg-[#09090C] border border-[#1E1E28] flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <div className="font-bold text-white">{scan.status || scan.description}</div>
                          {scan.location && <div className="text-[#71717A]">{scan.location}</div>}
                        </div>
                        {scan.at && (
                          <div className="text-[#71717A] font-mono text-[10px]">
                            {new Date(scan.at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#24242D] bg-[#0E0E12] flex items-center justify-between">
          <span className="text-[11px] text-[#71717A]">
            Vishwakarma Bat House • White-glove Cricket Logistics
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
};
