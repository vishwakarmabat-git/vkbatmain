import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Truck, Package, Shield, CheckCircle2, Printer } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { adminService } from '@/services/adminService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProfessionalInvoice } from '@/components/invoice/ProfessionalInvoice';
import { toast } from 'sonner';

export const AdminOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Update states
  const [orderStatus, setOrderStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderService
      .getOrderById(id)
      .then((o) => {
        setOrder(o);
        setOrderStatus(o.order_status);
        setPaymentStatus(o.payment_status);
        setTrackingNumber(o.tracking_number || '');
        setShippingCarrier(o.shipping_carrier || '');
        setAdminNotes(o.admin_notes || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(id, {
        order_status: orderStatus,
        payment_status: paymentStatus,
        tracking_number: trackingNumber || undefined,
        shipping_carrier: shippingCarrier || undefined,
        admin_notes: adminNotes || undefined,
      });
      setOrder(updated);
      toast.success(`Order ${updated.order_number} updated successfully`);
    } catch (e) {
      toast.error('Error updating order');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-sport tracking-widest text-[#A1A1AA] uppercase">
          Loading Order Details...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="screen-only max-w-5xl mx-auto space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24242D] pb-4">
          <div className="flex items-center gap-3">
            <Link to="/admin/orders" className="p-2 text-[#71717A] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
                ORDER FULFILLMENT & DISPATCH
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
                ORDER: {order.order_number}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
            >
              PRINT TAX INVOICE
            </Button>
            <Badge variant={order.order_status === 'delivered' ? 'success' : 'gold'}>
              {order.order_status.toUpperCase()}
            </Badge>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items, Customizations & Customer Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Items */}
          <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
            <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase">
              CUSTOM CRICKET BLADES IN ORDER ({order.items.length})
            </h3>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 bg-[#181821] border border-[#24242D] rounded-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base">{item.product_name}</h4>
                      <span className="text-xs text-[#71717A] font-sport">SKU: {item.product_sku}</span>
                    </div>
                    <div className="text-right font-sport">
                      <div className="text-white font-bold">Qty: {item.quantity}</div>
                      <div className="text-[#D4AF37] font-black text-sm">
                        ₹{item.total_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {item.customization && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-sport text-[#A1A1AA] bg-[#121216] p-3 rounded-xs border border-[#24242D]">
                      <div>
                        <span className="text-[#71717A] block">WEIGHT:</span>
                        <span className="text-white font-bold">{item.customization.weight}</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block">HANDLE:</span>
                        <span className="text-white font-bold">{item.customization.handle_shape} ({item.customization.handle_size})</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block">GRIP:</span>
                        <span className="text-white font-bold">{item.customization.grip_color} ({item.customization.grip_count})</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block">STICKER:</span>
                        <span className="text-white font-bold">{item.customization.sticker_finish}</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block">KNOCKING:</span>
                        <span className="text-white font-bold">{item.customization.pre_knocking}</span>
                      </div>
                      {item.customization.custom_engraving && (
                        <div>
                          <span className="text-[#71717A] block">LASER ENGRAVING:</span>
                          <span className="text-[#D4AF37] font-bold">"{item.customization.custom_engraving}"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-[#24242D] pt-4 space-y-1.5 text-xs font-sport tracking-wider">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>SUBTOTAL:</span>
                <span className="text-white">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>DISCOUNT ({order.coupon_code || 'COUPON'}):</span>
                  <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#A1A1AA]">
                <span>GST (12% TAX):</span>
                <span className="text-white">₹{order.gst_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>SHIPPING:</span>
                <span className="text-white">₹{order.shipping_fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#D4AF37] pt-2 border-t border-[#24242D]">
                <span>GRAND TOTAL:</span>
                <span>₹{order.grand_total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address */}
          <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
            <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase">
              DELIVERY DESTINATION
            </h3>
            <div className="text-xs font-sport text-[#A1A1AA] space-y-1">
              <div className="text-white font-bold text-sm">{order.customer_name}</div>
              <div>{order.customer_phone} | {order.customer_email}</div>
              <div className="pt-2 text-white">
                {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </div>
              {order.customer_notes && (
                <div className="p-3 bg-[#181821] rounded-xs border border-[#24242D] mt-3">
                  <span className="text-[#D4AF37] font-bold block">CUSTOMER INSTRUCTIONS:</span>
                  <p className="text-white italic mt-0.5">"{order.customer_notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Management Form (5 cols) */}
        <form onSubmit={handleUpdateStatus} className="lg:col-span-5 bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-5 sticky top-24">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase">
            UPDATE ORDER STATUS & DISPATCH
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport mb-1.5">
              ORDER FULFILLMENT STATUS
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full bg-[#181821] border border-[#24242D] text-white p-2.5 text-sm rounded-sm font-sport font-bold uppercase"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">In Workshop Production</option>
              <option value="shipped">Shipped / In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport mb-1.5">
              PAYMENT STATUS
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-[#181821] border border-[#24242D] text-white p-2.5 text-sm rounded-sm font-sport font-bold uppercase"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid / Verified</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <Input
            label="SHIPPING CARRIER"
            placeholder="e.g. Bluedart / DTDC / DHL Express"
            value={shippingCarrier}
            onChange={(e) => setShippingCarrier(e.target.value)}
          />

          <Input
            label="TRACKING CONSIGNMENT NUMBER"
            placeholder="e.g. BD9876543210IN"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />

          <Textarea
            label="INTERNAL WORKSHOP NOTES"
            placeholder="e.g. Hand-selected cleft #42, weighed 1145g after machine knocking..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />

          <Button type="submit" variant="gold" size="lg" className="w-full" isLoading={isUpdating} leftIcon={<Save className="w-4 h-4" />}>
            SAVE ORDER UPDATES
          </Button>
        </form>
      </div>
      </div>
      {order && (
        <div className="print-only">
          <ProfessionalInvoice order={order} />
        </div>
      )}
    </>
  );
};
