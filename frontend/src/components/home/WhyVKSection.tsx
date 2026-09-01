import React from 'react';

export const WhyVKSection: React.FC = () => {
  const features = [
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
  ];

  return (
    <section className="w-full py-16 bg-[#09090B] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Heading + 4 Pillars (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
              WHY VK?
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-[1.05]">
              Built <br />
              Different. <br />
              Performs <br />
              Different.
            </h2>
          </div>

          {/* 4 Feature Items */}
          <div className="space-y-6 pt-2">
            {features.map((f) => (
              <div
                key={f.number}
                className="flex items-start gap-5 pb-6 border-b border-[#1E1E28] last:border-0 last:pb-0"
              >
                <span className="font-serif font-black text-2xl sm:text-3xl text-[#D4AF37]/50 shrink-0 pt-0.5 select-none">
                  {f.number}
                </span>
                <div className="space-y-1">
                  <h3 className="font-sport font-black text-sm sm:text-base text-white tracking-wider uppercase">
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
          <div className="relative w-full max-w-md aspect-4/5 rounded-2xl overflow-hidden border border-[#242436] shadow-2xl bg-[#12121A] group">
            <img
              src="/standing_bat_hero.jpg"
              alt="Premium Grade-A Willow Cricket Bat"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {/* Bottom Dark Pill Badge */}
            <div className="absolute bottom-5 left-5 bg-[#09090B]/90 backdrop-blur-md text-white font-sport font-black px-4 py-1.5 rounded-xs text-[11px] tracking-widest uppercase border border-[#2A2A3A] shadow-xl">
              PREMIUM GRADE-A WILLOW
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
