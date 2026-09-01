import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Coupon } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(10000);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Realtime instant updates for promo coupons
  useRealtimeSync('vk:realtime:coupons', fetchCoupons);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.createCoupon({
        code: code.toUpperCase().trim(),
        description,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrder),
        usage_limit: Number(usageLimit),
        is_active: true,
      });
      toast.success(`Coupon ${code} created!`);
      setCreateModalOpen(false);
      setCode('');
      setDescription('');
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error creating coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, cCode: string) => {
    if (!window.confirm(`Delete coupon ${cCode}?`)) return;
    try {
      await adminService.deleteCoupon(id);
      toast.success(`Coupon ${cCode} deleted`);
      fetchCoupons();
    } catch (e) {
      toast.error('Error deleting coupon');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            MARKETING & PROMOTIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            DISCOUNT COUPONS ({coupons.length})
          </h1>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={() => setCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          CREATE PROMO COUPON
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">COUPON CODE</th>
                <th className="py-3 px-4 font-semibold">DISCOUNT</th>
                <th className="py-3 px-4 font-semibold">MIN ORDER</th>
                <th className="py-3 px-4 font-semibold">USAGE STATS</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#71717A]">
                    Loading coupons...
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#181821]/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-[#D4AF37] text-base">{c.code}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                    </td>
                    <td className="py-3.5 px-4 text-[#A1A1AA]">
                      ₹{c.min_order_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-[#A1A1AA]">
                      {c.times_used} / {c.usage_limit} uses
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.is_active ? 'success' : 'dark'}>
                        {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 text-[#71717A] hover:text-red-400 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View (Zero Horizontal Scrolling) */}
      <div className="md:hidden space-y-3 font-sport text-xs">
        {loading ? (
          <div className="py-8 text-center text-[#71717A]">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No promo coupons created.</div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-[#D4AF37] text-base tracking-wider">{c.code}</h4>
                  <div className="text-white font-bold text-xs mt-0.5">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                  </div>
                </div>
                <Badge variant={c.is_active ? 'success' : 'dark'}>
                  {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#24242D]/60 text-[#A1A1AA]">
                <div className="space-y-0.5">
                  <div className="text-[11px]">Min Order: ₹{c.min_order_amount.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-[#71717A]">{c.times_used} / {c.usage_limit} uses</div>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(c.id, c.code)}
                  className="p-2 rounded-xs bg-[#181821] text-[#71717A] hover:text-red-400 border border-[#24242D] cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="CREATE PROMO COUPON">
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <Input
            label="COUPON CODE (UPPERCASE)"
            placeholder="e.g. VKCHAMP10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />

          <Input
            label="DESCRIPTION"
            placeholder="e.g. 10% off for first order"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport mb-1.5">
                DISCOUNT TYPE
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-[#121216] border border-[#24242D] text-white p-2.5 text-sm rounded-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <Input
              label={discountType === 'percentage' ? 'DISCOUNT PERCENT (%)' : 'DISCOUNT VALUE (₹)'}
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="MINIMUM ORDER (₹)"
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(Number(e.target.value))}
              required
            />
            <Input
              label="USAGE LIMIT"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
              CREATE PROMO CODE
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
