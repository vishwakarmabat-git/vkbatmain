import React, { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, Category } from '@/types';
import { BatCard } from '@/components/products/BatCard';

interface ChooseYourWeaponSectionProps {
  products?: Product[];
  categories?: Category[];
}

export const ChooseYourWeaponSection: React.FC<ChooseYourWeaponSectionProps> = ({
  products = [],
  categories = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');

  // Database-driven category pills — no hardcoded fallbacks
  const categoryPills = useMemo(() => {
    const defaultList = [{ slug: 'all', name: 'ALL MODELS' }];
    return [...defaultList, ...categories.map((c) => ({ slug: c.slug, name: c.name.toUpperCase() }))];
  }, [categories]);

  // Filtered and sorted products — database is the single source of truth
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category Filter
    if (selectedCategory !== 'all') {
      const activeCat = categories.find((c) => c.slug === selectedCategory);
      list = list.filter((p) => {
        if (activeCat && p.category_id === activeCat.id) return true;
        if (p.category_name?.toLowerCase() === activeCat?.name?.toLowerCase()) return true;
        if (p.blade_architecture?.toLowerCase().replace(/\s+/g, '-') === selectedCategory) return true;
        if (p.name.toLowerCase().includes(selectedCategory.replace(/-/g, ' '))) return true;
        return false;
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.blade_architecture?.toLowerCase().includes(q) ||
          p.willow_grade?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating_avg || 5) - (a.rating_avg || 5));
    }

    return list;
  }, [products, categories, selectedCategory, searchQuery, sortBy]);

  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-center border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
            OUR COLLECTION
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
            CHOOSE YOUR WEAPON
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl mx-auto font-sans">
            Custom weights, profiles, and handles are shaped manually.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-3 sm:space-y-4">
          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bats by name, grade, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0E0E12] border border-[#1E1E28] focus:border-[#D4AF37] text-white pl-10 pr-4 py-2 sm:py-2.5 rounded-lg text-xs focus:outline-none placeholder:text-[#52525B]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-[#0E0E12] border border-[#1E1E28] focus:border-[#D4AF37] text-white px-3 sm:px-4 py-2 sm:py-2.5 pr-8 rounded-lg text-[11px] sm:text-xs font-sport tracking-wider uppercase focus:outline-none appearance-none cursor-pointer"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-low">Sort by: Price: Low to High</option>
                <option value="price-high">Sort by: Price: High to Low</option>
                <option value="rating">Sort by: Highest Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 pt-1">
            {categoryPills.map((pill) => (
              <button
                key={pill.slug}
                onClick={() => setSelectedCategory(pill.slug)}
                className={`font-sport font-black px-2.5 sm:px-4 py-1 sm:py-2 rounded-xs text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  selectedCategory === pill.slug
                    ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                    : 'bg-[#0E0E12] text-[#A1A1AA] hover:text-white border border-[#1E1E28]'
                }`}
              >
                {pill.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 justify-items-center">
            {filteredProducts.map((product, idx) => (
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
        ) : (
          <div className="py-12 text-center">
            <p className="text-[#71717A] font-sport tracking-wider uppercase text-sm">
              No products match your search criteria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
