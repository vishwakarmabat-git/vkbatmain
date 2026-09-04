import React from 'react';
import { Order } from '@/types';
import { ShieldCheck, Phone, Mail, Globe, MapPin, CheckCircle2 } from 'lucide-react';

interface ProfessionalInvoiceProps {
  order: Order;
  className?: string;
}

// Utility to convert numbers to Indian Rupee Words
function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) {
      return (
        a[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' ' + inWords(n % 100) : '')
      );
    }
    if (n < 100000) {
      return (
        inWords(Math.floor(n / 1000)) +
        ' Thousand' +
        (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '')
      );
    }
    if (n < 10000000) {
      return (
        inWords(Math.floor(n / 100000)) +
        ' Lakh' +
        (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '')
      );
    }
    return (
      inWords(Math.floor(n / 10000000)) +
      ' Crore' +
      (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '')
    );
  }

  const rounded = Math.round(num);
  return `${inWords(rounded)} Rupees Only`;
}

export const ProfessionalInvoice: React.FC<ProfessionalInvoiceProps> = ({ order, className = '' }) => {
  const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const isPaid = order.payment_status === 'paid' || order.payment_method === 'razorpay';

  return (
    <div
      className={`bg-white text-neutral-900 font-sans print-single-page-invoice p-6 sm:p-8 max-w-[800px] mx-auto text-left selection:bg-neutral-200 ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. TOP HEADER: LOGO, BRAND, INVOICE BADGE */}
      <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-4 gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="Vishwakarma Bat House Logo"
            className="w-14 h-14 object-contain shrink-0"
          />
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-950 font-serif leading-none uppercase">
              VISHWAKARMA BAT HOUSE
            </h1>
            <p className="text-[10px] font-bold text-[#AA7C11] tracking-widest uppercase mt-0.5">
              MASTER BATMAKERS & HANDCRAFTED CRICKET EQUIPMENT • EST. GUJARAT
            </p>
            <div className="text-[9.5px] text-neutral-600 leading-tight mt-1 flex flex-wrap gap-x-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#AA7C11] shrink-0" />
                Uttarsanda Bhalej Road, Chaklasi 387315, Gujarat
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-[#AA7C11] shrink-0" />
                +91 92745 43199
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-[#AA7C11] shrink-0" />
                www.vkbathouse.com
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Title & Type */}
        <div className="text-right shrink-0">
          <div className="inline-block bg-neutral-950 text-white font-black text-xs px-3 py-1 uppercase tracking-widest rounded-xs">
            TAX INVOICE
          </div>
          <p className="text-[9px] text-neutral-500 font-semibold tracking-wider uppercase mt-1">
            Original For Recipient
          </p>
          <div className="mt-1.5 text-xs font-black text-neutral-950">
            #{order.order_number}
          </div>
          <div className="text-[10px] text-neutral-600 font-medium">
            Date: <span className="font-bold text-neutral-900">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 2. ORDER METADATA & BILLING/SHIPPING GRID */}
      <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-neutral-300 text-xs">
        {/* Left: Customer Information */}
        <div className="bg-neutral-50 rounded-xs p-3 border border-neutral-200">
          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider block mb-1">
            BILLED & SHIPPED TO:
          </span>
          <div className="font-black text-sm text-neutral-950 capitalize">
            {order.customer_name}
          </div>
          <div className="text-neutral-700 text-[11px] leading-relaxed mt-0.5">
            <div>{order.shipping_address.address_line1}</div>
            {order.shipping_address.address_line2 && (
              <div>{order.shipping_address.address_line2}</div>
            )}
            <div className="font-semibold text-neutral-900">
              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
            </div>
            <div className="mt-1 pt-1 border-t border-neutral-200 text-[10.5px] text-neutral-600 flex flex-col gap-0.5">
              <span><strong>Phone:</strong> {order.customer_phone}</span>
              <span><strong>Email:</strong> {order.customer_email}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment & Dispatch Details */}
        <div className="bg-neutral-50 rounded-xs p-3 border border-neutral-200 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider block mb-1">
              PAYMENT & DISPATCH SUMMARY:
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">Payment Mode:</span>
                <span className="font-black text-neutral-900 uppercase">
                  {order.payment_method === 'razorpay' ? 'Razorpay Online Gateway' : order.payment_method === 'cod' ? 'Cash On Delivery (COD)' : order.payment_method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Payment Status:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-xs ${isPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                >
                  {isPaid ? 'PAID' : 'PENDING UPON DELIVERY'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Courier / Shipping:</span>
                <span className="font-bold text-neutral-900">
                  {order.shipping_carrier || 'Insured Express Doorstep'}
                </span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">AWB Tracking No:</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {order.tracking_number}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-neutral-200 text-[10px] text-neutral-500 flex items-center justify-between">
            <span>Order Status: <strong className="uppercase text-neutral-800">{order.order_status}</strong></span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Genuine Willow
            </span>
          </div>
        </div>
      </div>

      {/* 3. PRODUCTS TABLE (WHAT HE BOUGHT) */}
      <div className="py-3">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-neutral-900 text-white text-[10px] font-black uppercase tracking-wider">
              <th className="py-2 px-2.5 w-8 text-center">#</th>
              <th className="py-2 px-2.5">Item Description & Workshop Specifications</th>
              <th className="py-2 px-2.5 text-center w-14">Qty</th>
              <th className="py-2 px-2.5 text-right w-24">Rate (₹)</th>
              <th className="py-2 px-2.5 text-right w-24">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 border-b border-neutral-300">
            {order.items.map((item, index) => (
              <tr key={item.id || index} className="align-top">
                <td className="py-2.5 px-2.5 text-center font-bold text-neutral-500 text-[11px]">
                  {index + 1}
                </td>
                <td className="py-2.5 px-2.5">
                  <div className="font-black text-neutral-950 text-xs sm:text-sm uppercase">
                    {item.product_name}
                  </div>
                  {/* Workshop Customizations Breakdown */}
                  {item.customization ? (
                    <div className="text-[10px] text-neutral-600 space-y-0.5 mt-1 bg-neutral-50 p-1.5 rounded-xs border border-neutral-200/80">
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span><strong>Weight:</strong> {item.customization.weight}</span>
                        <span><strong>Handle:</strong> {item.customization.handle_shape} ({item.customization.handle_size})</span>
                        {item.customization.pre_knocking !== 'Raw' && (
                          <span className="text-emerald-800 font-semibold">
                            <strong>Knocking:</strong> {item.customization.pre_knocking}
                          </span>
                        )}
                      </div>
                      {item.customization.custom_engraving && (
                        <div className="text-[#8C5D0E] font-bold">
                          <strong>Laser Engraving:</strong> "{item.customization.custom_engraving}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      Standard Tournament Handcrafted Specifications
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-2.5 text-center font-bold text-neutral-900 text-[11px]">
                  {item.quantity}
                </td>
                <td className="py-2.5 px-2.5 text-right font-medium text-neutral-800 text-[11px]">
                  ₹{item.unit_price.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-2.5 text-right font-black text-neutral-950 text-xs">
                  ₹{item.total_price.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. TOTALS & WORDS BREAKDOWN */}
      <div className="grid grid-cols-12 gap-4 pt-1 pb-3 text-xs border-b border-neutral-300">
        {/* Left: Amount in Words & Notes (7 cols) */}
        <div className="col-span-7 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider block">
              TOTAL AMOUNT IN WORDS:
            </span>
            <div className="font-bold text-neutral-900 text-xs italic bg-neutral-50 p-2 rounded-xs border border-neutral-200">
              "{numberToIndianWords(order.grand_total)}"
            </div>
          </div>

          {order.customer_notes && (
            <div className="text-[10px] bg-neutral-50 p-2 rounded-xs border border-neutral-200">
              <strong className="text-neutral-700 uppercase">Customer Workshop Note:</strong>{' '}
              <span className="text-neutral-600">{order.customer_notes}</span>
            </div>
          )}

          <div className="text-[9px] text-neutral-500 leading-tight">
            * All prices are inclusive of GST (Goods & Services Tax) and master batmaker calibration charges.
          </div>
        </div>

        {/* Right: Subtotal, Tax, Shipping & Grand Total (5 cols) */}
        <div className="col-span-5 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-neutral-600">
            <span>Items Subtotal:</span>
            <span className="font-semibold text-neutral-900">
              ₹{(order.subtotal || order.grand_total).toLocaleString('en-IN')}
            </span>
          </div>

          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({order.coupon_code || 'Promo'}):</span>
              <span className="font-bold">-₹{order.discount_amount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between text-neutral-600">
            <span>Insured Courier Shipping:</span>
            <span className="font-bold text-emerald-700">
              {order.shipping_fee > 0 ? `₹${order.shipping_fee}` : 'FREE'}
            </span>
          </div>

          <div className="flex justify-between text-neutral-600">
            <span>GST / Taxes:</span>
            <span className="font-medium text-neutral-800">Included in Price</span>
          </div>

          {/* Highlighted Total Box */}
          <div className="mt-2 pt-2 border-t-2 border-neutral-900 flex justify-between items-center bg-neutral-100 p-2 rounded-xs">
            <span className="font-black text-xs uppercase tracking-wider text-neutral-950">
              GRAND TOTAL:
            </span>
            <span className="font-black text-base text-neutral-950">
              ₹{order.grand_total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 5. FOOTER: TERMS & CONDITIONS + DIGITAL SIGNATURE SEAL */}
      <div className="pt-3 flex items-end justify-between text-[9px] text-neutral-600 gap-4">
        <div className="max-w-[420px] space-y-1">
          <strong className="text-neutral-900 uppercase font-black tracking-wider block">
            TERMS & WORKSHOP GUARANTEE:
          </strong>
          <ol className="list-decimal pl-3 space-y-0.5 text-[8.5px] leading-tight text-neutral-500">
            <li>Handcrafted using 100% genuine natural seasoned Kashmir & Kashmir willow clefts.</li>
            <li>Covered under workshop manufacturing warranty for cleft and handle integrity.</li>
            <li>For knocking maintenance, re-gripping, or service, WhatsApp our master craftsman at +91 92745 43199.</li>
          </ol>
          <div className="text-[8px] text-neutral-400 italic pt-1">
            This is a computer-generated tax invoice. No physical signature is required.
          </div>
        </div>

        {/* Authorized Signatory Block */}
        <div className="text-right shrink-0 space-y-1">
          <div className="text-[10px] font-black text-neutral-900 uppercase">
            For VISHWAKARMA BAT HOUSE
          </div>
          {/* Stylized Digital Badge Seal */}
          <div className="inline-block border border-amber-600/40 bg-amber-50 text-amber-900 font-serif font-bold text-[8.5px] px-2.5 py-1 rounded-xs uppercase tracking-wider shadow-xs">
            ★ MASTER CRAFTSMAN CERTIFIED ★
          </div>
          <div className="text-[9px] text-neutral-500 font-semibold">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
};
