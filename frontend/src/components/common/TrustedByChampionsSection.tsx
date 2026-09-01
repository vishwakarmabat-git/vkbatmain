import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { cmsService } from '@/services/cmsService';
import { Testimonial } from '@/types';

export const TrustedByChampionsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    cmsService.getTestimonials().then(setTestimonials).catch(() => {});
  }, []);

  // Database is the single source of truth — no fallback/mock data
  if (testimonials.length === 0) return null;

  return (
    <section className="w-full py-16 bg-[#09090B] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
            TESTIMONIALS
          </span>
          <div className="flex items-baseline justify-center gap-3 flex-wrap">
            <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase">
              Trusted by
            </h2>
            <span className="text-base sm:text-2xl font-serif font-bold text-[#D4AF37]">
              Champions
            </span>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#111116] border border-[#242436] hover:border-[#D4AF37]/50 rounded-xl p-7 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] group"
            >
              {/* Star Rating & Quote */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#D4D4D8] italic leading-relaxed font-sans">
                  "{t.content}"
                </p>
              </div>

              {/* Author Info with Circular Avatar */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-[#E5B539] flex items-center justify-center font-sport font-black text-black text-base shrink-0 shadow-md">
                  {t.name?.charAt(0) || 'V'}
                </div>
                <div className="space-y-0.5">
                  <div className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-[#D4AF37] transition-colors">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] font-sans">
                    {t.role_or_club || 'Customer'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
