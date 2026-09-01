import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { getImageUrl } from '@/utils/image';

interface CategoriesCollectionSectionProps {
  categories?: Category[];
}

export const CategoriesCollectionSection: React.FC<CategoriesCollectionSectionProps> = ({
  categories = [],
}) => {
  return (
    <section className="w-full py-16 bg-[#09090B] text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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

        {/* Categories Grid or Notice */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 justify-items-center">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="w-full max-w-[280px]"
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block bg-[#0E0E12] border border-[#1E1E28] hover:border-[#D4AF37] rounded-xl p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] text-center space-y-5"
                >
                  {/* Framed Image Container */}
                  <div className="w-full aspect-[3/4] bg-[#07070A] border border-[#181822] rounded-lg overflow-hidden flex items-center justify-center p-3 group-hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={getImageUrl(cat.image_url, '/VKCAT.png')}
                      alt={cat.name}
                      className="w-full h-full object-contain object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  {/* Category Title & CTA */}
                  <div className="space-y-1.5 pb-2">
                    <h3 className="text-lg sm:text-xl font-serif font-black text-white uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="inline-block text-xs font-sport font-black text-[#D4AF37] tracking-[0.15em] uppercase border-b border-transparent group-hover:border-[#D4AF37] transition-all">
                      VIEW COLLECTION
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
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
