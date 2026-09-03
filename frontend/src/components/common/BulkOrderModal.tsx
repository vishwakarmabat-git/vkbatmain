import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { bulkOrderService } from '@/services/bulkOrderService';
import { CricketBallIcon } from '@/components/common/CricketIcons';

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkOrderModal: React.FC<BulkOrderModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clubName, setClubName] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('5 - 10 Bats');
  const [batModels, setBatModels] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !details.trim()) {
      toast.error('Please fill in required fields (Name, Phone, and Custom Specifications).');
      return;
    }

    setIsSubmitting(true);
    try {
      await bulkOrderService.submitBulkOrder({
        inquiry_type: 'bulk_order',
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        club_name: clubName.trim() || undefined,
        order_quantity: orderQuantity,
        bat_models: batModels.trim() || undefined,
        details: details.trim(),
      });
      toast.success('Bulk order inquiry transmitted! Our B2B manager will contact you within 4 hours.');
      setName('');
      setPhone('');
      setEmail('');
      setClubName('');
      setBatModels('');
      setDetails('');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error submitting bulk order inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-[#12121A] border border-[#242436] rounded-xl p-6 sm:p-8 shadow-2xl text-left z-10 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-[#71717A] hover:text-white transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-6">
              <span className="text-[10px] font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
                VK B2B PORTAL
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Bulk Order Specifications
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-sport tracking-wider text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="Sumit Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    placeholder="99094 54977"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    placeholder="club@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                  />
                </div>

                {/* Club / Academy Name */}
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    CLUB / ACADEMY NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Gujarat Titans Club"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Order Quantity */}
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    ORDER QUANTITY *
                  </label>
                  <select
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none"
                  >
                    <option value="5 - 10 Bats">5 - 10 Bats</option>
                    <option value="10 - 25 Bats">10 - 25 Bats</option>
                    <option value="25 - 50 Bats">25 - 50 Bats</option>
                    <option value="50 - 100 Bats">50 - 100 Bats</option>
                    <option value="100+ Bats (Kit Bag Wholesale)">100+ Bats (Kit Bag Wholesale)</option>
                  </select>
                </div>

                {/* Interested Bat Models */}
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    INTERESTED BAT MODELS
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Triple X2, Double Blade"
                    value={batModels}
                    onChange={(e) => setBatModels(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                  />
                </div>
              </div>

              {/* Custom Specs / Details */}
              <div className="space-y-1.5">
                <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                  CUSTOM SPECIFICATIONS & DETAILS *
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention specific weights (e.g. 1150g), sizes, handles, linseed oiling, or customized logo branding requirements..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                  className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B] resize-none"
                />
              </div>

              {/* Submit Button with Cricket Ball Seam theme */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] hover:shadow-[0_0_25px_rgba(201,24,43,0.55)] border-y-2 border-dashed border-white/60 text-white font-sport font-black py-4 px-6 rounded-xs uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer bat-swing-shine active:scale-95 group/btn disabled:opacity-60"
                >
                  <CricketBallIcon size={16} className="group-hover/btn:rotate-45 transition-transform duration-300" />
                  <span>{isSubmitting ? 'TRANSMITTING INQUIRY...' : 'REQUEST BULK CRICKET QUOTE'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
