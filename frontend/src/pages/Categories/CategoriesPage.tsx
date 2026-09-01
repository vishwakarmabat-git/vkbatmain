import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Award, Layers } from 'lucide-react';
import { categoryService } from '@/services/productService';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getImageUrl } from '@/utils/image';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12">
      {/* Header */}
      <div className="border-b border-[#24242D] pb-6 space-y-2">
        <Badge variant="gold">BLADE ARCHITECTURE MASTERY</Badge>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#F4F4F5] uppercase">
          THE 6 SIGNATURE BLADE ARCHITECTURES
        </h1>
        <p className="text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
          From pure single-cleft classical finesse to dual-hydraulic pressed Triple X2 monster edges, explore the engineering philosophy behind each blade.
        </p>
      </div>

      {/* Categories Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-[#121216] border border-[#24242D] hover:border-[#D4AF37] rounded-md p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sport font-black text-[#D4AF37] tracking-widest uppercase">
                  ARCHITECTURAL EDITION 0{idx + 1}
                </span>
                <Badge variant="gold">FROM ₹{Number(cat.starting_price).toLocaleString('en-IN')}</Badge>
              </div>

              <div className="w-full aspect-[4/3] bg-[#07070A] border border-[#181822] rounded-lg overflow-hidden flex items-center justify-center p-4">
                <img
                  src={getImageUrl(cat.image_url, '/VKCAT.png')}
                  alt={cat.name}
                  className="w-full h-full object-contain object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F4F5]">
                {cat.name}
              </h2>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="pt-6 border-t border-[#24242D] flex items-center justify-between">
              <span className="text-xs font-sport text-[#71717A] uppercase">
                {cat.products_count || 'Bespoke'} Models Available
              </span>
              <Link to={`/products?category=${cat.slug}`}>
                <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  EXPLORE {cat.name.toUpperCase()}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
