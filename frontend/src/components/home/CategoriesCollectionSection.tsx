import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/image';

interface CategoriesCollectionSectionProps {
  categories?: Category[];
}

export const CategoriesCollectionSection: React.FC<CategoriesCollectionSectionProps> = ({
  categories = [],
}) => {
  // Generate pairs of 2 categories for mobile train loop
  const pairs = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    if (categories.length <= 2) return [categories];

    const res: Category[][] = [];
    let curr = 0;
    const visited = new Set<string>();

    for (let k = 0; k < categories.length * 2; k++) {
      const first = categories[curr % categories.length];
      const second = categories[(curr + 1) % categories.length];
      const key = `${first.id || curr}-${second.id || curr + 1}`;
      if (visited.has(key)) break;
      visited.add(key);
      res.push([first, second]);
      curr = (curr + 2) % categories.length;
    }
    return res.length > 0 ? res : [categories.slice(0, 2)];
  }, [categories]);

  const [activePairIndex, setActivePairIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward (right to left), -1 = backward
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Auto-advance chain train loop every 3.2 seconds on mobile
  useEffect(() => {
    if (pairs.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setActivePairIndex((prev) => (prev + 1) % pairs.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [pairs.length, isPaused]);

  const handleNext = () => {
    setDirection(1);
    setActivePairIndex((prev) => (prev + 1) % pairs.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActivePairIndex((prev) => (prev - 1 + pairs.length) % pairs.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const renderCategoryCard = (cat: Category) => (
    <Link
      to={`/products?category=${cat.slug}`}
      className="group block bg-[#0E0E12] border border-[#1E1E28] hover:border-[#D4AF37] rounded-xl p-2.5 sm:p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] text-center space-y-2 sm:space-y-4 h-full flex flex-col justify-between"
    >
      {/* Framed Image Container */}
      <div className="w-full aspect-[3/4] bg-[#07070A] border border-[#181822] rounded-lg overflow-hidden flex items-center justify-center p-2 sm:p-3 group-hover:scale-[1.02] transition-transform duration-500">
        <img
          src={getImageUrl(cat.image_url, '/VKCAT.png')}
          alt={cat.name}
          onError={handleImageError}
          className="w-full h-full object-contain object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* Category Title & CTA */}
      <div className="space-y-0.5 sm:space-y-1 pb-1">
        <h3 className="text-xs sm:text-lg font-serif font-black text-white uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors line-clamp-1">
          {cat.name}
        </h3>
        <span className="inline-block text-[10px] sm:text-xs font-sport font-black text-[#D4AF37] tracking-[0.15em] uppercase border-b border-transparent group-hover:border-[#D4AF37] transition-all">
          VIEW
        </span>
      </div>
    </Link>
  );

  const currentPair = pairs[activePairIndex] || [];

  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-center border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
            EXPLORE SERIES
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
            Categories Collection
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl mx-auto font-sans">
            Handcrafted options designed for every format. Pick your weapon class.
          </p>
        </div>

        {/* Categories Presentation */}
        {categories.length > 0 ? (
          <>
            {/* 1. MOBILE ONLY VIEW: 2 BOXES CHAIN TRAIN LOOP ANIMATION */}
            <div
              className="sm:hidden relative w-full overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative min-h-[290px] w-full flex items-center justify-center">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={activePairIndex}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        opacity: 0,
                        x: dir > 0 ? 100 : -100,
                      }),
                      center: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: (dir: number) => ({
                        opacity: 0,
                        x: dir > 0 ? -100 : 100,
                        transition: {
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="grid grid-cols-2 gap-3 w-full"
                  >
                    {/* Box 1 (Left train carriage) */}
                    {currentPair[0] && (
                      <motion.div
                        initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0 }}
                        className="w-full"
                      >
                        {renderCategoryCard(currentPair[0])}
                      </motion.div>
                    )}

                    {/* Box 2 (Right train carriage - staggered linked chain) */}
                    {currentPair[1] && (
                      <motion.div
                        initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                        className="w-full"
                      >
                        {renderCategoryCard(currentPair[1])}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 2. DESKTOP / TABLET VIEW: CLEAN RESPONSIVE GRID */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 justify-items-center">
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="w-full"
                >
                  {renderCategoryCard(cat)}
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-10 border border-[#1E1E28] rounded-xl bg-[#0E0E12] max-w-md mx-auto p-6 space-y-3">
            <p className="text-xs font-sport tracking-wider text-[#A1A1AA] uppercase">
              Hand-pressed blade editions available in catalog.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
