import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Image as ImageIcon } from 'lucide-react';
import { productService, categoryService } from '@/services/productService';
import { Category, Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { DeviceImageUpload } from '@/components/common/DeviceImageUpload';
import { toast } from 'sonner';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [bladeArchitecture, setBladeArchitecture] = useState('Single Blade');
  const [willowGrade, setWillowGrade] = useState('Grade 1+ English Willow');
  const [pressingType, setPressingType] = useState('Precision Hand Pressed');
  const [edgeThickness, setEdgeThickness] = useState('40–42mm');
  const [spineHeight, setSpineHeight] = useState('65–67mm');
  const [sweetSpot, setSweetSpot] = useState('Mid Sweet Spot');
  const [handleCane, setHandleCane] = useState('12-Piece Multi-Flex Cane');
  const [grainCount, setGrainCount] = useState('8–12 Laser Straight Grains');
  const [toeProfile, setToeProfile] = useState('Square Power Toe');
  const [price, setPrice] = useState<number | string>(19999);
  const [comparePrice, setComparePrice] = useState<number | string>(24999);
  const [stockQuantity, setStockQuantity] = useState<number | string>(10);
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    });

    if (isEditMode && id) {
      setLoading(true);
      productService
        .getProductById(id)
        .then((p) => {
          setName(p.name);
          setSlug(p.slug);
          setSku(p.sku);
          if (p.category_id) setCategoryId(p.category_id);
          if (p.blade_architecture) setBladeArchitecture(p.blade_architecture);
          if (p.willow_grade) setWillowGrade(p.willow_grade);
          if (p.pressing_type) setPressingType(p.pressing_type);
          if (p.edge_thickness) setEdgeThickness(p.edge_thickness);
          if (p.spine_height) setSpineHeight(p.spine_height);
          if (p.sweet_spot) setSweetSpot(p.sweet_spot);
          if (p.handle_cane) setHandleCane(p.handle_cane);
          if (p.grain_count) setGrainCount(p.grain_count);
          if (p.toe_profile) setToeProfile(p.toe_profile);
          setPrice(p.price);
          setComparePrice(p.compare_price || '');
          setStockQuantity(p.stock_quantity);
          setShortDesc(p.short_description || '');
          setFullDesc(p.full_description || '');
          setImageUrl(p.images?.[0]?.image_url || '');
          setIsFeatured(p.is_featured);
          setIsBestseller(p.is_bestseller);
          setStatus(p.status);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleAutoSlug = (val: string) => {
    setName(val);
    if (!isEditMode) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setSku(`VK-${generatedSlug.slice(0, 10).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
      name,
      slug,
      sku,
      category_id: categoryId || undefined,
      blade_architecture: bladeArchitecture,
      willow_grade: willowGrade,
      pressing_type: pressingType,
      edge_thickness: edgeThickness,
      spine_height: spineHeight,
      sweet_spot: sweetSpot,
      handle_cane: handleCane,
      grain_count: grainCount,
      toe_profile: toeProfile,
      price: Number(price),
      compare_price: comparePrice ? Number(comparePrice) : undefined,
      stock_quantity: Number(stockQuantity),
      short_description: shortDesc,
      full_description: fullDesc,
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      status,
      images: imageUrl
        ? [{ image_url: imageUrl, alt_text: name, display_order: 0, is_primary: true }]
        : undefined,
    };

    try {
      if (isEditMode && id) {
        await productService.updateProduct(id, payload);
        toast.success(`Product ${name} updated successfully!`);
      } else {
        await productService.createProduct(payload);
        toast.success(`Product ${name} created successfully!`);
      }
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-[#24242D] pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2 text-[#71717A] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
              {isEditMode ? 'EDIT PRODUCT' : 'NEW BLADE CREATION'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
              {isEditMode ? `EDIT: ${name}` : 'ADD NEW CRICKET BAT'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase">
            PRIMARY IDENTIFIERS & CATEGORIZATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="BAT MODEL NAME"
              placeholder="e.g. VK Sovereign Single Blade"
              value={name}
              onChange={(e) => handleAutoSlug(e.target.value)}
              required
            />
            <Input
              label="URL SLUG"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <Input
              label="SKU CODE"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport mb-1.5">
                BLADE ARCHITECTURAL CATEGORY
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const selCat = categories.find((c) => c.id === e.target.value);
                  if (selCat) setBladeArchitecture(selCat.name);
                }}
                className="w-full bg-[#121216] border border-[#24242D] text-white p-2.5 text-sm rounded-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <DeviceImageUpload
              label="BAT STUDIO IMAGE (UPLOAD FROM DEVICE)"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
            />
          </div>
        </div>

        {/* Cricket Technical Specs */}
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase">
            CRICKET TECHNICAL SPECIFICATIONS MATRIX
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="WILLOW GRADE"
              value={willowGrade}
              onChange={(e) => setWillowGrade(e.target.value)}
            />
            <Input
              label="PRESSING TYPE"
              value={pressingType}
              onChange={(e) => setPressingType(e.target.value)}
            />
            <Input
              label="EDGE THICKNESS"
              value={edgeThickness}
              onChange={(e) => setEdgeThickness(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="SPINE HEIGHT"
              value={spineHeight}
              onChange={(e) => setSpineHeight(e.target.value)}
            />
            <Input
              label="SWEET SPOT LOCATION"
              value={sweetSpot}
              onChange={(e) => setSweetSpot(e.target.value)}
            />
            <Input
              label="HANDLE CANE MATRIX"
              value={handleCane}
              onChange={(e) => setHandleCane(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GRAIN COUNT"
              value={grainCount}
              onChange={(e) => setGrainCount(e.target.value)}
            />
            <Input
              label="TOE PROFILE"
              value={toeProfile}
              onChange={(e) => setToeProfile(e.target.value)}
            />
          </div>
        </div>

        {/* Pricing, Stock & Descriptions */}
        <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase">
            FINANCIALS, INVENTORY & DESCRIPTIONS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="SALE PRICE (INR ₹)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="COMPARE / MRP PRICE (INR ₹)"
              type="number"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
            />
            <Input
              label="INITIAL STOCK UNITS"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="SHORT DESCRIPTION (CATALOG PREVIEW)"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
          />

          <Textarea
            label="FULL DETAILED DESCRIPTION"
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
          />

          <div className="flex flex-wrap gap-6 pt-2 font-sport text-xs">
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded-xs accent-[#D4AF37]"
              />
              <span>FEATURE ON HOMEPAGE</span>
            </label>

            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 rounded-xs accent-[#E31B23]"
              />
              <span>MARK AS BESTSELLER</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/products">
            <Button variant="outline" size="md">
              CANCEL
            </Button>
          </Link>
          <Button type="submit" variant="gold" size="lg" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
            SAVE CRICKET BAT
          </Button>
        </div>
      </form>
    </div>
  );
};
