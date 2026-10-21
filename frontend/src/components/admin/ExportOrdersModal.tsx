import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  Loader2,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { Order } from '@/types';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

interface ExportOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  allOrders?: Order[];
}

export const ExportOrdersModal: React.FC<ExportOrdersModalProps> = ({
  isOpen,
  onClose,
  allOrders = []
}) => {
  // Helper to get formatted local YYYY-MM-DD
  const formatDateForInput = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => formatDateForInput(new Date()), []);

  // Default: current month (1st of current month to today)
  const defaultStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return formatDateForInput(d);
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultStartStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Quick Preset Handlers
  const handlePreset = (type: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'all') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (type === 'today') {
      const s = formatDateForInput(today);
      setStartDate(s);
      setEndDate(s);
    } else if (type === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const s = formatDateForInput(y);
      setStartDate(s);
      setEndDate(s);
    } else if (type === 'last7') {
      const s7 = new Date(today);
      s7.setDate(s7.getDate() - 6);
      setStartDate(formatDateForInput(s7));
      setEndDate(formatDateForInput(today));
    } else if (type === 'last30') {
      const s30 = new Date(today);
      s30.setDate(s30.getDate() - 29);
      setStartDate(formatDateForInput(s30));
      setEndDate(formatDateForInput(today));
    } else if (type === 'thisMonth') {
      const m1 = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDateForInput(m1));
      setEndDate(formatDateForInput(today));
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Preview filtered orders
  const matchingOrders = useMemo(() => {
    if (!allOrders || allOrders.length === 0) return [];
    return allOrders.filter((order) => {
      // Status filter
      if (statusFilter && statusFilter !== 'all' && order.order_status !== statusFilter) {
        return false;
      }
      // Date range filter
      if (order.created_at) {
        const orderDate = new Date(order.created_at);
        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`);
          if (orderDate < start) return false;
        }
        if (endDate) {
          const end = new Date(`${endDate}T23:59:59.999`);
          if (orderDate > end) return false;
        }
      }
      return true;
    });
  }, [allOrders, startDate, endDate, statusFilter]);

  const matchingRevenue = useMemo(() => {
    return matchingOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
  }, [matchingOrders]);

  const handleDownload = async () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error('Start date cannot be after end date.');
      return;
    }

    setIsExporting(true);
    try {
      await adminService.exportOrdersExcel({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        statusFilter: statusFilter !== 'all' ? statusFilter : undefined
      });
      toast.success('Orders exported successfully in Excel (.xlsx) format!');
      onClose();
    } catch (err: any) {
      console.error('Export failed:', err);
      toast.error(err?.response?.data?.detail || 'Failed to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#121216] border border-[#24242D] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#24242D] bg-[#181821] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sport font-black text-base text-white tracking-wider uppercase">
                  EXPORT ORDERS TO EXCEL
                </h3>
                <span className="text-[10px] font-sport px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold uppercase">
                  .XLSX FORMAT
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Download orders with full customer info, address, bat weight, specs & financial data.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-8 h-8 rounded-full bg-[#121216] border border-[#24242D] text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Date Presets */}
          <div className="space-y-2">
            <label className="text-xs font-sport font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>QUICK DATE PRESETS</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: 'Today', key: 'today' },
                { label: 'Yesterday', key: 'yesterday' },
                { label: 'Last 7 Days', key: 'last7' },
                { label: 'Last 30 Days', key: 'last30' },
                { label: 'This Month', key: 'thisMonth' },
                { label: 'All Time', key: 'all' }
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePreset(p.key as any)}
                  className="px-2.5 py-1.5 text-xs font-sport font-bold rounded-xs bg-[#181821] border border-[#24242D] text-[#E4E4E7] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all uppercase cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sport font-bold text-[#E4E4E7] uppercase tracking-wider">
                FROM DATE
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white px-3 py-2 text-xs rounded-xs font-sport outline-none transition-colors"
                />
              </div>
              <span className="text-[10px] text-[#71717A]">Leave empty to include from start</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-sport font-bold text-[#E4E4E7] uppercase tracking-wider">
                TO DATE
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white px-3 py-2 text-xs rounded-xs font-sport outline-none transition-colors"
                />
              </div>
              <span className="text-[10px] text-[#71717A]">Leave empty to include up to latest</span>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-sport font-bold text-[#E4E4E7] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>FILTER BY ORDER STATUS</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#09090C] border border-[#24242D] focus:border-[#D4AF37] text-white px-3 py-2 text-xs rounded-xs font-sport uppercase outline-none transition-colors cursor-pointer"
            >
              <option value="all">ALL ORDER STATUSES</option>
              <option value="pending">PENDING</option>
              <option value="confirmed">CONFIRMED</option>
              <option value="processing">PROCESSING</option>
              <option value="shipped">SHIPPED</option>
              <option value="delivered">DELIVERED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>

          {/* Real-time Order Count & Revenue Badge */}
          <div className="p-4 rounded-lg bg-[#181821] border border-[#24242D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-sport text-[#A1A1AA] uppercase">MATCHING ORDERS IN RANGE</div>
                <div className="text-lg font-sport font-black text-white">
                  {matchingOrders.length} {matchingOrders.length === 1 ? 'Order' : 'Orders'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-sport text-[#A1A1AA] uppercase">COMBINED VALUE</div>
              <div className="text-lg font-sport font-black text-[#D4AF37]">
                ₹{matchingRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Included Fields Overview */}
          <div className="space-y-2 pt-2 border-t border-[#24242D]">
            <div className="text-xs font-sport font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>COLUMNS INCLUDED IN THIS EXCEL SPREADSHEET</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-sport">
              {[
                'Order ID',
                'Date & Time (IST)',
                'Customer Name',
                'Phone Number',
                'Customer Email',
                'Address Line 1 & 2',
                'City & State',
                'Pincode',
                'Bat Model / Item',
                'SKU',
                'Quantity',
                'Bat Weight',
                'Handle Shape & Size',
                'Grip Color & Count',
                'Sticker Finish',
                'Pre-Knocking & Oiling',
                'Custom Laser Engraving',
                'Unit Price & Item Total',
                'Subtotal & GST Amount',
                'Grand Total',
                'Payment Method & Status',
                'Shipping Carrier & Tracking',
                'Customer Notes'
              ].map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-xs bg-[#09090C] border border-[#24242D] text-[#A1A1AA]"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#24242D] bg-[#181821] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xs border border-[#24242D] text-xs font-sport font-bold text-[#A1A1AA] hover:text-white hover:bg-[#1E1E28] transition-colors uppercase cursor-pointer disabled:opacity-50"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-xs bg-[#D4AF37] hover:bg-[#E5B539] text-black text-xs font-sport font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>GENERATING EXCEL...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>DOWNLOAD EXCEL (.XLSX)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
