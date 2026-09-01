import React, { useEffect, useState } from 'react';
import { Boxes, Plus, Minus, Edit3, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('add');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('New workshop batch received');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await adminService.getInventory();
      setInventory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Realtime instant updates on inventory, checkout deductions, or product changes
  useRealtimeSync(['vk:realtime:inventory', 'vk:realtime:products'], fetchInventory);

  const openAdjustModal = (item: any) => {
    setSelectedProduct(item);
    setAdjustQuantity(5);
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      await adminService.adjustInventory({
        product_id: selectedProduct.id,
        adjustment_type: adjustmentType,
        quantity: Number(adjustQuantity),
        reason: adjustReason,
      });
      toast.success(`Inventory updated for ${selectedProduct.name}`);
      setAdjustModalOpen(false);
      fetchInventory();
    } catch (e) {
      toast.error('Error adjusting inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            STOCK CONTROL & AUDIT LOGS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            CRICKET BAT INVENTORY
          </h1>
        </div>
      </div>

      {/* Inventory Table */}
      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">BAT MODEL</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">CATEGORY</th>
                <th className="py-3 px-4 font-semibold">PRICE</th>
                <th className="py-3 px-4 font-semibold">STOCK QUANTITY</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#71717A]">
                    Loading stock audit...
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#181821]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">{item.name}</td>
                    <td className="py-3.5 px-4 text-[#A1A1AA]">{item.sku}</td>
                    <td className="py-3.5 px-4 text-[#D4AF37]">{item.category}</td>
                    <td className="py-3.5 px-4 text-white font-bold">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-base font-black text-white">{item.stock_quantity}</span> Units
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          item.stock_quantity === 0
                            ? 'red'
                            : item.stock_quantity <= 3
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {item.stock_status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAdjustModal(item)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      >
                        ADJUST STOCK
                      </Button>
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
          <div className="py-8 text-center text-[#71717A]">Loading stock audit...</div>
        ) : inventory.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No inventory items found.</div>
        ) : (
          inventory.map((item) => (
            <div
              key={item.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <div className="text-[11px] text-[#D4AF37] mt-0.5">{item.category}</div>
                  <div className="text-[10px] text-[#71717A]">SKU: {item.sku}</div>
                </div>
                <Badge
                  variant={
                    item.stock_quantity === 0
                      ? 'red'
                      : item.stock_quantity <= 3
                      ? 'warning'
                      : 'success'
                  }
                >
                  {item.stock_status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#24242D]/60">
                <div>
                  <div className="font-black text-white text-base">
                    {item.stock_quantity} <span className="text-xs font-normal text-[#A1A1AA]">Units in stock</span>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA]">₹{item.price.toLocaleString('en-IN')}</div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAdjustModal(item)}
                  leftIcon={<Edit3 className="w-3 h-3" />}
                  className="text-xs py-1.5 px-3"
                >
                  ADJUST STOCK
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`ADJUST STOCK: ${selectedProduct?.name}`}
      >
        {selectedProduct && (
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="bg-[#181821] p-3 rounded-xs text-xs font-sport text-[#A1A1AA] flex justify-between">
              <span>CURRENT RECORDED STOCK:</span>
              <span className="font-bold text-white text-sm">{selectedProduct.stock_quantity} Units</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport mb-1.5">
                ADJUSTMENT ACTION
              </label>
              <div className="grid grid-cols-3 gap-2 font-sport">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`p-2 rounded-xs border text-xs font-bold uppercase ${
                    adjustmentType === 'add' ? 'bg-[#D4AF37] text-[#09090B] border-[#D4AF37]' : 'bg-[#181821] text-white border-[#24242D]'
                  }`}
                >
                  + ADD STOCK
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('subtract')}
                  className={`p-2 rounded-xs border text-xs font-bold uppercase ${
                    adjustmentType === 'subtract' ? 'bg-red-500 text-white border-red-500' : 'bg-[#181821] text-white border-[#24242D]'
                  }`}
                >
                  - SUBTRACT
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('set')}
                  className={`p-2 rounded-xs border text-xs font-bold uppercase ${
                    adjustmentType === 'set' ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#181821] text-white border-[#24242D]'
                  }`}
                >
                  SET EXACT
                </button>
              </div>
            </div>

            <Input
              label="QUANTITY UNITS"
              type="number"
              min="1"
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(Number(e.target.value))}
              required
            />

            <Input
              label="REASON / AUDIT NOTE"
              placeholder="e.g. New harvest batch pressed / Damaged in transit"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdjustModalOpen(false)}>
                CANCEL
              </Button>
              <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
                CONFIRM STOCK AUDIT
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
