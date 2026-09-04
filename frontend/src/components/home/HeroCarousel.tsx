import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsService } from '@/services/cmsService';
import { CMSBanner } from '@/types';
import { getImageUrl } from '@/utils/image';
import { useRealtimeSync } from '@/hooks/useRealtime';
import { CricketBallIcon, CricketBatIcon } from '@/components/common/CricketIcons';

export const HeroCarousel: React.FC = () => {
  const [banners, setBanners] = useState<CMSBanner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchBanners = () => {
    cmsService
      .getBanners()
      .then((res) => {
        if (res && res.length > 0) {
          const sorted = [...res].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          setBanners(sorted);
        }
      })
      .catch((err) => {
        console.error('Error fetching hero banners', err);
      });
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Realtime live banners updates
  useRealtimeSync('vk:realtime:cms', fetchBanners);

  // Auto-switch slides every 3 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return null;
  }

  const slide = banners[currentSlide] || banners[0];

  // Helper to render dynamic title with gold emphasis on last word or respected line breaks
  const renderTitle = (text: string) => {
    if (!text) return null;
    if (text.includes('\n')) {
      const lines = text.split('\n');
      return lines.map((line, i) => (
        <React.Fragment key={i}>
          {i === lines.length - 1 ? <span className="text-[#D4AF37]">{line}</span> : line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    }
    const words = text.trim().split(/\s+/);
    if (words.length <= 1) return <span className="text-white">{text}</span>;
    const firstPart = words.slice(0, -1).join(' ');
    const lastWord = words[words.length - 1];
    return (
      <>
        {firstPart} <span className="text-[#D4AF37]">{lastWord}</span>
      </>
    );
  };

  return (
    <section className="relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] flex items-center justify-center overflow-hidden border-b border-[#1E2433] bg-[#07090E]">
      {/* Stadium Floodlight & Turf Ambient Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,255,135,0.06)_0%,_rgba(212,175,55,0.08)_35%,_transparent_70%)] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id || currentSlide}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left"
          >
            {/* Left Content Area */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              {/* Top Subtitle with Cricket Ball */}
              {slide.subtitle && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141926] border border-[#263145] text-[#F5C542] rounded-xs text-[10px] sm:text-xs font-sport tracking-widest font-black uppercase shadow-sm">
                  <CricketBallIcon size={14} className="shrink-0 animate-spin [animation-duration:8s]" />
                  <span>{slide.subtitle}</span>
                </div>
              )}

              {/* Huge Bold Heading with Fluid Clamp */}
              <h1 className="text-[clamp(1.75rem,5vw+0.5rem,4.5rem)] font-serif font-black tracking-tight text-white uppercase leading-[1.04] break-words">
                {renderTitle(slide.title)}
              </h1>

              {/* Tagline / Subtext */}
              {slide.tagline && (
                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl font-sans">
                  {slide.tagline}
                </p>
              )}

              {/* Buttons with Cricket Theme & Responsive Sizing */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 font-sport tracking-widest text-xs">
                {slide.cta_text && (
                  <Link
                    to={slide.cta_link || '/products'}
                    className="w-full sm:w-auto text-center justify-center relative overflow-hidden bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] hover:shadow-[0_0_30px_rgba(201,24,43,0.6)] border-y border-dashed border-white/60 text-white font-black py-3 sm:py-4 px-5 sm:px-8 rounded-xs uppercase transition-all flex items-center gap-2.5 bat-swing-shine active:scale-95 group/btn"
                  >
                    <CricketBallIcon size={16} className="shrink-0 group-hover/btn:rotate-45 transition-transform duration-300" />
                    <span>{slide.cta_text}</span>
                  </Link>
                )}
                {slide.secondary_cta_text && (
                  <Link
                    to={slide.secondary_cta_link || '/contact'}
                    className="w-full sm:w-auto text-center justify-center bg-[#0E1017]/80 hover:bg-[#07150E] border-2 border-[#E2E8F0]/80 hover:border-[#00FF87] text-white hover:text-[#00FF87] hover:shadow-[0_0_25px_rgba(0,255,135,0.3)] font-black py-2.5 sm:py-3.5 px-5 sm:px-8 rounded-xs uppercase transition-all flex items-center gap-2 bat-swing-shine active:scale-95"
                  >
                    <CricketBatIcon size={16} className="text-[#D4AF37] shrink-0" />
                    <span>{slide.secondary_cta_text}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Visual Image */}
            {slide.image_url && (
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-md aspect-4/3 sm:aspect-16/11 lg:aspect-4/3 rounded-lg overflow-hidden border border-[#242436] shadow-2xl bg-[#12121A]">
                  <img
                    src={getImageUrl(slide.image_url)}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Pagination Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2.5 pt-6 sm:pt-8">
            {banners.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-2.5 h-2.5 bg-[#D4AF37] scale-110 shadow-[0_0_8px_#D4AF37]'
                    : 'w-2 h-2 bg-[#3F3F46] hover:bg-[#71717A]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
