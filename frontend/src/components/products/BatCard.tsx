import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Send, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { getImageUrl } from '@/utils/image';
import { toast } from 'sonner';
import { CricketBallIcon, CricketBatIcon } from '@/components/common/CricketIcons';

interface BatCardProps {
  product: Product;
}

export const BatCard: React.FC<BatCardProps> = ({ product }) => {
  const { addItem, openDrawer } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
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

  const handleAddToCart = (e: React.MouseEvent) => {
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

    toast.success(`${product.name} added to cart!`);
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      openDrawer();
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isLiked) {
      toast.success(`Saved to wishlist: ${product.name}`);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out the handcrafted ${product.name} from Vishwakarma Bat House!`,
        url: window.location.origin + `/products/${product.slug}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/products/${product.slug}`);
      toast.success('Product link copied to clipboard!');
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
      className="w-full bg-[#0E1017] border border-[#202533] hover:border-[#D4AF37] rounded-xl p-2.5 sm:p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] flex flex-col justify-between text-center space-y-2.5 sm:space-y-3.5 group relative overflow-hidden"
    >
      {/* Background cricket turf/stadium ambient hint on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#00FF87]/[0.02] pointer-events-none" />

      {/* Framed Image Container */}
      <div className="relative w-full aspect-[3/4] bg-[#07090E] border border-[#1A1F2C] rounded-lg overflow-hidden flex items-center justify-center p-2 sm:p-3 select-none">
        {/* Discount Badge */}
        {product.discount_percent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#8B1220] to-[#C9182B] border-y border-dashed border-white/60 text-white text-[9px] sm:text-[10px] font-sport font-black px-2 py-0.5 rounded-xs tracking-wider shadow-md pointer-events-none">
            -{product.discount_percent}%
          </div>
        )}

        {/* Action icons on top right */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 sm:gap-1.5 pointer-events-auto">
          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-[#71717A] hover:text-[#E31B23] transition-colors cursor-pointer border border-[#242A38]"
            aria-label="Wishlist"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
          </button>

          {/* Share icon */}
          <button
            type="button"
            onClick={handleShareClick}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-[#71717A] hover:text-[#D4AF37] transition-colors cursor-pointer border border-[#242A38]"
            aria-label="Share"
          >
            <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </div>

        {/* Bat Visual (Hittersports Style Dual-Image with Zoom) */}
        <Link to={`/products/${product.slug}`} className="absolute inset-0 p-2 sm:p-3 flex items-center justify-center">
          {/* Primary Image: Normal Zoomed Bat Blade View */}
          <img
            src={primaryImage}
            alt={product.name}
            className={`w-full h-full object-contain object-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out scale-105 ${
              hasTwoImages
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

          {/* Secondary Image: Cursor Hover Angle / Full Bat View */}
          {hasTwoImages && secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} - Alternate View`}
              className={`absolute inset-0 w-full h-full object-contain object-center p-2 sm:p-3 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out ${
                showingSecondary
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
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/75 hover:bg-[#D4AF37] text-white hover:text-black border border-white/10 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer"
              aria-label="Previous picture"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSlide((prev) => (prev === 1 || (prev === null && isHovered) ? 0 : 1));
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/75 hover:bg-[#D4AF37] text-white hover:text-black border border-white/10 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer"
              aria-label="Next picture"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Pagination Dots at bottom-left */}
            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveSlide(0);
                }}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  !showingSecondary
                    ? 'w-3 h-1.5 bg-[#D4AF37]'
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
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  showingSecondary
                    ? 'w-3 h-1.5 bg-[#D4AF37]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white'
                }`}
                title="Picture 2: Hover View"
              />
            </div>
          </>
        )}
      </div>

      {/* Info & Price */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-sport uppercase tracking-wider text-[#D4AF37]">
          <CricketBatIcon size={12} className="shrink-0" />
          <span>Handcrafted English Willow</span>
        </div>

        <Link to={`/products/${product.slug}`}>
          <h4 className="text-xs sm:text-base font-serif font-black text-white uppercase tracking-wider hover:text-[#D4AF37] transition-colors line-clamp-1">
            {product.name}
          </h4>
        </Link>

        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-sport font-bold">
          <span className="text-[#D4AF37]">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {product.compare_price && (
            <span className="text-[#71717A] line-through text-[10px] sm:text-xs font-normal">
              ₹{Number(product.compare_price).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Cricket Theme Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full relative overflow-hidden bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] hover:shadow-[0_0_22px_rgba(201,24,43,0.55)] border-y border-dashed border-white/50 text-white font-sport font-black py-2.5 sm:py-3 px-3 rounded-xs text-[10px] sm:text-xs tracking-wider sm:tracking-widest uppercase transition-all duration-300 cursor-pointer shadow-md active:scale-95 bat-swing-shine flex items-center justify-center gap-2 group/btn"
      >
        <CricketBallIcon size={14} className="shrink-0 group-hover/btn:rotate-45 transition-transform duration-300" />
        <span>ADD TO CART</span>
      </button>
    </div>
  );
};
