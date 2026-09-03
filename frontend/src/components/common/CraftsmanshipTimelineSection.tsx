import React from 'react';

interface TimelineStep {
  number: string;
  title: string;
  description: string;
}

export const CraftsmanshipTimelineSection: React.FC = () => {
  const steps: TimelineStep[] = [
    {
      number: '01',
      title: 'Willow Selection',
      description:
        'Every bat begins with Expert selecting the finest English and Kashmir Willow clefts, checking for vertical grains and weight density.',
    },
    {
      number: '02',
      title: 'Blade Cleft Prep',
      description:
        'The raw willow block is cut, seasoned, and slowly air-dried to preserve natural cellular moisture, guaranteeing a resilient blade profile.',
    },
    {
      number: '03',
      title: 'Manual Profile Shaping',
      description:
        "Using traditional draw-knives and hand-planes, we carve the spine and edge thicknesses to optimize the bat's natural sweet spot.",
    },
    {
      number: '04',
      title: '5-Ton Fibers Pressing',
      description:
        'We compress the wood under a multi-ton hydraulic roller. This hardens the surface wood cells to deliver maximum ping out of the box.',
    },
    {
      number: '05',
      title: 'Handle Fitting',
      description:
        'A premium Singapore cane handle is bound with elastic rubber layers and glued deep into the cleft to absorb impact vibrations.',
    },
    {
      number: '06',
      title: 'Fine Sanding & Oiling',
      description:
        'The bat is repeatedly hand-sanded with fine grits and treated with raw linseed oil to seal the wood fibers and keep the face clean.',
    },
    {
      number: '07',
      title: 'Quality Audit & Grip',
      description:
        'We run a final check on the exact weight, center of gravity, and pickup before applying the premium chevron grip and decals.',
    },
  ];

  return (
    <section className="w-full py-8 sm:py-12 bg-[#09090B] text-center relative overflow-hidden border-t border-[#181822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
            THE CRAFT
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
            From Willow to
          </h2>
          <div className="text-lg sm:text-xl font-serif font-bold text-[#D4AF37] tracking-wide">
            Championship Weapon
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed pt-1">
            Every single VK bat goes through a meticulous manual process at our Chaklasi workshop before it reaches the pitch.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative pt-3 pb-2 sm:pt-6 sm:pb-4">
          {/* Central Vertical Gold Guide Line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[1.5px] bg-[#D4AF37]/50 hidden md:block" />

          {/* Mobile vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-[1.5px] bg-[#D4AF37]/50 md:hidden" />

          <div className="space-y-3.5 sm:space-y-8 md:space-y-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 1; // 02, 04, 06 on the right

              return (
                <div
                  key={step.number}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Left / Right Card Container (Half Width) */}
                  <div className="w-full md:w-1/2 pl-8 md:pl-0 md:px-8 text-left">
                    <div className="bg-[#12121A] border border-[#242436] hover:border-[#D4AF37]/60 rounded-xl p-3.5 sm:p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.12)] space-y-1 sm:space-y-2 group">
                      <span className="font-serif font-black text-xl sm:text-2xl text-[#D4AF37] block">
                        {step.number}
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-xl text-white group-hover:text-[#D4AF37] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-sans font-normal">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Node Circle */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#D4AF37] bg-[#09090B] shadow-[0_0_10px_rgba(212,175,55,0.8)] z-10 hidden sm:flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
