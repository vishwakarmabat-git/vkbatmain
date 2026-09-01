import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldCheck, DollarSign, Truck, Phone } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable settings
  const [gstRate, setGstRate] = useState('12');
  const [shippingFee, setShippingFee] = useState('150');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('15000');
  const [whatsappNumber, setWhatsappNumber] = useState('+919876543210');
  const [storeEmail, setStoreEmail] = useState('support@vkbathouse.com');
  const [storePhone, setStorePhone] = useState('+91 98765 43210');

  useEffect(() => {
    adminService
      .getSettings()
      .then((s) => {
        setSettings(s);
        if (s.gst_rate) setGstRate(s.gst_rate);
        if (s.shipping_fee) setShippingFee(s.shipping_fee);
        if (s.free_shipping_threshold) setFreeShippingThreshold(s.free_shipping_threshold);
        if (s.whatsapp_number) setWhatsappNumber(s.whatsapp_number);
        if (s.contact_email) setStoreEmail(s.contact_email);
        if (s.contact_phone) setStorePhone(s.contact_phone);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateSettings({
        gst_rate: gstRate,
        shipping_fee: shippingFee,
        free_shipping_threshold: freeShippingThreshold,
        whatsapp_number: whatsappNumber,
        contact_email: storeEmail,
        contact_phone: storePhone,
      });
      toast.success('Global settings saved successfully');
    } catch (e) {
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="border-b border-[#24242D] pb-4">
        <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
          SYSTEM CONFIGURATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
          GLOBAL STORE & FINANCIAL SETTINGS
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tax & Financials */}
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
            FINANCIAL & TAX PARAMETERS (DECIMAL SAFE)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="GST RATE PERCENTAGE (%)"
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              required
            />
            <Input
              label="STANDARD SHIPPING FLAT (₹)"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              required
            />
            <Input
              label="FREE SHIPPING THRESHOLD (₹)"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Contact & WhatsApp Desk */}
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            WHATSAPP ORDERING & SUPPORT DESK
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="WHATSAPP BOT NUMBER (INTERNATIONAL)"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
            />
            <Input
              label="CUSTOMER SUPPORT EMAIL"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              required
            />
            <Input
              label="DISPATCH PHONE"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="gold" size="lg" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            SAVE GLOBAL SETTINGS
          </Button>
        </div>
      </form>
    </div>
  );
};
