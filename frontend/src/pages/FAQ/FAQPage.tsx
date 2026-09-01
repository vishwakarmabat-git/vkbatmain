import React, { useEffect, useState } from 'react';
import { cmsService } from '@/services/cmsService';
import { FAQ } from '@/types';
import { Badge } from '@/components/ui/Badge';

export const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService.getFAQs().then(setFaqs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-10">
      <div className="border-b border-[#24242D] pb-6 space-y-2">
        <Badge variant="gold">FREQUENTLY ASKED QUESTIONS</Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#F4F4F5] uppercase">
          BAT CARE, KNOCKING & SPECIFICATIONS
        </h1>
        <p className="text-xs text-[#A1A1AA]">
          Everything you need to know about our willow grades, knocking in, oiling, and warranty policies.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-[#121216] border border-[#24242D] rounded-md p-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <h3 className="font-serif font-bold text-base text-[#F4F4F5]">
                {faq.question}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed pl-4">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
