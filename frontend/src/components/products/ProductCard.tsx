import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Zap, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/utils/image';
import { toast } from 'sonner';
import { CricketBallIcon, CricketBatIcon } from '@/components/common/CricketIcons';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const isLiked = isInWishlist(product.id);

  // 1. Primary Image (Normal zoomed blade view)
  const primaryImgObj = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const primaryImage = getImageUrl(primaryImgObj?.image_url, '/VKCAT.png');

  // 2. Secondary Image (Hover / angle view like hittersports.in)
  const secondaryImgObj = product.images?.find(
    (img) => !img.is_primary && img.image_url !== primaryImgObj?.image_url
  ) || (product.images && product.images.length > 1 ? product.images[1] : undefined);
  const secondaryImage = secondaryImgObj?.image_url ? getImageUrl(secondaryImgObj.image_url) : null;

  const hasTwoImages = Boolean(secondaryImage && secondaryImage !== primaryImage);

  // Hover & Manual Slide toggle states
  const [isHovered, setIsHovered] = useState(false);
  const [activeSlide, setActiveSlide] = useState<number | null>(null);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    toast.success(`${product.name} added to cart!`, {
      description: 'Standard SH / 1150-1180g configuration',
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isLiked) {
      toast.success(`Saved to wishlist: ${product.name}`);
    }
  };

  // Determine which slide is visually active (for dots and images)
  const showingSecondary = hasTwoImages && (
    activeSlide === 1 || (activeSlide === null && isHovered)
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveSlide(null);
      }}
      className="group relative bg-[#0E1017] border border-[#202533] hover:border-[#D4AF37] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(212,175,55,0.18)] flex flex-col text-left"
    >
      {/* Top badges bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {product.is_bestseller && (
            <Badge variant="cricket" showCricketBall>BESTSELLER</Badge>
          )}
          {product.is_featured && !product.is_bestseller && (
            <Badge variant="willow">FEATURED WEAPON</Badge>
          )}
          {product.discount_percent > 0 && (
            <span className="bg-gradient-to-r from-[#8B1220] to-[#C9182B] text-white text-[10px] font-sport font-black px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-md border-y border-dashed border-white/50">
              SAVE {product.discount_percent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLiked
              ? 'bg-[#E31B23] text-white shadow-[0_0_12px_rgba(227,27,35,0.6)]'
              : 'bg-[#09090B]/85 backdrop-blur-md text-[#A1A1AA] hover:text-[#E31B23] border border-[#242A38]'
            }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Image Container with Zoom & Hover Actions (Hittersports Style) */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-[#07090E] flex items-center justify-center p-4 select-none">
        <Link
          to={`/products/${product.slug}`}
          className="absolute inset-0 p-4 flex items-center justify-center"
        >
          {/* Primary Image: Normal Zoomed Bat Blade View */}
          <img
            src={primaryImage}
            alt={product.name}
            className={`w-full h-full object-contain object-center drop-shadow-[0_12px_25px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out scale-105 ${hasTwoImages
                ? showingSecondary
                  ? 'opacity-0 scale-95 pointer-events-none'
                  : 'opacity-100 scale-105'
                : 'group-hover:scale-115'
              }`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/VKCAT.png';
            }}
          />

          {/* Secondary Image: Cursor Hover Angle / Full Bat View (reveals smoothly on hover) */}
          {hasTwoImages && secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} - View 2`}
              className={`absolute inset-0 w-full h-full object-contain object-center p-4 drop-shadow-[0_12px_25px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out ${showingSecondary
                  ? 'opacity-100 scale-105 pointer-events-auto'
                  : 'opacity-0 scale-95 pointer-events-none'
                }`}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1017] via-transparent to-transparent opacity-80 pointer-events-none" />
        </Link>

        {/* Carousel Arrow Controls (Appear on hover when 2 images exist, like hittersports.in) */}
        {hasTwoImages && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSlide((prev) => (prev === 1 || (prev === null && isHovered) ? 0 : 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/75 hover:bg-[#D4AF37] text-white hover:text-black border border-white/10 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer"
              aria-label="Previous picture"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSlide((prev) => (prev === 1 || (prev === null && isHovered) ? 0 : 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/75 hover:bg-[#D4AF37] text-white hover:text-black border border-white/10 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer"
              aria-label="Next picture"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Dots at bottom-left (like hittersports.in screenshot) */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 pointer-events-auto bg-black/60 backdrop-blur-xs px-2 py-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveSlide(0);
                }}
                className={`transition-all duration-200 rounded-full cursor-pointer ${!showingSecondary
                    ? 'w-3.5 h-1.5 bg-[#D4AF37]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white'
                  }`}
                title="Picture 1: Main View"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveSlide(1);
                }}
                className={`transition-all duration-200 rounded-full cursor-pointer ${showingSecondary
                    ? 'w-3.5 h-1.5 bg-[#D4AF37]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white'
                  }`}
                title="Picture 2: Hover View"
              />
            </div>
          </>
        )}

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#09090B]/50 backdrop-blur-[2px] pointer-events-none">
            <Button
              variant="crease"
              size="sm"
              className="pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              QUICK VIEW
            </Button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Blade Architecture / Category */}
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] font-sport font-semibold tracking-wider uppercase mb-1">
            <span className="text-[#D4AF37] flex items-center gap-1">
              <CricketBatIcon size={12} />
              <span>{product.blade_architecture || product.category_name || 'Kashmir Willow'}</span>
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{product.rating_avg.toFixed(1)}</span>
              <span className="text-[#52525B]">({product.reviews_count})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug}`} className="block">
            <h4 className="font-serif font-black text-lg text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 uppercase tracking-wide">
              {product.name}
            </h4>
          </Link>

          {/* Key Cricket Specs Pill */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-sport tracking-wider text-[#A1A1AA]">
            {product.edge_thickness && (
              <span className="px-2 py-0.5 bg-[#141824] border border-[#242A38] rounded-xs text-[#E4E4E7]">
                ⚡ {product.edge_thickness} Edges
              </span>
            )}
            {product.willow_grade && (
              <span className="px-2 py-0.5 bg-[#141824] border border-[#242A38] rounded-xs text-[#F5C542]">
                🛡️ {product.willow_grade.split(' ')[0]} {product.willow_grade.split(' ')[1] || ''}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Cricket Theme CTA Button - Fluid wrapping for extreme zoom & narrow containers */}
        <div className="pt-3 border-t border-[#202533] flex flex-wrap items-end justify-between gap-2.5">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-sport font-black text-[#F4F4F5] tracking-tight">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="text-xs font-sport text-[#71717A] line-through">
                  ₹{Number(product.compare_price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] font-sport text-[#D4AF37] uppercase tracking-wider font-bold truncate">
              Bespoke Artisan Craft
            </span>
          </div>

          <div className="flex items-center gap-2 w-full xs:w-auto">
            <button
              onClick={handleQuickAdd}
              className="w-full xs:w-auto relative overflow-hidden bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] hover:shadow-[0_0_22px_rgba(201,24,43,0.55)] border-y border-dashed border-white/50 text-white font-sport font-black py-2.5 px-3.5 rounded-xs text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 bat-swing-shine group/btn shrink-0 min-w-0"
            >
              <CricketBallIcon size={13} className="shrink-0 group-hover/btn:rotate-45 transition-transform duration-300" />
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
