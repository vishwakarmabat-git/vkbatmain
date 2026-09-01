import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { cmsService } from '@/services/cmsService';
import { CMSBanner } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DeviceImageUpload } from '@/components/common/DeviceImageUpload';
import { getImageUrl, handleImageError } from '@/utils/image';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<CMSBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CMSBanner | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [ctaText, setCtaText] = useState('SHOP COLLECTION');
  const [ctaLink, setCtaLink] = useState('/products');
  const [secondaryCtaText, setSecondaryCtaText] = useState('CONTACT WORKSHOP');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('/contact');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      // Fetch all banners for admin
      const { data } = await apiClient.get<CMSBanner[]>('/cms/admin/banners');
      setBanners(data || []);
    } catch (e) {
      console.error(e);
      // Fallback to active banners if admin endpoint fails
      cmsService.getBanners().then(setBanners).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Realtime instant auto-sync without refresh
  useRealtimeSync('vk:realtime:cms', fetchBanners);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('EST. 2003 · 100% HANDCRAFTED CLEFTS');
    setTagline('');
    setCtaText('SHOP COLLECTION');
    setCtaLink('/products');
    setSecondaryCtaText('CONTACT WORKSHOP');
    setSecondaryCtaLink('/contact');
    setImageUrl('');
    setDisplayOrder((banners.length || 0) + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (banner: CMSBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || 'EST. 2003 · 100% HANDCRAFTED CLEFTS');
    setTagline(banner.tagline || '');
    setCtaText(banner.cta_text || 'SHOP COLLECTION');
    setCtaLink(banner.cta_link || '/products');
    setSecondaryCtaText(banner.secondary_cta_text || 'CONTACT WORKSHOP');
    setSecondaryCtaLink(banner.secondary_cta_link || '/contact');
    setImageUrl(banner.image_url || '');
    setDisplayOrder(banner.display_order || 1);
    setIsActive(banner.is_active);
    setModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a banner title');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        tagline: tagline.trim() || null,
        cta_text: ctaText.trim() || 'SHOP COLLECTION',
        cta_link: ctaLink.trim() || '/products',
        secondary_cta_text: secondaryCtaText.trim() || null,
        secondary_cta_link: secondaryCtaLink.trim() || null,
        image_url: imageUrl.trim() || null,
        display_order: Number(displayOrder) || 1,
        is_active: Boolean(isActive),
        position: 'hero',
      };

      if (editingBanner) {
        await apiClient.put(`/cms/banners/${editingBanner.id}`, payload);
        toast.success('Slide banner updated successfully!');
      } else {
        await apiClient.post('/cms/banners', payload);
        toast.success('New slide banner created successfully!');
      }

      setModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Error saving banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string, bannerTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete slide "${bannerTitle}"?`)) return;
    try {
      await apiClient.delete(`/cms/banners/${id}`);
      toast.success('Slide banner deleted');
      fetchBanners();
    } catch (e) {
      toast.error('Error deleting banner');
    }
  };

  const handleToggleStatus = async (banner: CMSBanner) => {
    try {
      await apiClient.put(`/cms/banners/${banner.id}`, {
        is_active: !banner.is_active,
      });
      toast.success(`Slide banner marked as ${!banner.is_active ? 'Active' : 'Inactive'}`);
      fetchBanners();
    } catch (e) {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24242D] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase tracking-wide">
            Hero Banners Slider
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 font-sans">
            Desktop/mobile sliders, video backdrops, and active actions for the 3-second auto-rotating Homepage Hero.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + ADD SLIDE BANNER
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sport text-xs">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#A1A1AA] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold w-16">ORDER</th>
                <th className="py-3.5 px-4 font-bold min-w-[240px]">BANNER DETAILS</th>
                <th className="py-3.5 px-4 font-bold min-w-[200px]">DESKTOP/MOBILE SOURCE</th>
                <th className="py-3.5 px-4 font-bold">BACKDROP TYPE</th>
                <th className="py-3.5 px-4 font-bold">STATUS</th>
                <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D] text-[#F4F4F5]">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-[#181821]/60 transition-colors">
                  {/* Order */}
                  <td className="py-4 px-4 font-black text-[#D4AF37] text-sm">
                    #{banner.display_order}
                  </td>

                  {/* Banner Details */}
                  <td className="py-4 px-4 space-y-1">
                    <div className="font-serif font-bold text-sm text-white">{banner.title}</div>
                    <div className="text-[11px] text-[#A1A1AA] font-sans">
                      CTA: <span className="text-[#D4AF37] font-semibold">{banner.cta_text || 'Shop'}</span> ({banner.cta_link || '/products'})
                    </div>
                  </td>

                  {/* Source / Preview */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-sm bg-[#09090C] border border-[#24242D] overflow-hidden flex items-center justify-center shrink-0">
                        {banner.image_url ? (
                          <img
                            src={getImageUrl(banner.image_url, '/standing_bat_hero.jpg')}
                            alt={banner.title}
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-[#52525B]" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#71717A] truncate max-w-[150px]">
                        {banner.image_url ? banner.image_url.split('/').pop() : 'No image'}
                      </div>
                    </div>
                  </td>

                  {/* Backdrop Type */}
                  <td className="py-4 px-4 uppercase font-bold text-[#A1A1AA] text-[11px]">
                    STATIC JPG
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className="cursor-pointer"
                    >
                      {banner.is_active ? (
                        <span className="px-2.5 py-1 rounded-xs text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xs text-[10px] font-black uppercase tracking-wider bg-[#24242D] text-[#71717A] hover:text-white transition-all">
                          INACTIVE
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="p-1.5 rounded-sm bg-[#181821] hover:bg-[#24242D] text-[#A1A1AA] hover:text-[#D4AF37] border border-[#24242D] transition-colors cursor-pointer"
                        title="Edit Slide"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id, banner.title)}
                        className="p-1.5 rounded-sm bg-[#181821] hover:bg-red-500/20 text-[#71717A] hover:text-red-400 border border-[#24242D] transition-colors cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {banners.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#71717A] uppercase tracking-wider">
                    No slide banners created yet. Click "+ Add Slide Banner" above to add your first slide.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View (Zero Horizontal Scrolling) */}
      <div className="md:hidden space-y-3 font-sport text-xs">
        {banners.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No slide banners created yet.</div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-20 h-14 rounded-sm bg-[#09090C] border border-[#24242D] overflow-hidden flex items-center justify-center shrink-0">
                  {banner.image_url ? (
                    <img
                      src={getImageUrl(banner.image_url, '/standing_bat_hero.jpg')}
                      alt={banner.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-[#52525B]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-[#D4AF37] text-xs">Slide #{banner.display_order}</span>
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className="cursor-pointer"
                    >
                      {banner.is_active ? (
                        <span className="px-2 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider bg-[#24242D] text-[#71717A]">
                          INACTIVE
                        </span>
                      )}
                    </button>
                  </div>
                  <h4 className="font-serif font-bold text-white text-sm truncate">{banner.title}</h4>
                  <div className="text-[10px] text-[#A1A1AA]">
                    CTA: <span className="text-[#D4AF37]">{banner.cta_text || 'Shop'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#24242D]/60">
                <button
                  onClick={() => openEditModal(banner)}
                  className="px-3 py-1.5 rounded-xs bg-[#181821] text-[#A1A1AA] hover:text-white border border-[#24242D] flex items-center gap-1.5 text-xs font-bold"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>EDIT</span>
                </button>
                <button
                  onClick={() => handleDeleteBanner(banner.id, banner.title)}
                  className="px-3 py-1.5 rounded-xs bg-[#181821] text-red-400 hover:bg-red-500/20 border border-[#24242D] flex items-center gap-1.5 text-xs font-bold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>DELETE</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Slide Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'EDIT HERO SLIDE BANNER' : 'ADD NEW HERO SLIDE BANNER'}
      >
        <form onSubmit={handleSaveBanner} className="space-y-4 text-left font-sport tracking-wider text-xs">
          {/* Title */}
          <Input
            label="MAIN HEADING / TITLE *"
            placeholder="e.g. HANDCRAFTED BATS BUILT FOR CHAMPIONS"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Subtitle / Tag */}
          <Input
            label="TOP BADGE / TAG"
            placeholder="e.g. EST. 2003 · 100% HANDCRAFTED CLEFTS"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          {/* Description */}
          <Textarea
            label="SLIDE DESCRIPTION / SUBTEXT"
            placeholder="e.g. Premium cricket bats designed for power, precision, and performance..."
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            rows={3}
          />

          {/* Device Image Upload */}
          <div className="space-y-1.5">
            <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
              SLIDE BACKGROUND / SHOWCASE IMAGE (DEVICE UPLOAD)
            </label>
            <DeviceImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Upload Banner Showcase Photo"
            />
          </div>

          {/* Primary CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="PRIMARY BUTTON TEXT"
              placeholder="e.g. SHOP COLLECTION"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
            />
            <Input
              label="PRIMARY BUTTON LINK"
              placeholder="e.g. /products"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
            />
          </div>

          {/* Secondary CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SECONDARY BUTTON TEXT"
              placeholder="e.g. CONTACT WORKSHOP"
              value={secondaryCtaText}
              onChange={(e) => setSecondaryCtaText(e.target.value)}
            />
            <Input
              label="SECONDARY BUTTON LINK"
              placeholder="e.g. /contact"
              value={secondaryCtaLink}
              onChange={(e) => setSecondaryCtaLink(e.target.value)}
            />
          </div>

          {/* Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="DISPLAY ORDER (#)"
              type="number"
              min={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
              required
            />
            <div className="pt-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="banner_is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
              />
              <label htmlFor="banner_is_active" className="text-white text-xs font-bold uppercase cursor-pointer">
                Slide is Active
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#24242D]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              isLoading={isSubmitting}
            >
              {editingBanner ? 'UPDATE SLIDE BANNER' : 'SAVE SLIDE BANNER'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
