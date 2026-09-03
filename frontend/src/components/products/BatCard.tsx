import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Send, ShoppingBag } from 'lucide-react';
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

  return (
    <div className="w-full bg-[#0E1017] border border-[#202533] hover:border-[#D4AF37] rounded-xl p-2.5 sm:p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] flex flex-col justify-between text-center space-y-2.5 sm:space-y-3.5 group relative overflow-hidden">
      {/* Background cricket turf/stadium ambient hint on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#00FF87]/[0.02] pointer-events-none" />

      {/* Framed Image Container */}
      <div className="relative w-full aspect-[3/4] bg-[#07090E] border border-[#1A1F2C] rounded-lg overflow-hidden flex items-center justify-center p-2 sm:p-3">
        {/* Discount Badge */}
        {product.discount_percent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#8B1220] to-[#C9182B] border-y border-dashed border-white/60 text-white text-[9px] sm:text-[10px] font-sport font-black px-2 py-0.5 rounded-xs tracking-wider shadow-md">
            -{product.discount_percent}%
          </div>
        )}

        {/* Action icons on top right */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 sm:gap-1.5">
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

        {/* Bat Visual */}
        <Link to={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={getImageUrl(product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url, '/VKCAT.png')}
            alt={product.name}
            className="w-full h-full object-contain object-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
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
