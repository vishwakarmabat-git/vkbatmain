import React, { useEffect, useState } from 'react';
import { cmsService, WhyVKSectionData } from '@/services/cmsService';
import { useRealtimeSync, useRealtimeEvent } from '@/hooks/useRealtime';
import { CricketBallIcon, CricketBatIcon, CricketStumpsIcon } from '@/components/common/CricketIcons';

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
    <section className="w-full py-10 sm:py-16 bg-[#07090E] text-left border-t border-[#1E2433] relative overflow-hidden">
      {/* Floodlight & Ground Glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.06)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Column: Heading + 4 Pillars (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121622] border border-[#263145] text-[#F5C542] rounded-xs text-[10px] sm:text-xs font-sport tracking-widest font-black uppercase">
              <CricketBallIcon size={14} className="shrink-0" />
              <span>{data.badge}</span>
            </div>
            <h2 className="text-[clamp(1.75rem,4.5vw+0.5rem,3.75rem)] font-serif font-black tracking-tight text-white uppercase leading-[1.08] break-words">
              {formattedTitle}
            </h2>
          </div>

          {/* Feature Items */}
          <div className="space-y-4 sm:space-y-5 pt-2">
            {data.features.map((f) => (
              <div
                key={f.number}
                className="flex items-start gap-4 sm:gap-5 pb-4 sm:pb-5 border-b border-[#1E2433] last:border-0 last:pb-0 group"
              >
                <span className="font-serif font-black text-2xl sm:text-4xl text-[#D4AF37] shrink-0 pt-0.5 select-none transition-transform group-hover:scale-110">
                  {f.number}
                </span>
                <div className="space-y-1">
                  <h3 className="font-sport font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9182B]" />
                    <span>{f.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-sans font-normal">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Studio Bat Photo (5 cols) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xs sm:max-w-md aspect-4/3 sm:aspect-4/5 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#D4AF37]/35 shadow-[0_0_35px_rgba(212,175,55,0.18)] bg-[#0C0E15] group">
            <img
              src={data.image_url || '/standing_bat_hero.jpg'}
              alt={data.image_badge || 'Premium Handcrafted Cricket Bat'}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {/* Bottom Cricket Leather Pill Badge */}
            {data.image_badge && (
              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] text-white font-sport font-black px-3.5 py-1.5 rounded-xs text-[10px] sm:text-[11px] tracking-widest uppercase border-y border-dashed border-white/60 shadow-xl flex items-center gap-2">
                <CricketBallIcon size={12} />
                <span>{data.image_badge}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
