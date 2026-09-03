import React, { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, Category } from '@/types';
import { BatCard } from '@/components/products/BatCard';
import { CricketBallIcon, CricketBatIcon, CrossedBatsIcon } from '@/components/common/CricketIcons';

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
    const defaultList = [{ slug: 'all', name: 'ALL WEAPONS' }];
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
    <section className="w-full py-10 sm:py-16 bg-[#07090E] text-center border-t border-[#1A1F2C] relative overflow-hidden">
      {/* Stadium Outfield Ambient Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-[radial-gradient(ellipse_at_top,_rgba(0,255,135,0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Section Header with Crossed Bats */}
        <div className="space-y-3 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121622] border border-[#242E42] text-[#F5C542] text-[10px] sm:text-xs font-sport tracking-widest font-black uppercase">
            <CrossedBatsIcon size={16} />
            <span>AUTHENTIC GUJARAT ARTISAN CLEFT</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
            CHOOSE YOUR WEAPON
          </h2>

          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl mx-auto font-sans">
            Tailored balance points, 40–42mm edges, pressed under hydraulic roller and manually finished in Chaklasi.
          </p>

          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-1" />
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
                placeholder="Search bats by name, willow grade, profile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0E1017] border border-[#202533] focus:border-[#D4AF37] text-white pl-10 pr-4 py-2.5 rounded-lg text-xs focus:outline-none placeholder:text-[#52525B] shadow-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-[#0E1017] border border-[#202533] focus:border-[#D4AF37] text-white px-3.5 py-2.5 pr-8 rounded-lg text-[11px] sm:text-xs font-sport font-bold tracking-wider uppercase focus:outline-none appearance-none cursor-pointer"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-low">Sort by: Price: Low to High</option>
                <option value="price-high">Sort by: Price: High to Low</option>
                <option value="rating">Sort by: Highest Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Cricket Theme Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {categoryPills.map((pill) => {
              const isSelected = selectedCategory === pill.slug;
              return (
                <button
                  key={pill.slug}
                  onClick={() => setSelectedCategory(pill.slug)}
                  className={`font-sport font-black px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xs text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] text-white border-y border-dashed border-white/70 shadow-[0_0_20px_rgba(201,24,43,0.5)] bat-swing-shine'
                      : 'bg-[#0E1017] text-[#A1A1AA] hover:text-white border border-[#202533] hover:border-[#F5C542]/50 hover:bg-[#141824]'
                  }`}
                >
                  {isSelected && <CricketBallIcon size={12} className="shrink-0" />}
                  <span>{pill.name}</span>
                </button>
              );
            })}
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
