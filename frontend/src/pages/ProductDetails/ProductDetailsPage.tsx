import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Shield, ArrowRight, Award, Flame, Check, Truck, RotateCcw, Sparkles } from 'lucide-react';
import { productService } from '@/services/productService';
import { apiClient } from '@/api/client';
import { Product, Review } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { getImageUrl, handleImageError } from '@/utils/image';
import { toast } from 'sonner';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, openDrawer } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      product,
      {
        weight: '1150–1180g',
        handle_shape: 'Round',
        handle_size: 'SH',
        grip_pattern: 'Chevron',
        grip_color: 'Metallic Gold',
        grip_count: 'Single',
        sticker_finish: 'Laser Gold',
        pre_knocking: 'Raw',
        oiling: 'None',
        face_protection: 'None',
        extra_cost: 0,
      },
      1
    );
    toast.success(`${product.name} added to cart!`);
    openDrawer();
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(
      product,
      {
        weight: '1150–1180g',
        handle_shape: 'Round',
        handle_size: 'SH',
        grip_pattern: 'Chevron',
        grip_color: 'Metallic Gold',
        grip_count: 'Single',
        sticker_finish: 'Laser Gold',
        pre_knocking: 'Raw',
        oiling: 'None',
        face_protection: 'None',
        extra_cost: 0,
      },
      1
    );
    navigate('/checkout');
  };

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProductBySlug(slug);
        setProduct(prod);
        const primaryImg = prod.images?.find((img) => img.is_primary) || prod.images?.[0];
        setSelectedImage(primaryImg?.image_url || '');

        // Fetch approved reviews
        const revRes = await apiClient.get<Review[]>(`/reviews/product/${prod.id}`);
        setReviews(revRes.data);
      } catch (e) {
        console.error('Error fetching product details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewName || !reviewTitle || !reviewComment) return;

    setIsSubmittingReview(true);
    try {
      const res = await apiClient.post<Review>('/reviews', {
        product_id: product.id,
        reviewer_name: reviewName,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews([res.data, ...reviews]);
      toast.success('Thank you! Your verified review has been published.');
      setReviewName('');
      setReviewTitle('');
      setReviewComment('');
    } catch (e) {
      toast.error('Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-sport tracking-widest text-[#A1A1AA] uppercase">
          Loading Mastercraft Specifications...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-[#1E1E28] rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white uppercase tracking-wider">
          Product No Longer Available
        </h2>
        <p className="text-sm text-[#A1A1AA] max-w-md mx-auto">
          This product has been permanently removed from our catalog.
          Browse our current collection below.
        </p>
        <Link to="/products">
          <Button variant="gold" size="md">
            BROWSE CATALOG
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-16">
      {/* Breadcrumbs */}
      <div className="text-xs font-sport tracking-wider text-[#71717A] flex items-center gap-2">
        <Link to="/" className="hover:text-white">HOME</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-white">BATS</Link>
        <span>/</span>
        <span className="text-[#D4AF37] uppercase">{product.name}</span>
      </div>

      {/* Top Section: Gallery + Essential Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-3/4 bg-[#07070A] border border-[#1E1E28] rounded-xl overflow-hidden relative shadow-2xl flex items-center justify-center p-6">
            <img
              src={getImageUrl(selectedImage || product.images?.[0]?.image_url, '/VKCAT.png')}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-contain object-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            />
            {product.discount_percent > 0 && (
              <div className="absolute top-4 left-4 bg-[#E31B23] text-white text-xs font-sport font-black px-2.5 py-1 rounded-xs uppercase tracking-wider">
                SAVE {product.discount_percent}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.image_url}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-18 h-22 rounded-sm overflow-hidden border transition-all shrink-0 ${selectedImage === img.image_url
                      ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      : 'border-[#24242D] opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={getImageUrl(img.image_url, '/VKCAT.png')} alt="Thumbnail" onError={handleImageError} className="w-full h-full object-contain p-1 bg-[#09090D]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Specs Overview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="gold">{product.blade_architecture || 'Custom Architecture'}</Badge>
              {product.is_bestseller && <Badge variant="red">BESTSELLER</Badge>}
              <span className="text-xs font-sport text-[#71717A] uppercase">SKU: {product.sku}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#F4F4F5]">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="flex items-center gap-2 pt-1 text-sm font-sport">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-[#F4F4F5]">{product.rating_avg.toFixed(1)}</span>
              <span className="text-[#71717A]">({product.reviews_count} Verified Batsman Reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-[#181821] border border-[#24242D] p-4 rounded-sm flex items-baseline justify-between max-w-md">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-sport font-black text-[#D4AF37]">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.compare_price && (
                <span className="text-sm font-sport text-[#71717A] line-through">
                  ₹{Number(product.compare_price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-xs font-sport text-emerald-400 uppercase tracking-wider">
              All Taxes Included • Free Shipping
            </span>
          </div>

          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            {product.full_description || product.short_description}
          </p>

          {/* Direct Add to Cart & Buy Now Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-md font-sport tracking-wider text-xs">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#D4AF37] hover:bg-[#E5BE4A] text-black font-black py-4 px-6 rounded-xs uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer"
            >
              ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-[#181820] hover:bg-[#24242D] border border-[#3A3A4A] hover:border-[#D4AF37] text-white font-bold py-4 px-6 rounded-xs uppercase tracking-widest text-xs transition-all cursor-pointer"
            >
              BUY NOW
            </button>
          </div>

          {/* Key Advantages Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-sport tracking-wider text-xs">
            <div className="p-3 bg-[#121216] border border-[#24242D] rounded-xs flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>Express Insured Dispatch</span>
            </div>
            <div className="p-3 bg-[#121216] border border-[#24242D] rounded-xs flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>12-Month Handle Warranty</span>
            </div>
            <div className="p-3 bg-[#121216] border border-[#24242D] rounded-xs flex items-center gap-2.5">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>100% Genuine Kashmir Willow</span>
            </div>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS TABLE */}
      <div className="bg-[#121216] border border-[#24242D] rounded-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#24242D]">
          <div>
            <h3 className="font-serif font-black text-2xl text-[#F4F4F5] uppercase">
              TECHNICAL SPECIFICATIONS MATRIX
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Authentic dimensional data calibrated for this blade series.
            </p>
          </div>
          <Badge variant="gold">PRO GRADE</Badge>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sport tracking-wider text-xs">
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">WILLOW GRADING</span>
            <span className="font-bold text-[#F4F4F5] text-sm mt-1 block">{product.willow_grade || 'Grade 1 Kashmir Willow'}</span>
          </div>
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">EDGE THICKNESS</span>
            <span className="font-bold text-[#D4AF37] text-sm mt-1 block">{product.edge_thickness || '40–42mm'}</span>
          </div>
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">SPINE HEIGHT</span>
            <span className="font-bold text-[#F4F4F5] text-sm mt-1 block">{product.spine_height || '65–68mm'}</span>
          </div>
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">PRESSING PROCESS</span>
            <span className="font-bold text-[#F4F4F5] text-sm mt-1 block">{product.pressing_type || 'Precision Hand Pressed'}</span>
          </div>
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">SWEET SPOT POSITION</span>
            <span className="font-bold text-[#F4F4F5] text-sm mt-1 block">{product.sweet_spot || 'Mid Sweet Spot'}</span>
          </div>
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">HANDLE CANE MATRIX</span>
            <span className="font-bold text-[#F4F4F5] text-sm mt-1 block">{product.handle_cane || '12-Piece Multi-Flex Cane'}</span>
          </div>
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">GRAIN COUNT</span>
            <span className="font-bold text-[#F4F4F5] text-sm mt-1 block">{product.grain_count || '8–12 Laser Grains'}</span>
          </div>
          <div className="p-4 bg-[#181821] rounded-xs border border-[#24242D]">
            <span className="text-[#71717A] uppercase block">TOE PROFILE</span>
            <span className="font-bold text-[#F4F4F5] text-sm mt-1 block">{product.toe_profile || 'Square Power Toe'}</span>
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <div className="bg-[#121216] border border-[#24242D] rounded-md p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24242D]">
          <div>
            <h3 className="font-serif font-black text-2xl text-[#F4F4F5] uppercase">
              BATSMAN REVIEWS & PERFORMANCE FEEDBACK
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Real match ratings from club and first-class cricketers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#181821] px-4 py-2 rounded-xs border border-[#24242D]">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-sport font-black text-xl text-[#F4F4F5]">{product.rating_avg.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {/* Review Submission Form */}
        <form onSubmit={handleReviewSubmit} className="bg-[#181821] p-6 rounded-sm space-y-4 border border-[#24242D]">
          <h4 className="text-base font-sport font-bold uppercase text-[#F4F4F5]">
            LEAVE YOUR MATCH PERFORMANCE REVIEW
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="YOUR NAME"
              placeholder="e.g. Siddharth Menon"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport mb-1.5">
                RATING (1 TO 5 STARS)
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full bg-[#121216] border border-[#24242D] text-white p-2.5 text-sm rounded-sm"
              >
                <option value={5}>★★★★★ 5 Stars (Masterpiece)</option>
                <option value={4}>★★★★☆ 4 Stars (Excellent Ping)</option>
                <option value={3}>★★★☆☆ 3 Stars (Good)</option>
                <option value={2}>★★☆☆☆ 2 Stars (Average)</option>
                <option value={1}>★☆☆☆☆ 1 Star</option>
              </select>
            </div>
            <Input
              label="REVIEW TITLE"
              placeholder="e.g. Cracking sound & effortless sixes"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="YOUR REVIEW & PERFORMANCE NOTES"
            placeholder="Describe pickup weight, blade rebound against leather balls, match scores..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            required
          />

          <Button type="submit" variant="gold" size="md" isLoading={isSubmittingReview}>
            SUBMIT VERIFIED REVIEW
          </Button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-[#71717A]">Be the first to review this handcrafted blade.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-4 bg-[#181821] border border-[#24242D] rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-sport font-bold text-sm text-[#F4F4F5] uppercase">{r.reviewer_name}</span>
                    {r.is_verified_purchase && (
                      <span className="text-[10px] text-emerald-400 font-sport bg-emerald-500/10 px-1.5 py-0.5 rounded-xs border border-emerald-500/30">
                        VERIFIED BATSMAN
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <h5 className="font-sport font-bold text-sm text-[#D4AF37]">{r.title}</h5>
                <p className="text-xs text-[#D4D4D8] leading-relaxed">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
