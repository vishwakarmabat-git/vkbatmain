import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { categoryService } from '@/services/productService';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { DeviceImageUpload } from '@/components/common/DeviceImageUpload';
import { Badge } from '@/components/ui/Badge';
import { getImageUrl } from '@/utils/image';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(14999);
  const [imageUrl, setImageUrl] = useState('/VKCAT.png');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Realtime instant auto-sync without refresh
  useRealtimeSync('vk:realtime:categories', fetchCategories);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDesc('');
    setStartingPrice(14999);
    setImageUrl('/VKCAT.png');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDesc(cat.description || '');
    setStartingPrice(Number(cat.starting_price) || 14999);
    setImageUrl(cat.image_url || '/VKCAT.png');
    setModalOpen(true);
  };

  const openDeleteModal = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        blade_type: name,
        description: desc,
        starting_price: Number(startingPrice),
        image_url: imageUrl || '/VKCAT.png',
        is_active: true,
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload);
        toast.success(`Category "${name}" updated successfully!`);
      } else {
        await categoryService.createCategory(payload);
        toast.success(`Category "${name}" created successfully!`);
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" permanently deleted from catalog`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error deleting category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            BLADE ARCHITECTURAL EDITIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            CRICKET BAT CATEGORIES ({categories.length})
          </h1>
        </div>

        <Button variant="gold" size="md" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          ADD NEW BLADE EDITION
        </Button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#71717A] font-sport uppercase tracking-wider">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-[#71717A] font-sport uppercase tracking-wider">
          No categories found. Click "Add New Blade Edition" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-[#121216] border border-[#24242D] hover:border-[#3A3A4A] p-6 rounded-xl space-y-5 transition-all shadow-md flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Title & Price Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#F4F4F5] uppercase">{c.name}</h3>
                    <span className="text-[11px] font-sport text-[#71717A] uppercase">
                      SLUG: /{c.slug}
                    </span>
                  </div>
                  <Badge variant="gold">FROM ₹{Number(c.starting_price).toLocaleString('en-IN')}</Badge>
                </div>

                {/* Inset Bat Image Preview */}
                <div className="w-full aspect-[16/9] bg-[#07070A] border border-[#181822] rounded-lg overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={getImageUrl(c.image_url, '/VKCAT.png')}
                    alt={c.name}
                    className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                  />
                </div>

                {/* Description */}
                <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-3">
                  {c.description || 'Custom hand-pressed English Willow architectural profile.'}
                </p>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="pt-4 border-t border-[#24242D] flex items-center justify-between gap-3">
                <span className="text-xs font-sport text-[#71717A] uppercase">
                  {c.products_count || 0} Models Active
                </span>

                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="px-3 py-1.5 bg-[#181822] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#2A2A3C] hover:border-[#D4AF37] rounded-md text-xs font-sport font-black tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>EDIT</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => openDeleteModal(c)}
                    className="px-3 py-1.5 bg-[#181822] hover:bg-red-900/40 text-[#71717A] hover:text-red-400 border border-[#2A2A3C] hover:border-red-500/50 rounded-md text-xs font-sport font-black tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? `EDIT BLADE EDITION: ${editingCategory.name}` : 'ADD NEW BLADE EDITION'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-left">
          <Input
            label="EDITION NAME *"
            placeholder="e.g. Quad Blade Mastercraft"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingCategory) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }
            }}
            required
          />

          <Input
            label="URL SLUG *"
            placeholder="quad-blade-mastercraft"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <Input
            label="STARTING PRICE (₹) *"
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
            required
          />

          <DeviceImageUpload
            label="CATEGORY SHOWCASE IMAGE (UPLOAD FROM DEVICE)"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
          />

          <Textarea
            label="ENGINEERING DESCRIPTION & PROFILE"
            placeholder="Describe the blade architecture, pressing, and sweet spot profile..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#24242D]">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
              {editingCategory ? 'UPDATE BLADE EDITION' : 'CREATE BLADE EDITION'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="⚠️ PERMANENTLY DELETE CATEGORY"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-3 bg-red-950/30 border border-red-900/50 rounded-md text-red-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold">Permanently delete "{categoryToDelete?.name}"?</p>
              <p className="text-red-300">
                This action permanently removes this category from the catalog and customer website.
              </p>
              {categoryToDelete && (categoryToDelete as any).products_count > 0 && (
                <p className="text-yellow-300 font-bold">
                  ⚠️ This category contains {(categoryToDelete as any).products_count} product(s).
                  Deleting this category will disassociate these products (they will become uncategorized).
                </p>
              )}
              <p className="text-red-400 font-bold uppercase tracking-wider">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteCategory}
            >
              DELETE PERMANENTLY
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
