import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
} from 'lucide-react';
import { cmsService, WhyVKSectionData, WhyVKFeature } from '@/services/cmsService';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';

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

export const AdminWhyVKPage: React.FC = () => {
  const [formData, setFormData] = useState<WhyVKSectionData>(DEFAULT_SECTION);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWhyVK = () => {
    cmsService
      .getWhyVKSection()
      .then((res) => {
        if (res && res.features && res.features.length > 0) {
          setFormData(res);
        }
      })
      .catch(() => {
        toast.error('Failed to load current section data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWhyVK();
  }, []);

  // Sync with realtime updates across tabs
  useRealtimeSync(['vk:realtime:cms', 'vk:realtime:why-vk'], fetchWhyVK);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await cmsService.uploadMedia(file);
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url }));
        toast.success('Showcase image uploaded successfully!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFeatureChange = (index: number, field: keyof WhyVKFeature, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, features: updated };
    });
  };

  const handleAddFeature = () => {
    const nextNum = String(formData.features.length + 1).padStart(2, '0');
    setFormData((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          number: nextNum,
          title: 'NEW CRAFTSMANSHIP PILLAR',
          description: 'Enter description of this manufacturing or material specification.',
        },
      ],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    if (formData.features.length <= 1) {
      toast.error('At least one pillar must remain.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index),
    }));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all values to original factory defaults?')) {
      setFormData(DEFAULT_SECTION);
      toast.info('Form reset to default values. Click SAVE to publish.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.badge.trim()) {
      toast.error('Title and Badge cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await cmsService.updateWhyVKSection(formData);
      toast.success('Homepage "Why VK" Showcase successfully published!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update section.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-sport text-left">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A1A1AA]">Loading section configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            HOMEPAGE CMS MANAGER
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            "WHY VK?" SECTION EDITOR
          </h1>
          <p className="text-xs text-[#71717A] mt-1 font-sport">
            Edit the headline, craftsmanship pillars, studio bat photography, and promotional badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            RESET DEFAULTS
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {isSaving ? 'PUBLISHING...' : 'SAVE & PUBLISH'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Headline & Badge Card */}
          <div className="bg-[#121216] border border-[#24242D] rounded-xl p-5 space-y-4">
            <h3 className="font-sport font-black text-xs text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              1. SECTION HEADLINE & BADGE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-sport uppercase text-[#A1A1AA] mb-1 font-bold">
                  Section Subtitle / Badge
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. WHY VK?"
                  className="w-full bg-[#181821] border border-[#2A2A36] focus:border-[#D4AF37] rounded-lg text-xs text-white p-2.5 focus:outline-none placeholder:text-[#52525B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sport uppercase text-[#A1A1AA] mb-1 font-bold">
                  Image Overlay Badge
                </label>
                <input
                  type="text"
                  value={formData.image_badge}
                  onChange={(e) => setFormData({ ...formData, image_badge: e.target.value })}
                  placeholder="e.g. PREMIUM GRADE-A WILLOW"
                  className="w-full bg-[#181821] border border-[#2A2A36] focus:border-[#D4AF37] rounded-lg text-xs text-white p-2.5 focus:outline-none placeholder:text-[#52525B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-sport uppercase text-[#A1A1AA] mb-1 font-bold">
                Main Headline (Use Enter/Return for line breaks)
              </label>
              <textarea
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                rows={3}
                placeholder="Built&#10;Different.&#10;Performs&#10;Different."
                className="w-full bg-[#181821] border border-[#2A2A36] focus:border-[#D4AF37] rounded-lg text-xs text-white p-2.5 focus:outline-none placeholder:text-[#52525B] font-mono"
              />
              <span className="text-[10px] text-[#71717A] font-sport">
                Tip: Each new line will be styled on its own line on desktop and mobile.
              </span>
            </div>
          </div>

          {/* Image Upload & Management Card */}
          <div className="bg-[#121216] border border-[#24242D] rounded-xl p-5 space-y-4">
            <h3 className="font-sport font-black text-xs text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              2. STUDIO BAT SHOWCASE IMAGE & UPLOAD
            </h3>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-[#2A2A36] hover:border-[#D4AF37] rounded-xl p-5 text-center transition-all bg-[#181821]/50 space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-[#121216] border border-[#2A2A36] flex items-center justify-center mx-auto text-[#D4AF37]">
                <Upload className={`w-5 h-5 ${isUploading ? 'animate-bounce' : ''}`} />
              </div>

              <div className="space-y-1">
                <p className="font-sport font-bold text-xs text-white">
                  {isUploading ? 'UPLOADING HIGH-RES IMAGE...' : 'Upload New Bat Showcase Image'}
                </p>
                <p className="text-[10px] text-[#71717A] font-sport">
                  Supports JPG, PNG, WebP up to 10MB (recommended 800x1000px portrait)
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-3 h-3" />}
              >
                {isUploading ? 'TRANSMITTING FILE...' : 'SELECT IMAGE FROM COMPUTER'}
              </Button>
            </div>

            {/* Or Manual URL Input */}
            <div>
              <label className="block text-[11px] font-sport uppercase text-[#A1A1AA] mb-1 font-bold">
                Direct Image URL or Path
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="e.g. /standing_bat_hero.jpg or https://..."
                className="w-full bg-[#181821] border border-[#2A2A36] focus:border-[#D4AF37] rounded-lg text-xs text-white p-2.5 focus:outline-none placeholder:text-[#52525B]"
              />
            </div>
          </div>

          {/* Craftsmanship Pillars (Features) Card */}
          <div className="bg-[#121216] border border-[#24242D] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sport font-black text-xs text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                3. CRAFTSMANSHIP PILLARS ({formData.features.length})
              </h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFeature}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                ADD PILLAR
              </Button>
            </div>

            <div className="space-y-4">
              {formData.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-[#181821] border border-[#24242D] rounded-lg p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature.number}
                        onChange={(e) => handleFeatureChange(idx, 'number', e.target.value)}
                        placeholder="01"
                        className="w-12 bg-[#121216] border border-[#2A2A36] focus:border-[#D4AF37] rounded text-center text-xs font-serif font-black text-[#D4AF37] p-1.5 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                        placeholder="Pillar Title (e.g. ARTISAN HANDCRAFTED)"
                        className="w-56 sm:w-80 bg-[#121216] border border-[#2A2A36] focus:border-[#D4AF37] rounded text-xs font-sport font-black text-white p-1.5 focus:outline-none uppercase"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 text-[#52525B] hover:text-red-400 transition-colors rounded hover:bg-[#121216]"
                      title="Delete this pillar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Pillar description explaining manufacturing techniques, willow density, cane handle, etc."
                      className="w-full bg-[#121216] border border-[#2A2A36] focus:border-[#D4AF37] rounded text-xs text-[#D4D4D8] p-2 focus:outline-none placeholder:text-[#52525B] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sport font-bold text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
              HOMEPAGE LIVE PREVIEW
            </span>
            <span className="text-[10px] font-sport text-[#71717A] bg-[#181821] border border-[#24242D] px-2 py-0.5 rounded-full">
              Real-Time Output
            </span>
          </div>

          <div className="bg-[#09090B] border border-[#24242D] rounded-xl p-5 space-y-6 overflow-hidden shadow-2xl">
            {/* Header Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-sport font-black tracking-[0.25em] text-[#D4AF37] uppercase">
                {formData.badge || 'WHY VK?'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white uppercase leading-tight">
                {formData.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < formData.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
            </div>

            {/* Image Preview */}
            <div className="relative w-full aspect-4/5 rounded-xl overflow-hidden border border-[#242436] bg-[#12121A] group">
              <img
                src={formData.image_url || '/standing_bat_hero.jpg'}
                alt="Bat Preview"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = '/standing_bat_hero.jpg';
                }}
              />
              {formData.image_badge && (
                <div className="absolute bottom-3 left-3 bg-[#09090B]/90 backdrop-blur-md text-white font-sport font-black px-3 py-1 rounded-xs text-[9px] tracking-widest uppercase border border-[#2A2A3A]">
                  {formData.image_badge}
                </div>
              )}
            </div>

            {/* Pillars Preview */}
            <div className="space-y-3 pt-1 border-t border-[#181822]">
              {formData.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-[#1E1E28] last:border-0 last:pb-0">
                  <span className="font-serif font-black text-lg text-[#D4AF37]/50 shrink-0 select-none">
                    {f.number}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-sport font-black text-xs text-white tracking-wider uppercase">
                      {f.title}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-2">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
