import React from 'react';
import { MapPin } from 'lucide-react';

export const CraftsmanshipStorySection: React.FC = () => {
  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-left border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* Left Column: Workshop Artisan Photo (5 cols) */}
        <div className="lg:col-span-5">
          <div className="relative rounded-xl overflow-hidden border border-[#24242D] shadow-2xl bg-[#121216] aspect-4/5 group max-w-md mx-auto lg:max-w-none">
            <img
              src="/workshop_crafting.jpg"
              alt="Artisan shaping cricket bat in workshop"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {/* Gold Badge at bottom left */}
            <div className="absolute bottom-4 left-4 bg-[#D4AF37] text-black font-sport font-black px-3.5 py-1.5 rounded-xs text-xs tracking-wider uppercase shadow-lg">
              FACTORY DIRECT WORKSHOP
            </div>
          </div>
        </div>

        {/* Right Column: Heritage & Story Content (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
              CRAFTSMANSHIP
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white uppercase leading-[1.05]">
              Our Heritage <br />
              & Story
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-sans">
            <p className="font-semibold text-[#E4E4E7]">
              At Vishwakarma Bat House (VK Bat House), we craft high-quality cricket bats using carefully selected willow, combining traditional craftsmanship with modern performance standards.
            </p>
            <p>
              Each bat goes through rigorous grading and pressing checks to ensure it meets our champion standards. Shaped manually by third-generation master craftsmen in Chaklasi.
            </p>
          </div>

          {/* 3 Step List with Gold Left Borders */}
          <div className="space-y-2.5 sm:space-y-4 pt-1 sm:pt-2 font-sport">
            {/* Step 1 */}
            <div className="border-l-2 border-[#D4AF37] pl-3.5 sm:pl-4 space-y-0.5 sm:space-y-1">
              <h4 className="font-black text-xs sm:text-base text-white uppercase tracking-wider">
                1. SOURCING ELITE CLEFTS
              </h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-normal">
                We select Grade 1+ Kashmir and Kashmir Willow, inspecting for straight grains and moisture levels to assure premium performance.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-2 border-[#D4AF37] pl-3.5 sm:pl-4 space-y-0.5 sm:space-y-1">
              <h4 className="font-black text-xs sm:text-base text-white uppercase tracking-wider">
                2. MANUAL BLADE SHAPING
              </h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-normal">
                Every willow block is shaped by hand using specialized woodcarving tools. The contours are refined until the pickup feels feather-light.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-2 border-[#D4AF37] pl-3.5 sm:pl-4 space-y-0.5 sm:space-y-1">
              <h4 className="font-black text-xs sm:text-base text-white uppercase tracking-wider">
                3. DOUBLE COMPRESSION PRESSING
              </h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-normal">
                We press bats using professional multi-ton machinery, solidifying the willow fibers to deliver tournament-grade ping responses.
              </p>
            </div>
          </div>

          {/* Address Line */}
          <div className="pt-2 sm:pt-4 border-t border-[#24242D] flex items-center gap-2 text-xs font-sport tracking-wider text-[#A1A1AA]">
            <span className="text-sm sm:text-base">📍</span>
            <span>
              <strong className="text-[#F4F4F5] uppercase">Workshop Address:</strong> VK BAT HOUSE, Uttarsanda Bhalej Road, Chaklasi 387315
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
