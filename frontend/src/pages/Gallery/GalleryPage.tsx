import React, { useEffect, useState } from 'react';
import { cmsService } from '@/services/cmsService';
import { GalleryItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { getImageUrl } from '@/utils/image';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService
      .getGallery()
      .then((data) => {
        setItems(data || []);
      })
      .catch((err) => {
        console.error('Error fetching gallery photos', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Workshop', 'Raw Willow', 'Pressing', 'Finished Bats', 'Match Day'];

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-10">
      {/* Header */}
      <div className="border-b border-[#24242D] pb-6 space-y-2">
        <Badge variant="gold">BEHIND THE CREASE</Badge>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#F4F4F5] uppercase">
          WORKSHOP & MATCH DAY GALLERY
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl">
          Visual documentation of master craftsmen shaping raw willow clefts into tournament-grade weapons.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 font-sport tracking-wider text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xs uppercase font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#D4AF37] text-[#09090B] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                : 'bg-[#121216] text-[#A1A1AA] border border-[#24242D] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-[#121216] border border-[#24242D] hover:border-[#D4AF37]/40 rounded-md overflow-hidden space-y-3 transition-colors shadow-lg"
          >
            <div className="aspect-4/3 overflow-hidden bg-[#09090B] relative">
              <img
                src={getImageUrl(item.image_url, '/workshop_crafting.jpg')}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/workshop_crafting.jpg';
                }}
              />
              <div className="absolute top-3 right-3">
                <Badge variant="gold">{item.category}</Badge>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="font-serif font-bold text-base text-[#F4F4F5]">
                {item.title}
              </h4>
              {item.caption && (
                <p className="text-xs text-[#71717A] leading-relaxed">
                  {item.caption}
                </p>
              )}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-xs text-[#71717A] font-sport tracking-wider uppercase">
            No gallery photos found in this category.
          </div>
        )}
      </div>
    </div>
  );
};
