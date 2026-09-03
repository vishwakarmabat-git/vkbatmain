import React, { useEffect, useState } from 'react';
import { cmsService, WhyVKSectionData } from '@/services/cmsService';
import { useRealtimeSync, useRealtimeEvent } from '@/hooks/useRealtime';

const DEFAULT_SECTION: WhyVKSectionData = {
  badge: 'WHY VK?',
  title: 'Built\nDifferent.\nPerforms\nDifferent.',
  image_url: '/standing_bat_hero.jpg',
  image_badge: 'PREMIUM GRADE-A WILLOW',
  features: [
    {
      number: '01',
      title: 'ARTISAN HANDCRAFTED',
      description:
        'Shaped manually by third-generation batmakers in Chaklasi. We refine the curvature of every blade to guarantee the perfect aerodynamic pickup and sweep.',
    },
    {
      number: '02',
      title: '5-TON PRESSING',
      description:
        'Pressed under 5-ton setups to compact the willow cells, assuring extreme durability and an explosive ping response straight out of the box.',
    },
    {
      number: '03',
      title: 'OPTIMAL POWER-TO-WEIGHT',
      description:
        'Thick profiles (40mm+ edges, 60mm+ spine) paired with balanced weight distribution, offering massive power without sacrificing hand speed.',
    },
    {
      number: '04',
      title: 'SINGAPORE CANE HANDLES',
      description:
        'Built with premium multi-piece cane handles wrapped in high-tension thread and epoxy to absorb heavy impacts and reduce sting vibrations.',
    },
  ],
};

export const WhyVKSection: React.FC = () => {
  const [data, setData] = useState<WhyVKSectionData>(DEFAULT_SECTION);

  const fetchWhyVK = () => {
    cmsService
      .getWhyVKSection()
      .then((res) => {
        if (res && res.features && res.features.length > 0) {
          setData(res);
        }
      })
      .catch((e) => console.log('Using default Why VK content:', e));
  };

  useEffect(() => {
    fetchWhyVK();
  }, []);

  useRealtimeSync(['vk:realtime:cms', 'vk:realtime:why-vk'], fetchWhyVK);

  useRealtimeEvent<WhyVKSectionData>('WHY_VK_UPDATED', (msg) => {
    if (msg?.data?.features && msg.data.features.length > 0) {
      setData(msg.data);
    } else {
      fetchWhyVK();
    }
  });

  const formattedTitle = data.title.split('\n').map((line, idx) => (
    <React.Fragment key={idx}>
      {line}
      {idx < data.title.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-left border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
        {/* Left Column: Heading + 4 Pillars (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
              {data.badge}
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-[1.05]">
              {formattedTitle}
            </h2>
          </div>

          {/* Feature Items */}
          <div className="space-y-3 sm:space-y-5 pt-1">
            {data.features.map((f) => (
              <div
                key={f.number}
                className="flex items-start gap-3.5 sm:gap-5 pb-3 sm:pb-5 border-b border-[#1E1E28] last:border-0 last:pb-0"
              >
                <span className="font-serif font-black text-xl sm:text-3xl text-[#D4AF37]/50 shrink-0 pt-0.5 select-none">
                  {f.number}
                </span>
                <div className="space-y-0.5 sm:space-y-1">
                  <h3 className="font-sport font-black text-xs sm:text-base text-white tracking-wider uppercase">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-sans font-normal">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Premium Studio Bat Photo (5 cols) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xs sm:max-w-md aspect-4/3 sm:aspect-4/5 rounded-xl sm:rounded-2xl overflow-hidden border border-[#242436] shadow-2xl bg-[#12121A] group">
            <img
              src={data.image_url || '/standing_bat_hero.jpg'}
              alt={data.image_badge || 'Premium Handcrafted Cricket Bat'}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {/* Bottom Dark Pill Badge */}
            {data.image_badge && (
              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 bg-[#09090B]/90 backdrop-blur-md text-white font-sport font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-xs text-[10px] sm:text-[11px] tracking-widest uppercase border border-[#2A2A3A] shadow-xl">
                {data.image_badge}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
