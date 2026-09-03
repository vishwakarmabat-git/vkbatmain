import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, MessageSquare, HelpCircle, Plus, Trash2, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { cmsService } from '@/services/cmsService';
import { CMSBanner, Testimonial, FAQ } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export const AdminCMSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'banners' | 'testimonials' | 'faqs'>('all');
  const [banners, setBanners] = useState<CMSBanner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Testimonial Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [tName, setTName] = useState('');
  const [tRole, setTRole] = useState('');
  const [tBat, setTBat] = useState('VK Limited Edition Triple X2 Hard Pressed');
  const [tContent, setTContent] = useState('');

  // FAQ Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [fQuestion, setFQuestion] = useState('');
  const [fAnswer, setFAnswer] = useState('');
  const [fCat, setFCat] = useState('Craftsmanship');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [b, t, f] = await Promise.all([
        cmsService.getBanners(),
        cmsService.getTestimonials(),
        cmsService.getFAQs(),
      ]);
      setBanners(b || []);
      setTestimonials(t || []);
      setFaqs(f || []);
    } catch (e) {
      console.error('Error loading CMS data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/cms/testimonials', {
        name: tName,
        role_or_club: tRole,
        bat_model: tBat,
        content: tContent,
        rating: 5,
        is_active: true,
      });
      toast.success('Testimonial added successfully');
      setTestModalOpen(false);
      setTName('');
      setTRole('');
      setTContent('');
      fetchData();
    } catch (e) {
      toast.error('Error saving testimonial');
    }
  };

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/cms/faqs', {
        question: fQuestion,
        answer: fAnswer,
        category: fCat,
        is_active: true,
      });
      toast.success('FAQ added successfully');
      setFaqModalOpen(false);
      setFQuestion('');
      setFAnswer('');
      fetchData();
    } catch (e) {
      toast.error('Error saving FAQ');
    }
  };

  const handleDeleteItem = async (endpoint: string, id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this CMS item?')) return;
    try {
      await apiClient.delete(`/cms/${endpoint}/${id}`);
      toast.success('Item deleted successfully');
      fetchData();
    } catch (e) {
      toast.error('Error deleting item');
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="border-b border-[#24242D] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            UNIFIED STOREFRONT CMS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            CMS & Content Management
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 font-sans">
            Manage Homepage Hero Banners, Customer Testimonials, and Frequently Asked Questions in one place.
          </p>
        </div>

        {/* Quick Add Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFaqModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            ADD FAQ
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setTestModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            ADD TESTIMONIAL
          </Button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-[#24242D] pb-3 overflow-x-auto font-sport text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121216] text-[#A1A1AA] hover:text-white border border-[#24242D]'
          }`}
        >
          All CMS Content ({banners.length + testimonials.length + faqs.length})
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 rounded-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'banners'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121216] text-[#A1A1AA] hover:text-white border border-[#24242D]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Homepage Banners ({banners.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 rounded-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'testimonials'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121216] text-[#A1A1AA] hover:text-white border border-[#24242D]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Testimonials ({testimonials.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'faqs'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121216] text-[#A1A1AA] hover:text-white border border-[#24242D]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQs ({faqs.length})</span>
        </button>

        <Link
          to="/admin/why-vk"
          className="px-4 py-2 rounded-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 bg-[#181821] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Edit "Why VK" Showcase ➔</span>
        </Link>
      </div>

      {/* SECTION 1: HOMEPAGE HERO BANNER PREVIEW */}
      {(activeTab === 'all' || activeTab === 'banners') && (
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#24242D] pb-3">
            <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
              HOMEPAGE HERO BANNERS ({banners.length})
            </h3>
            <Badge variant="gold">LIVE IN ROTATION</Badge>
          </div>

          {banners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="p-4 bg-[#181821] rounded-xs border border-[#24242D] space-y-2 relative group">
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-base text-white">{b.title}</span>
                    <span className="text-[10px] font-sport text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xs">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-[#D4AF37] font-sport">{b.subtitle} — {b.tagline}</p>
                  {b.cta_text && (
                    <div className="text-[11px] text-[#A1A1AA] font-sans">
                      CTA: <span className="text-white font-semibold">{b.cta_text}</span> ({b.cta_link || '/products'})
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#71717A] font-sport tracking-wider uppercase">
              No custom banners loaded in database.
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TESTIMONIALS */}
      {(activeTab === 'all' || activeTab === 'testimonials') && (
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#24242D] pb-3">
            <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
              PLAYER TESTIMONIALS & ENDORSEMENTS ({testimonials.length})
            </h3>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setTestModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              ADD TESTIMONIAL
            </Button>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-[#181821] border border-[#24242D] hover:border-[#D4AF37]/40 rounded-xs space-y-3 flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm font-sport uppercase">{t.name}</span>
                      <button
                        onClick={() => handleDeleteItem('testimonials', t.id)}
                        className="text-[#71717A] hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Delete Testimonial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#D4AF37] font-sport">{t.role_or_club || 'Player'}</div>
                    <p className="text-xs text-[#A1A1AA] italic font-sans leading-relaxed">
                      "{t.content}"
                    </p>
                  </div>
                  <div className="text-[10px] text-[#71717A] font-sport uppercase pt-2 border-t border-[#24242D]/50">
                    Model: {t.bat_model || 'Custom Bat'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#71717A] font-sport tracking-wider uppercase">
              No player testimonials added yet. Click "Add Testimonial" to create one.
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: FAQS */}
      {(activeTab === 'all' || activeTab === 'faqs') && (
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#24242D] pb-3">
            <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
              FREQUENTLY ASKED QUESTIONS ({faqs.length})
            </h3>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setFaqModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              ADD FAQ
            </Button>
          </div>

          {faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((f) => (
                <div
                  key={f.id}
                  className="p-4 bg-[#181821] border border-[#24242D] hover:border-[#D4AF37]/40 rounded-xs space-y-1.5 flex items-start justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-sport font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-xs uppercase">
                        {f.category}
                      </span>
                      <div className="font-bold text-white text-sm">{f.question}</div>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed font-sans">{f.answer}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('faqs', f.id)}
                    className="text-[#71717A] hover:text-red-400 p-1 shrink-0 transition-colors cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#71717A] font-sport tracking-wider uppercase">
              No FAQs created yet. Click "Add FAQ" to publish answers.
            </div>
          )}
        </div>
      )}

      {/* Add Testimonial Modal */}
      <Modal isOpen={testModalOpen} onClose={() => setTestModalOpen(false)} title="ADD PLAYER TESTIMONIAL">
        <form onSubmit={handleCreateTestimonial} className="space-y-4">
          <Input
            label="PLAYER / CAPTAIN NAME"
            placeholder="e.g. Jasprit Bumrah"
            value={tName}
            onChange={(e) => setTName(e.target.value)}
            required
          />
          <Input
            label="CRICKET CLUB / LEVEL"
            placeholder="e.g. Ranji Trophy Player, Mumbai"
            value={tRole}
            onChange={(e) => setTRole(e.target.value)}
            required
          />
          <Input
            label="BAT MODEL USED"
            placeholder="e.g. VK Limited Edition Triple X2"
            value={tBat}
            onChange={(e) => setTBat(e.target.value)}
            required
          />
          <Textarea
            label="TESTIMONIAL QUOTE"
            placeholder="Describe ping, match balance, boundary power..."
            value={tContent}
            onChange={(e) => setTContent(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setTestModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="gold" size="sm">
              SAVE TESTIMONIAL
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add FAQ Modal */}
      <Modal isOpen={faqModalOpen} onClose={() => setFaqModalOpen(false)} title="ADD FAQ QUESTION">
        <form onSubmit={handleCreateFAQ} className="space-y-4">
          <Input
            label="QUESTION"
            placeholder="e.g. How should I knock in my bat?"
            value={fQuestion}
            onChange={(e) => setFQuestion(e.target.value)}
            required
          />
          <Input
            label="CATEGORY"
            placeholder="e.g. Craftsmanship / Shipping / Sizing"
            value={fCat}
            onChange={(e) => setFCat(e.target.value)}
            required
          />
          <Textarea
            label="ANSWER"
            placeholder="Detailed advice..."
            value={fAnswer}
            onChange={(e) => setFAnswer(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setFaqModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="gold" size="sm">
              SAVE FAQ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
