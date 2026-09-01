import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { CraftsmanshipStorySection } from '@/components/common/CraftsmanshipStorySection';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const CraftsmanshipPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-20">
      {/* 1. Core Heritage & Story Section */}
      <CraftsmanshipStorySection />

      {/* 2. Cleft Selection Standards & Curing Guarantees */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
        <div className="border-b border-[#24242D] pb-6 space-y-2">
          <Badge variant="gold">UNCOMPROMISING STANDARDS</Badge>
          <h3 className="text-3xl sm:text-4xl font-serif font-black text-[#F4F4F5] uppercase">
            WHY PLAYERS CHOOSE VISHWAKARMA
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sport">
          <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-3">
            <div className="w-10 h-10 rounded-sm bg-[#181821] border border-[#2A2A36] flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-wider">
              100% Genuine Willow
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
              Strictly non-bleached, naturally air-seasoned English & Kashmir Willow clefts with authentic straight grains.
            </p>
          </div>

          <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-3">
            <div className="w-10 h-10 rounded-sm bg-[#181821] border border-[#2A2A36] flex items-center justify-center text-[#D4AF37]">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-wider">
              Precision Compression
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
              4-Ton to 5-Ton hydraulic roller pressing solidifies fibers for explosive rebounds while preventing brittle fractures.
            </p>
          </div>

          <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-3">
            <div className="w-10 h-10 rounded-sm bg-[#181821] border border-[#2A2A36] flex items-center justify-center text-[#D4AF37]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-wider">
              Custom Weight Tuning
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
              Every profile is tailored to the player's height, bat speed, and balance preference down to the exact gram.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Bottom Call To Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6">
        <div className="bg-[#121216] border border-[#D4AF37]/40 p-8 sm:p-12 rounded-xl text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white uppercase">
            Ready to Experience Mastercraft Performance?
          </h3>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-lg mx-auto">
            Explore our handcrafted blade series or submit your custom specifications directly to our master craftsmen.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products">
              <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                EXPLORE CRICKET BATS
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                SUBMIT CUSTOM SPECS
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
