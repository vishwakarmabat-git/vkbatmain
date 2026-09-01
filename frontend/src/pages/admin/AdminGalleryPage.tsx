import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, CheckCircle2, Eye, EyeOff, UploadCloud } from 'lucide-react';
import { cmsService } from '@/services/cmsService';
import { GalleryItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DeviceImageUpload } from '@/components/common/DeviceImageUpload';
import { getImageUrl } from '@/utils/image';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [caption, setCaption] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<GalleryItem[]>('/cms/admin/gallery');
      setItems(data || []);
    } catch (e) {
      console.error(e);
      // Fallback
      cmsService.getGallery().then(setItems).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setImageUrl('');
    setCategory('Workshop');
    setCaption('');
    setDisplayOrder((items.length || 0) + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setImageUrl(item.image_url);
    setCategory(item.category || 'Workshop');
    setCaption(item.caption || '');
    setDisplayOrder(item.display_order || 1);
    setIsActive(item.is_active);
    setModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a photo title');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('Please upload an image from your device or provide a photo URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        image_url: imageUrl.trim(),
        category: category.trim() || 'Workshop',
        caption: caption.trim() || null,
        display_order: Number(displayOrder) || 1,
        is_active: Boolean(isActive),
      };

      if (editingItem) {
        await apiClient.put(`/cms/gallery/${editingItem.id}`, payload);
        toast.success('Gallery photo updated successfully!');
      } else {
        await apiClient.post('/cms/gallery', payload);
        toast.success('Gallery photo published successfully!');
      }

      setModalOpen(false);
      fetchGallery();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Error saving gallery photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, photoTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${photoTitle}" from the gallery?`)) return;
    try {
      await apiClient.delete(`/cms/gallery/${id}`);
      toast.success('Gallery photo removed permanently');
      fetchGallery();
    } catch (e) {
      toast.error('Error removing photo');
    }
  };

  const categories = ['All', 'Workshop', 'Raw Willow', 'Pressing', 'Finished Bats', 'Match Day'];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((i) => i.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="border-b border-[#24242D] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            VISUAL MEDIA ASSETS & GALLERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            Workshop Gallery ({items.length})
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 font-sans">
            Upload and manage behind-the-scenes craftsmanship photos with device file upload.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + ADD GALLERY PHOTO
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 font-sport tracking-wider text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xs uppercase font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'bg-[#121216] text-[#A1A1AA] border border-[#24242D] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#121216] border border-[#24242D] hover:border-[#D4AF37]/40 rounded-md overflow-hidden flex flex-col justify-between transition-colors group shadow-xl"
          >
            <div>
              <div className="aspect-4/3 bg-[#09090B] relative overflow-hidden">
                <img
                  src={getImageUrl(item.image_url, '/workshop_crafting.jpg')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/workshop_crafting.jpg';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="gold">{item.category}</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  {item.is_active ? (
                    <span className="px-2 py-0.5 rounded-xs text-[9px] font-sport font-black uppercase bg-emerald-500/90 text-white shadow-sm">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-xs text-[9px] font-sport font-black uppercase bg-black/70 text-[#A1A1AA] border border-white/20">
                      HIDDEN
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-1">
                <h4 className="font-serif font-bold text-white text-base">{item.title}</h4>
                {item.caption && (
                  <p className="text-xs text-[#A1A1AA] font-sans line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t border-[#24242D]/60 mt-3 pt-3">
              <span className="text-[11px] font-sport text-[#71717A]">
                Order: <strong className="text-white">#{item.display_order || 1}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-sm bg-[#181821] hover:bg-[#24242D] text-[#A1A1AA] hover:text-[#D4AF37] border border-[#24242D] transition-colors cursor-pointer"
                  title="Edit Photo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 rounded-sm bg-[#181821] hover:bg-red-500/20 text-[#71717A] hover:text-red-400 border border-[#24242D] transition-colors cursor-pointer"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-xs text-[#71717A] font-sport tracking-wider uppercase">
            No gallery photos found in this category. Click "+ Add Gallery Photo" above to upload one.
          </div>
        )}
      </div>

      {/* Add / Edit Gallery Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'EDIT GALLERY PHOTO' : 'ADD GALLERY PHOTO'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-left font-sport tracking-wider text-xs">
          {/* Photo Title */}
          <Input
            label="PHOTO TITLE *"
            placeholder="e.g. Master Cleft Planing"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
              GALLERY CATEGORY *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#181820] border border-[#2A2A36] focus:border-[#D4AF37] text-white p-3 rounded-xs text-xs focus:outline-none cursor-pointer"
            >
              <option value="Workshop">Workshop</option>
              <option value="Raw Willow">Raw Willow</option>
              <option value="Pressing">Pressing</option>
              <option value="Finished Bats">Finished Bats</option>
              <option value="Match Day">Match Day</option>
            </select>
          </div>

          {/* Device Image Upload */}
          <div className="space-y-1.5">
            <label className="block text-[#A1A1AA] uppercase font-bold text-[11px]">
              GALLERY IMAGE (UPLOAD FROM DEVICE) *
            </label>
            <DeviceImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Select Photo From Computer / Phone"
            />
          </div>

          {/* Caption */}
          <Textarea
            label="CAPTION / DESCRIPTION"
            placeholder="Brief story behind this photo..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />

          {/* Display Order & Active */}
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
                id="gallery_is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
              />
              <label htmlFor="gallery_is_active" className="text-white text-xs font-bold uppercase cursor-pointer">
                Visible on Storefront
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
              {editingItem ? 'UPDATE PHOTO' : 'PUBLISH PHOTO'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
