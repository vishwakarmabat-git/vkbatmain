import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, Truck, MapPin, ExternalLink, AlertCircle, Clock, CheckCircle2, ShieldCheck, Box, MessageSquare } from 'lucide-react';
import { shippingService } from '@/services/shippingService';
import { ShipmentTracking } from '@/types';
import { Button } from '@/components/ui/Button';

export const TrackingPage: React.FC = () => {
  const { trackingId: routeTrackingId } = useParams<{ trackingId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const initialInput = routeTrackingId || queryId || '';
  const [trackingInput, setTrackingInput] = useState<string>(initialInput);
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performLookup = async (idToLookup: string) => {
    const clean = idToLookup.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);
    try {
      const res = await shippingService.getPublicTracking(clean);
      setTracking(res);
    } catch (err: any) {
      console.error('Tracking lookup error:', err);
      setError(
        err?.response?.data?.detail || 'No shipment record found matching this consignment number.'
      );
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialInput) {
      performLookup(initialInput);
    }
  }, [routeTrackingId, queryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setSearchParams({ id: trackingInput.trim() });
      performLookup(trackingInput.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-8">
      {/* Title & Banner */}
      <div className="border-b border-[#24242D] pb-5">
        <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase block">
          LOGISTICS & CONSIGNMENT TRACKING
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#F4F4F5] uppercase mt-1">
          TRACK YOUR CRICKET BAT SHIPMENT
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
          Enter your Courier Uncle AWB consignment number to view real-time location, vehicle scans, and transit milestones.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-[#121216] border border-[#24242D] rounded-xl p-5 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Enter AWB or Consignment Number (e.g. CUTEST8484...)"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white pl-11 pr-4 py-3 rounded-lg text-sm font-sport tracking-wider outline-none uppercase placeholder:normal-case placeholder:text-[#52525B]"
            />
          </div>
          <Button
            type="submit"
            variant="gold"
            size="lg"
            isLoading={loading}
            leftIcon={<Truck className="w-4 h-4 shrink-0" />}
            className="sm:w-auto font-black"
          >
            TRACK CONSIGNMENT
          </Button>
        </form>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Consignment Not Found</h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">{error}</p>
          <div className="pt-2">
            <Link to="/contact">
              <Button variant="outline" size="sm">
                CONTACT WORKSHOP SUPPORT
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Results View */}
      {tracking && (
        <div className="space-y-6">
          {/* Status Header Card */}
          <div className="bg-[#121216] border border-[#24242D] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#24242D]">
              <div>
                <span className="text-[10px] font-sport text-[#71717A] uppercase block">
                  CONSIGNMENT NUMBER
                </span>
                <span className="text-xl font-mono font-black text-[#D4AF37]">
                  {tracking.courier_awb || tracking.tracking_id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#181822] border border-[#242430] text-emerald-400 font-sport font-bold text-xs uppercase">
                  {tracking.status_label || tracking.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sport">
              <div>
                <span className="text-[#71717A] uppercase text-[10px]">ORDER REF</span>
                <span className="font-bold text-white block mt-0.5">{tracking.order_number}</span>
              </div>
              <div>
                <span className="text-[#71717A] uppercase text-[10px]">COURIER PARTNER</span>
                <span className="font-bold text-[#D4AF37] block mt-0.5">
                  {tracking.carrier} ({tracking.service})
                </span>
              </div>
              <div>
                <span className="text-[#71717A] uppercase text-[10px]">DELIVERY MODE</span>
                <span className="font-bold text-white block mt-0.5">{tracking.payment_mode}</span>
              </div>
              <div>
                <span className="text-[#71717A] uppercase text-[10px]">PACKAGING</span>
                <span className="font-bold text-white block mt-0.5">Reinforced 90cm Box</span>
              </div>
            </div>

            {tracking.tracking_url && (
              <div className="pt-3 border-t border-[#24242D] flex items-center justify-between text-xs">
                <span className="text-[#71717A]">Official Courier Portal</span>
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  <span>LIVE CARRIER RADAR</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Timeline View */}
          <div className="bg-[#121216] border border-[#24242D] rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="font-sport font-black text-xs uppercase text-white tracking-wider">
              PARCEL MOVEMENT TIMELINE
            </h3>

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
                <div className="text-xs text-[#71717A]">
                  Order confirmed. Workshop preparing bat cleft and protective packaging.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
