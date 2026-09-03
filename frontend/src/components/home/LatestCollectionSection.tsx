import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { BatCard } from '@/components/products/BatCard';

interface LatestCollectionSectionProps {
  products?: Product[];
}

export const LatestCollectionSection: React.FC<LatestCollectionSectionProps> = ({
  products = [],
}) => {
  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-center border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
            LATEST COLLECTION
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
            New Arrival
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl mx-auto font-sans">
            Hand-selected clefts freshly shaped and balanced for tournament performance.
          </p>
        </div>

        {/* Product Cards Grid or Empty Notice */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 justify-items-center">
            {products.map((product, idx) => (
              <motion.div
                key={product.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="w-full flex justify-center"
              >
                <BatCard product={product} />
              </motion.div>
            ))}
          </div>
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
