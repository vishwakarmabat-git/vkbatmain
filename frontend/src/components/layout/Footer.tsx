import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#09090B] border-t border-[#1C1C24] text-[#A1A1AA] pt-14 pb-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Column 1: Brand & Contact Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Vishwakarma Bat House"
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              />
            </Link>

            <p className="text-xs text-[#8E8E93] leading-relaxed max-w-sm font-sans">
              Traditional handcrafting combined with multi-ton compression setups. Handcrafted in Chaklasi, Gujarat. Trusted by league hitters since 2003.
            </p>

            <div className="space-y-2 text-xs font-sport tracking-wider text-[#A1A1AA]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E31B23] shrink-0 mt-0.5" />
                <span className="text-[#A1A1AA]">
                  VK BAT HOUSE, Uttarsanda Bhalej Road, Chaklasi 387315
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                <a
                  href="tel:+919274543199"
                  className="text-white hover:text-[#D4AF37] transition-colors"
                >
                  +91 9274543199
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1 text-[#8E8E93]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xs bg-[#121216] border border-[#24242D] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xs bg-[#121216] border border-[#24242D] hover:text-[#E31B23] hover:border-[#E31B23] transition-all"
                aria-label="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: CUSTOMER SUPPORT (3 cols) */}
          <div className="md:col-span-3 space-y-3 font-sport tracking-wider">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              CUSTOMER SUPPORT
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/contact-us" className="text-[#A1A1AA] hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-[#A1A1AA] hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-[#A1A1AA] hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/return-refund-policy" className="text-[#A1A1AA] hover:text-white transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: LEGAL & COMPLIANCE (4 cols) */}
          <div className="md:col-span-4 space-y-4 font-sport tracking-wider">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              LEGAL & COMPLIANCE
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              <div>
                <Link to="/privacy-policy" className="text-[#A1A1AA] hover:text-white transition-colors block">
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link to="/terms-and-conditions" className="text-[#A1A1AA] hover:text-white transition-colors block">
                  Terms & Conditions
                </Link>
              </div>
              <div>
                <Link to="/terms-of-sale" className="text-[#A1A1AA] hover:text-white transition-colors block">
                  Terms of Sale
                </Link>
              </div>
              <div>
                <Link to="/payment-policy" className="text-[#A1A1AA] hover:text-white transition-colors block">
                  Payment Policy
                </Link>
              </div>
              <div>
                <Link to="/cookie-policy" className="text-[#A1A1AA] hover:text-white transition-colors block">
                  Cookie Policy
                </Link>
              </div>
              <div>
                <Link to="/grievance-redressal" className="text-[#A1A1AA] hover:text-white transition-colors block">
                  Grievance Redressal
                </Link>
              </div>
              <div className="col-span-2 pt-1">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('vk:open_cookie_preferences'))}
                  className="text-xs text-[#D4AF37] hover:text-[#F3E5AB] transition-colors underline cursor-pointer"
                >
                  ⚙ Manage Cookie Preferences
                </button>
              </div>
            </div>

            {/* Amavasya Notice Card */}
            <div className="bg-[#111116] border border-[#24242D] rounded-xs p-3 space-y-1 mt-2">
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>CLOSED ON AMAVASYA</span>
              </div>
              <p className="text-[11px] text-[#71717A] font-sans leading-relaxed">
                Please Note: Our workshop remains completely closed on all Amavasya days.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar (Single line, no agency credit) */}
        <div className="border-t border-[#1C1C24] pt-8 text-center text-xs font-sans text-[#71717A]">
          <p>
            © 2026 Vishwakarma Bat House. All rights reserved. Handcrafted with Samurai-Precision in Gujarat, India.
          </p>
        </div>
      </div>
    </footer>
  );
};
