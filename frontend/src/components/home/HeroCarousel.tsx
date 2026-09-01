import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsService } from '@/services/cmsService';
import { CMSBanner } from '@/types';
import { getImageUrl } from '@/utils/image';
import { useRealtimeSync } from '@/hooks/useRealtime';

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
    <section className="relative w-full min-h-[560px] sm:min-h-[620px] lg:min-h-[660px] flex items-center justify-center overflow-hidden border-b border-[#24242D] bg-[#09090B]">
      {/* Very Soft & Light Warm Golden Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 45% 45%, rgba(212, 175, 55, 0.07) 0%, rgba(180, 130, 20, 0.035) 45%, transparent 75%)',
        }}
      />

      {/* Layer 2: Ultra-Light Warm Blurred Spotlights */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-[#D4AF37]/[0.05] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[320px] bg-[#D4AF37]/[0.03] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id || currentSlide}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className={`grid grid-cols-1 ${
              slide.image_url ? 'lg:grid-cols-12 gap-8 lg:gap-12 items-center' : 'max-w-4xl'
            } text-left`}
          >
            {/* Left Content Column */}
            <div className={slide.image_url ? 'lg:col-span-7 space-y-6' : 'space-y-6'}>
              {/* Badge / Subtitle */}
              {slide.subtitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181820] border border-[#2A2A36] text-[11px] font-sport font-black tracking-[0.18em] text-[#D4AF37] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#E31B23] animate-pulse" />
                  <span>{slide.subtitle}</span>
                </div>
              )}

              {/* Huge Bold Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-white uppercase leading-[1.02]">
                {renderTitle(slide.title)}
              </h1>

              {/* Tagline / Subtext */}
              {slide.tagline && (
                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl font-sans">
                  {slide.tagline}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2 font-sport tracking-widest text-xs">
                {slide.cta_text && (
                  <Link
                    to={slide.cta_link || '/products'}
                    className="bg-[#D4AF37] hover:bg-[#E5BE4A] text-black font-black py-3.5 px-7 rounded-xs uppercase transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                  >
                    {slide.cta_text}
                  </Link>
                )}
                {slide.secondary_cta_text && (
                  <Link
                    to={slide.secondary_cta_link || '/contact'}
                    className="bg-transparent hover:bg-[#181820] border border-[#3A3A4A] text-white font-bold py-3.5 px-7 rounded-xs uppercase transition-all"
                  >
                    {slide.secondary_cta_text}
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
          <div className="flex items-center justify-center gap-2.5 pt-10 sm:pt-14">
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
