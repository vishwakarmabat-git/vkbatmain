import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Search,
  Download,
  Eye,
  XCircle,
  RefreshCw,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  Box,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { shippingService } from '@/services/shippingService';
import { Shipment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TrackingModal } from '@/components/shipping/TrackingModal';
import { useRealtimeSync } from '@/hooks/useRealtime';
import { toast } from 'sonner';

export const AdminShipmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Tracking modal state
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  // Cancellation state
  const [cancellingShipment, setCancellingShipment] = useState<Shipment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Wallet State
  const [wallet, setWallet] = useState<{
    wallet_balance: number;
    floor_balance: number;
    can_book: boolean;
    currency: string;
  } | null>(null);

  const fetchShipments = () => {
    setLoading(true);
    shippingService
      .getAdminShipments({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      })
      .then((res: any) => {
        const items = res.items || res.shipments || [];
        const totalCount = res.total ?? res.count ?? items.length;
        setShipments(items);
        setTotal(totalCount);
      })
      .catch((err) => {
        console.error('Failed to load shipments:', err);
        toast.error('Failed to fetch shipments');
      })
      .finally(() => setLoading(false));
  };

  const fetchWallet = () => {
    shippingService
      .getWalletOverview()
      .then(setWallet)
      .catch(() => {});
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchWallet();
  }, []);

  // Realtime instant auto-sync without page reload
  useRealtimeSync('vk:realtime:shipments', () => {
    fetchShipments();
    fetchWallet();
  });

  const handleDownloadLabel = async (shipment: Shipment) => {
    try {
      toast.info(`Generating shipping label for ${shipment.tracking_id}...`);
      const blob = await shippingService.downloadLabel(shipment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ShippingLabel_${shipment.courier_name}_${shipment.tracking_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Label downloaded successfully');
    } catch (err: any) {
      toast.error('Failed to download shipping label');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingShipment) return;
    setIsCancelling(true);
    try {
      await shippingService.cancelShipment(cancellingShipment.id, cancelReason || 'Merchant Request');
      toast.success(`Shipment ${cancellingShipment.tracking_id} cancelled successfully`);
      setCancellingShipment(null);
      setCancelReason('');
      fetchShipments();
      fetchWallet();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to cancel shipment');
    } finally {
      setIsCancelling(false);
    }
  };

  // Status badge styling helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'OUT_FOR_DELIVERY':
      case 'IN_TRANSIT':
        return <Badge variant="gold">{status.replace(/_/g, ' ')}</Badge>;
      case 'PICKED_UP':
      case 'CREATED':
      case 'BOOKED':
        return (
          <span className="px-2 py-0.5 rounded-xs bg-[#1E1E28] text-amber-400 font-sport font-bold text-[10px] border border-amber-500/30">
            {status}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-xs bg-red-500/10 text-red-400 font-sport font-bold text-[10px] border border-red-500/30">
            CANCELLED
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            LOGISTICS & DISPATCH CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5 flex items-center gap-3">
            <span>COURIER UNCLE SHIPMENTS</span>
            <span className="text-xs font-sport px-2.5 py-1 rounded-full bg-[#181822] border border-[#242430] text-[#D4AF37] font-bold">
              {total} TOTAL
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchShipments();
              fetchWallet();
              toast.success('Shipping data re-synchronized');
            }}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            SYNC LIVE
          </Button>
          <Link to="/admin/orders">
            <Button variant="gold" size="sm" leftIcon={<Truck className="w-3.5 h-3.5" />}>
              DISPATCH NEW ORDER
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-[#24242D] rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs font-sport uppercase">
            <span>TOTAL DISPATCHED</span>
            <Truck className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black font-sport text-white">{total}</div>
          <span className="text-[11px] text-[#A1A1AA]">Across Ekart, Delhivery, Bluedart</span>
        </div>

        <div className="bg-[#121216] border border-[#24242D] rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs font-sport uppercase">
            <span>IN TRANSIT</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-sport text-amber-400">
            {(shipments || []).filter((s) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(s?.shipment_status || '')).length}
          </div>
          <span className="text-[11px] text-[#A1A1AA]">Active on courier vehicles</span>
        </div>

        <div className="bg-[#121216] border border-[#24242D] rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs font-sport uppercase">
            <span>DELIVERED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-sport text-emerald-400">
            {(shipments || []).filter((s) => s?.shipment_status === 'DELIVERED').length}
          </div>
          <span className="text-[11px] text-[#A1A1AA]">Completed customer deliveries</span>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-[#121216] border border-[#24242D] rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs font-sport uppercase">
            <span>CU PREPAID WALLET</span>
            <Wallet className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black font-sport text-[#D4AF37]">
            ₹{wallet ? Number(wallet.wallet_balance ?? (wallet as any).balance ?? 0).toLocaleString('en-IN') : '...'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {wallet?.can_book ? (
              <span className="text-emerald-400 font-bold">✓ Booking Active</span>
            ) : (
              <span className="text-red-400 font-bold">⚠ Low Wallet Balance</span>
            )}
            <span className="text-[#71717A]">
              (Min: ₹{wallet ? Number(wallet.floor_balance ?? (wallet as any).min_booking_balance ?? 100).toLocaleString('en-IN') : '100'})
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 font-sport text-xs">
          {['', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  if (st) params.set('status', st);
                  else params.delete('status');
                  setSearchParams(params);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xs font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#D4AF37] text-[#09090B]'
                    : 'bg-[#121216] border border-[#24242D] text-[#A1A1AA] hover:text-white'
                }`}
              >
                {st.replace(/_/g, ' ') || 'ALL SHIPMENTS'}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search AWB, order number, courier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-xs font-sport tracking-wider text-white pl-9 pr-3 py-2 rounded-xs focus:outline-none min-w-0"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">ORDER / AWB</th>
                <th className="py-3 px-4 font-semibold">CARRIER & TIER</th>
                <th className="py-3 px-4 font-semibold">CHARGEABLE WEIGHT</th>
                <th className="py-3 px-4 font-semibold">SHIPPING FEE</th>
                <th className="py-3 px-4 font-semibold">PAYMENT</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold">DISPATCHED AT</th>
                <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D] text-[#A1A1AA]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto mb-2" />
                    <span>Loading courier manifests...</span>
                  </td>
                </tr>
              ) : (!shipments || shipments.length === 0) ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Box className="w-8 h-8 text-[#52525B] mx-auto mb-2" />
                    <span className="text-white font-bold block">No Shipments Found</span>
                    <span className="text-[#71717A] text-[11px]">
                      Book a shipment for eligible confirmed orders.
                    </span>
                  </td>
                </tr>
              ) : (
                (shipments || []).map((sh) => (
                  <tr key={sh.id} className="hover:bg-[#181821] transition-colors">
                    {/* Order / AWB */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">
                        {sh.order_number || (sh.order_id ? sh.order_id.substring(0, 8) : '—')}
                      </div>
                      <div className="font-mono text-[#D4AF37] text-[11px] flex items-center gap-1">
                        <span>{sh.courier_awb || sh.tracking_id || '—'}</span>
                        {sh.is_sandbox && (
                          <span className="text-[9px] px-1 py-0.2 rounded-xs bg-amber-500/20 text-amber-400 font-sans">
                            TEST
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Carrier & Tier */}
                    <td className="py-3 px-4">
                      <div className="text-white font-bold">{sh.courier_name || 'Courier'}</div>
                      <div className="text-[#71717A] text-[10px] uppercase font-mono">
                        {sh.courier_service || 'STANDARD'} {sh.zone ? `(Zone ${sh.zone})` : ''}
                      </div>
                    </td>

                    {/* Weight & Bat Dimensions */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-white">{sh.chargeable_weight_kg ?? '—'} kg</span>
                      <div className="text-[10px] text-[#71717A]">
                        {sh.package_length_cm || 0}x{sh.package_width_cm || 0}x{sh.package_height_cm || 0} cm
                      </div>
                    </td>

                    {/* Shipping Fee */}
                    <td className="py-3 px-4 font-black text-white">
                      ₹{Number(sh.shipping_charge ?? 0).toFixed(2)}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-white uppercase">{sh.payment_mode || 'PREPAID'}</span>
                      {sh.payment_mode === 'COD' && (
                        <div className="text-[10px] text-amber-400">
                          ₹{Number(sh.cod_amount || 0).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">{renderStatusBadge(sh.shipment_status || 'CREATED')}</td>

                    {/* Date */}
                    <td className="py-3 px-4 text-[11px] text-[#71717A]">
                      {sh.booked_at ? new Date(sh.booked_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Tracking */}
                        <button
                          onClick={() => setActiveTrackingId(sh.tracking_id)}
                          className="p-1.5 rounded-xs bg-[#242430] hover:bg-[#D4AF37] hover:text-black text-white transition-colors cursor-pointer"
                          title="View Live Tracking Timeline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Download Label */}
                        <button
                          onClick={() => handleDownloadLabel(sh)}
                          className="p-1.5 rounded-xs bg-[#242430] hover:bg-[#10B981] hover:text-white text-white transition-colors cursor-pointer"
                          title="Download Thermal Shipping Label PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Cancel Shipment (allowed before courier pickup) */}
                        {!['DELIVERED', 'PICKED_UP', 'IN_TRANSIT', 'CANCELLED'].includes(
                          sh.shipment_status
                        ) && (
                          <button
                            onClick={() => setCancellingShipment(sh)}
                            className="p-1.5 rounded-xs bg-[#242430] hover:bg-red-500 hover:text-white text-red-400 transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {total > limit && (
          <div className="p-4 border-t border-[#24242D] flex items-center justify-between text-xs font-sport">
            <span className="text-[#71717A]">
              Showing page {page} of {Math.ceil(total / limit)} ({total} total shipments)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {activeTrackingId && (
        <TrackingModal
          trackingId={activeTrackingId}
          isOpen={Boolean(activeTrackingId)}
          onClose={() => setActiveTrackingId(null)}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121216] border border-[#24242D] w-full max-w-md rounded-xl p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-white text-base uppercase">
                  CANCEL SHIPMENT DISPATCH
                </h3>
                <span className="text-xs text-[#71717A] font-mono">
                  AWB: {cancellingShipment.courier_awb || cancellingShipment.tracking_id}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Are you sure you want to cancel this booking with{' '}
              <span className="text-white font-bold">{cancellingShipment.courier_name}</span>? Any
              shipping charges debited will be credited back to your Courier Uncle balance.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-sport text-[#71717A] uppercase">
                Cancellation Reason (Required)
              </label>
              <input
                type="text"
                placeholder="e.g. Customer requested bat weight adjustment"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#09090C] border border-[#24242D] focus:border-red-500 text-white p-2.5 rounded-md text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingShipment(null)}
                disabled={isCancelling}
              >
                NO, KEEP ACTIVE
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={isCancelling || !cancelReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isCancelling ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
