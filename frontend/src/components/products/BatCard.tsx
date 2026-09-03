import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Send } from 'lucide-react';
import { Product } from '@/types';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { getImageUrl } from '@/utils/image';
import { toast } from 'sonner';

interface BatCardProps {
  product: Product;
}

export const BatCard: React.FC<BatCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem, openDrawer } = useCartStore();

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
    <div className="w-full bg-[#0E0E12] border border-[#1E1E28] hover:border-[#D4AF37] rounded-xl p-2.5 sm:p-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)] flex flex-col justify-between text-center space-y-2 sm:space-y-3 group">
      {/* Framed Image Container */}
      <div className="relative w-full aspect-[3/4] bg-[#07070A] border border-[#181822] rounded-lg overflow-hidden flex items-center justify-center p-2 sm:p-3">
        {/* Discount Badge */}
        {product.discount_percent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-black/90 border border-[#242436] text-white text-[9px] sm:text-[10px] font-sport font-black px-1.5 py-0.5 rounded-xs tracking-wider">
            -{product.discount_percent}%
          </div>
        )}

        {/* Action icons on top right */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 sm:gap-1.5">
          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-[#71717A] hover:text-[#E31B23] transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
          </button>

          {/* Share icon */}
          <button
            type="button"
            onClick={handleShareClick}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-[#71717A] hover:text-[#D4AF37] transition-colors cursor-pointer"
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
            className="w-full h-full object-contain object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      {/* Info & Price */}
      <div className="space-y-1">
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

      {/* Working Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full bg-[#12121A] hover:bg-[#D4AF37] border border-[#242436] hover:border-[#D4AF37] text-white hover:text-black font-sport font-black py-2 sm:py-2.5 px-2 sm:px-4 rounded-md text-[10px] sm:text-xs tracking-wider sm:tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
      >
        ADD TO CART
      </button>
    </div>
  );
};
