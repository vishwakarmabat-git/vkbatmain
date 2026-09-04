import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { bulkOrderService } from '@/services/bulkOrderService';
import { CricketBallIcon } from '@/components/common/CricketIcons';

export const ContactRequirementSection: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cricketExperience, setCricketExperience] = useState('Club Player');
  const [preferredWeight, setPreferredWeight] = useState('Light (1110 - 1140g)');
  const [customSpecs, setCustomSpecs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !contactNumber) {
      toast.error('Please enter your full name and contact number');
      return;
    }

    setIsSubmitting(true);
    try {
      await bulkOrderService.submitBulkOrder({
        inquiry_type: 'custom_requirement',
        name: fullName.trim(),
        phone: contactNumber.trim(),
        email: email.trim() || undefined,
        details: `Experience: ${cricketExperience} | Weight: ${preferredWeight} | Specs: ${customSpecs.trim() || 'Standard custom craftsmanship request'}`,
      });
      toast.success('Thank you! Your custom bat requirement has been sent to our master artisan.');
      setFullName('');
      setContactNumber('');
      setEmail('');
      setCustomSpecs('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error submitting requirement. Please try again or message on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const message = encodeURIComponent(
      `Hello VK Bat House! I want to order a custom handcrafted bat.\n\n` +
      `Name: ${fullName || 'Interested Player'}\n` +
      `Phone: ${contactNumber || 'Direct Inquiry'}\n` +
      `Experience: ${cricketExperience}\n` +
      `Preferred Weight: ${preferredWeight}\n` +
      (customSpecs ? `Custom Specs: ${customSpecs}` : '')
    );
    window.open(`https://wa.me/919274543199?text=${message}`, '_blank');
  };

  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-left border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
            GET IN TOUCH
          </span>
          <h2 className="text-[clamp(1.65rem,4vw+0.5rem,3.75rem)] font-serif font-black tracking-tight text-white uppercase leading-tight break-words">
            Ready to Order Your <br />
            <span className="text-[#D4AF37]">Perfect Bat?</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
            Reach out via WhatsApp, call, or submit your custom specifications below. Every cleft is pressed and shaped to your specific requirements.
          </p>
        </div>

        {/* 2-Column Grid with Matching Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch">
          {/* Left Column: Requirement Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#111116] border border-[#24242D] rounded-md p-4 sm:p-8 shadow-2xl flex flex-col justify-between h-full">
            <div className="space-y-0.5 sm:space-y-1 mb-3 sm:mb-5">
              <span className="text-[10px] sm:text-[11px] font-sport font-black tracking-widest text-[#D4AF37] uppercase">
                CUSTOM SPECS
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                Requirement Form
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 font-sport tracking-wider text-xs">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sumit Patel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-[#181820] border border-[#2A2A36] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
                      CONTACT NUMBER *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 99094 54977"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                      className="w-full bg-[#181820] border border-[#2A2A36] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. player@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#181820] border border-[#2A2A36] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                  />
                </div>

                {/* Cricket Experience & Preferred Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
                      CRICKET EXPERIENCE
                    </label>
                    <select
                      value={cricketExperience}
                      onChange={(e) => setCricketExperience(e.target.value)}
                      className="w-full bg-[#181820] border border-[#2A2A36] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Club Player">Club Player</option>
                      <option value="Leather Ball Opener">Leather Ball Opener</option>
                      <option value="Middle Order Power Hitter">Middle Order Power Hitter</option>
                      <option value="Tennis Ball Cricketer">Tennis Ball Cricketer</option>
                      <option value="Professional / State Level">Professional / State Level</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
                      PREFERRED BAT WEIGHT
                    </label>
                    <select
                      value={preferredWeight}
                      onChange={(e) => setPreferredWeight(e.target.value)}
                      className="w-full bg-[#181820] border border-[#2A2A36] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Light (950 - 1050g)">Light (950 - 1050g)</option>
                      <option value="Medium (1050 - 1150g)">Medium (1050 - 1150g)</option>
                      <option value="Heavy (1150 - 1250g)">Heavy (1150 - 1250g)</option>

                    </select>
                  </div>
                </div>

                {/* Custom Specs / Message */}
                <div className="space-y-1.5 flex-1">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
                    CUSTOM SPECS / MESSAGE
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Enter spine height, edge thickness, handle type, or grip preference..."
                    value={customSpecs}
                    onChange={(e) => setCustomSpecs(e.target.value)}
                    className="w-full min-h-[140px] bg-[#181820] border border-[#2A2A36] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B] resize-none"
                  />
                </div>
              </div>

              {/* Submit Button pinned at bottom with Cricket Ball Seam theme */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] hover:shadow-[0_0_30px_rgba(201,24,43,0.6)] border-y-2 border-dashed border-white/60 text-white font-sport font-black py-3.5 sm:py-4 px-4 sm:px-6 rounded-xs uppercase tracking-wider text-xs flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 transition-all shadow-xl cursor-pointer bat-swing-shine active:scale-95 group/btn leading-tight text-center"
                >
                  <CricketBallIcon size={16} className="shrink-0 group-hover/btn:rotate-45 transition-transform duration-300" />
                  <span>{isSubmitting ? 'DISPATCHING SPECIFICATIONS...' : 'SUBMIT BAT SPECIFICATIONS'}</span>
                  <Send className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Contact Cards + WhatsApp + Socials (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-3.5">
            {/* Embedded Workshop Location Map */}
            <div className="bg-[#111116] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#181821] border-b border-[#24242D]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[10px] font-sport font-black uppercase tracking-widest text-[#D4AF37]">
                    WORKSHOP LOCATION · CHAKLASI, GUJARAT
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=Chaklasi+Gujarat+387315"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-sport font-bold text-[#A1A1AA] hover:text-[#D4AF37] transition-colors"
                >
                  OPEN IN MAPS ↗
                </a>
              </div>
              <div className="w-full h-40 sm:h-44 relative bg-[#09090C]">
                <iframe
                  title="VK Bat House Workshop Location"
                  src="https://maps.google.com/maps?q=Chaklasi,%20Gujarat%20387315&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Card 1: Call Us */}
            <div className="bg-[#111116] border border-[#24242D] rounded-md p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-[#181821] text-[#E31B23] rounded-sm shrink-0 border border-[#2A2A36]">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-0.5 text-left font-sport">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
                  CALL US
                </span>
                <a
                  href="tel:+919274543199"
                  className="text-base sm:text-lg font-black text-white hover:text-[#D4AF37] transition-colors block"
                >
                  +91 9274543199
                </a>
                <span className="text-[10px] sm:text-[11px] text-[#71717A] block">
                  Mon–Sat, 9am–7pm · Closed on Amavasya
                </span>
              </div>
            </div>

            {/* Card 2: Email */}
            <div className="bg-[#111116] border border-[#24242D] rounded-md p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-[#181821] text-[#D4AF37] rounded-sm shrink-0 border border-[#2A2A36]">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-0.5 text-left font-sport">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
                  EMAIL
                </span>
                <a
                  href="mailto:vishwakarmabat@gmail.com"
                  className="text-sm sm:text-base font-bold text-white hover:text-[#D4AF37] transition-colors block break-all"
                >
                  vishwakarmabat@gmail.com
                </a>
                <span className="text-[10px] sm:text-[11px] text-[#71717A] block">
                  Reply within 24 hours
                </span>
              </div>
            </div>

            {/* Card 3: Visit Us */}
            <div className="bg-[#111116] border border-[#24242D] rounded-md p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-[#181821] text-emerald-400 rounded-sm shrink-0 border border-[#2A2A36]">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-0.5 text-left font-sport">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
                  VISIT US
                </span>
                <span className="text-sm sm:text-base font-bold text-white block">
                  VK Bat House, Chaklasi
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#71717A] block">
                  Uttarsanda Bhalej Road, Gujarat 387315
                </span>
              </div>
            </div>

            {/* Green WhatsApp Order CTA */}
            <button
              onClick={handleWhatsAppDirect}
              type="button"
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-sport font-black py-4 px-6 rounded-md uppercase tracking-wider text-sm flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-2"
            >
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
              <span>ORDER ON WHATSAPP</span>
            </button>

            {/* Bottom Social Links */}
            <div className="flex items-center justify-center gap-6 pt-3 text-xs font-sport font-bold tracking-wider text-[#A1A1AA]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
              >
                <svg className="w-4 h-4 text-[#D4AF37] fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>INSTAGRAM</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-[#E31B23] transition-colors"
              >
                <svg className="w-4 h-4 text-[#E31B23] fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YOUTUBE</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
