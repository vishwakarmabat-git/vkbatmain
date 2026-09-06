import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { BatCard } from '@/components/products/BatCard';

interface LatestCollectionSectionProps {
  products?: Product[];
}

export const LatestCollectionSection: React.FC<LatestCollectionSectionProps> = ({
  products = [],
}) => {
  // Generate pairs of 2 bats for mobile train loop
  const pairs = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length <= 2) return [products];

    const res: Product[][] = [];
    let curr = 0;
    const visited = new Set<string>();

    for (let k = 0; k < products.length * 2; k++) {
      const first = products[curr % products.length];
      const second = products[(curr + 1) % products.length];
      const key = `${first.id || curr}-${second.id || curr + 1}`;
      if (visited.has(key)) break;
      visited.add(key);
      res.push([first, second]);
      curr = (curr + 2) % products.length;
    }
    return res.length > 0 ? res : [products.slice(0, 2)];
  }, [products]);

  const [activePairIndex, setActivePairIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward (right to left), -1 = backward
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Auto-advance train loop every 3 seconds on mobile
  useEffect(() => {
    if (pairs.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setActivePairIndex((prev) => (prev + 1) % pairs.length);
    }, 3000);

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

  const currentPair = pairs[activePairIndex] || [];

  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-center border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
            LATEST COLLECTION
          </span>
          <h2 className="text-[clamp(1.75rem,4vw+0.5rem,3.75rem)] font-serif font-black tracking-tight text-white uppercase leading-tight break-words">
            New Arrival
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl mx-auto font-sans">
            Hand-selected clefts freshly shaped and balanced for tournament performance.
          </p>
        </div>

        {/* Product Cards Presentation */}
        {products.length > 0 ? (
          <>
            {/* MOBILE VIEW: 2 Bats in row with 3-second auto-cycle transition (Matching Categories) */}
            <div
              className="block sm:hidden relative w-full overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative min-h-[360px] w-full flex items-center justify-center">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={activePairIndex}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        opacity: 0,
                        x: dir > 0 ? 120 : -120,
                      }),
                      center: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          duration: 0.55,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: (dir: number) => ({
                        opacity: 0,
                        x: dir > 0 ? -120 : 120,
                        transition: {
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className={`grid ${currentPair.length === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-2'} gap-2.5 w-full`}
                  >
                    {/* Left Bat Carriage */}
                    {currentPair[0] && (
                      <motion.div
                        initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0 }}
                        className="w-full flex justify-center"
                      >
                        <BatCard product={currentPair[0]} />
                      </motion.div>
                    )}

                    {/* Right Bat Carriage */}
                    {currentPair[1] && (
                      <motion.div
                        initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                        className="w-full flex justify-center"
                      >
                        <BatCard product={currentPair[1]} />
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress Pagination Dots for mobile */}
              {pairs.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-3">
                  {pairs.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDirection(i > activePairIndex ? 1 : -1);
                        setActivePairIndex(i);
                      }}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        i === activePairIndex
                          ? 'w-5 h-1.5 bg-[#D4AF37]'
                          : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* DESKTOP / TABLET VIEW: Multi-Column Showcase */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center w-full">
              {products.slice(0, 4).map((product, idx) => (
                <motion.div
                  key={product.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="w-full flex justify-center"
                >
                  <BatCard product={product} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-10 border border-[#1E1E28] rounded-xl bg-[#0E0E12] max-w-md mx-auto p-6 space-y-3">
            <p className="text-xs font-sport tracking-wider text-[#A1A1AA] uppercase">
              Fresh mastercraft batches arriving daily from our workshop.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
