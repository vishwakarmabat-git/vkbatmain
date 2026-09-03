import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  FileText,
  Truck,
  RotateCcw,
  XCircle,
  CreditCard,
  Cookie,
  Mail,
  Scale,
  Calendar,
  Layers,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { legalService, LegalDocument } from '@/services/legalService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface LegalLayoutProps {
  slug: string;
  defaultTitle: string;
  defaultCategory?: string;
  defaultContent?: string;
}

const ALL_POLICIES = [
  { group: 'CUSTOMER SUPPORT', items: [
    { slug: 'contact-us', label: 'Contact Us', icon: Mail, path: '/contact-us' },
    { slug: 'shipping-policy', label: 'Shipping & Delivery Policy', icon: Truck, path: '/shipping-policy' },
    { slug: 'cancellation-policy', label: 'Cancellation Policy', icon: XCircle, path: '/cancellation-policy' },
    { slug: 'return-refund-policy', label: 'Return & Refund Policy', icon: RotateCcw, path: '/return-refund-policy' },
  ]},
  { group: 'LEGAL & COMPLIANCE', items: [
    { slug: 'privacy-policy', label: 'Privacy Policy', icon: Shield, path: '/privacy-policy' },
    { slug: 'terms-and-conditions', label: 'Terms & Conditions', icon: FileText, path: '/terms-and-conditions' },
    { slug: 'terms-of-sale', label: 'Terms of Sale', icon: Scale, path: '/terms-of-sale' },
    { slug: 'payment-policy', label: 'Payment Policy', icon: CreditCard, path: '/payment-policy' },
    { slug: 'cookie-policy', label: 'Cookie Policy', icon: Cookie, path: '/cookie-policy' },
    { slug: 'grievance-redressal', label: 'Grievance Redressal', icon: Scale, path: '/grievance-redressal' },
  ]},
];

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  slug,
  defaultTitle,
  defaultCategory = 'legal',
  defaultContent,
}) => {
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    legalService
      .getLegalDocument(slug)
      .then(setDoc)
      .catch((err) => {
        console.warn(`[LegalLayout] Using fallback for ${slug}:`, err);
        setDoc({
          id: 'fallback',
          slug,
          title: defaultTitle,
          category: defaultCategory,
          content: defaultContent || `Content for ${defaultTitle} is loading...`,
          version: '1.0',
          effective_date: 'September 2026',
          requires_reconsent: false,
          is_active: true,
          updated_at: new Date().toISOString(),
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  // Convert basic markdown headings and lists into formatted elements
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl sm:text-3xl font-serif font-black text-white uppercase tracking-wider mt-6 mb-4">
            {trimmed.replace('# ', '')}
          </h1>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-sport font-black text-[#D4AF37] uppercase tracking-wider mt-6 mb-2 border-b border-[#242436] pb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#D4AF37] inline-block rounded-xs" />
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-sport font-bold text-white uppercase tracking-wider mt-4 mb-1">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 text-xs sm:text-sm text-[#A1A1AA] list-disc leading-relaxed my-1">
            <span dangerouslySetInnerHTML={{ __html: trimmed.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          </li>
        );
      }
      if (trimmed.startsWith('---')) {
        return <hr key={idx} className="border-[#242436] my-6" />;
      }
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed my-2">
          <span dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-sport tracking-wider text-[#71717A]">
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3 text-[#52525B]" />
          <span className="text-[#A1A1AA] uppercase">
            {doc?.category === 'support' ? 'CUSTOMER SUPPORT' : 'LEGAL & POLICIES'}
          </span>
          <ChevronRight className="w-3 h-3 text-[#52525B]" />
          <span className="text-[#D4AF37] font-bold uppercase">{doc?.title || defaultTitle}</span>
        </div>

        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#12121A] via-[#161622] to-[#0E0E14] border border-[#242436] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold" className="uppercase font-bold tracking-widest text-[10px]">
                  {doc?.category === 'support' ? 'Customer Support Policy' : 'Legal Compliance Document'}
                </Badge>
                <span className="text-[11px] font-sport text-[#71717A] flex items-center gap-1.5 bg-[#1C1C28] px-2.5 py-0.5 rounded-full border border-[#2A2A3C]">
                  <Layers className="w-3 h-3 text-[#D4AF37]" />
                  Version {doc?.version || '1.0'}
                </span>
                <span className="text-[11px] font-sport text-[#71717A] flex items-center gap-1.5 bg-[#1C1C28] px-2.5 py-0.5 rounded-full border border-[#2A2A3C]">
                  <Calendar className="w-3 h-3 text-[#D4AF37]" />
                  Effective: {doc?.effective_date || 'September 2026'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-black text-white uppercase tracking-wider">
                {doc?.title || defaultTitle}
              </h1>
              <p className="text-xs text-[#8E8E93] max-w-2xl font-sans leading-relaxed">
                Official governing guidelines for Vishwakarma Bat House storefront transactions, data protection, and customer rights.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs border-[#2A2A3C] hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT POLICY</span>
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Sidebar + Document Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#12121A] border border-[#242436] rounded-2xl p-5 space-y-6 sticky top-28 shadow-xl">
              <div className="border-b border-[#242436] pb-3">
                <h3 className="text-xs font-sport font-black uppercase tracking-widest text-[#D4AF37]">
                  POLICY DIRECTORY
                </h3>
                <p className="text-[11px] text-[#71717A] font-sans mt-0.5">
                  Navigate all operational & consumer protection policies
                </p>
              </div>

              {ALL_POLICIES.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <span className="text-[10px] font-sport font-black tracking-widest text-[#71717A] uppercase block px-2">
                    {group.group}
                  </span>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || slug === item.slug;
                      return (
                        <Link
                          key={item.slug}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-sport tracking-wider transition-all ${
                            isActive
                              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                              : 'text-[#A1A1AA] hover:bg-[#181824] hover:text-white border border-transparent'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-[#71717A]'}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Grievance Quick Box */}
              <div className="bg-[#161622] border border-[#2A2A3C] rounded-xl p-3.5 space-y-2 text-[11px] font-sans">
                <p className="font-bold text-white uppercase text-[10px] tracking-wider text-[#D4AF37] font-sport">
                  Consumer Grievance Desk
                </p>
                <p className="text-[#8E8E93] leading-relaxed">
                  For formal redressal or consumer disputes, email our compliance desk at{' '}
                  <a href="mailto:grievance@vkbathouse.com" className="text-[#D4AF37] underline">
                    grievance@vkbathouse.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Main Document Body (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-[#12121A] border border-[#242436] rounded-2xl p-6 sm:p-10 shadow-2xl relative font-sans leading-relaxed space-y-4">
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-sport text-[#71717A] tracking-wider uppercase">Loading policy document...</p>
                </div>
              ) : (
                renderFormattedContent(doc?.content || defaultContent || '')
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
