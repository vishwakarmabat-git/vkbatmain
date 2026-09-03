import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Zap, Shield } from 'lucide-react';
import { Product } from '@/types';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/utils/image';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const isLiked = isInWishlist(product.id);
  const primaryImage = getImageUrl(
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url,
    '/VKCAT.png'
  );

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

  return (
    <div className="group relative bg-[#121216] border border-[#24242D] hover:border-[#D4AF37]/60 rounded-md overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] flex flex-col text-left">
      {/* Top badges bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {product.is_bestseller && <Badge variant="red">BESTSELLER</Badge>}
          {product.is_featured && !product.is_bestseller && <Badge variant="gold">FEATURED</Badge>}
          {product.discount_percent > 0 && (
            <span className="bg-[#E31B23] text-white text-[10px] font-sport font-black px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-md">
              SAVE {product.discount_percent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isLiked
              ? 'bg-[#E31B23] text-white shadow-[0_0_10px_rgba(227,27,35,0.5)]'
              : 'bg-[#09090B]/80 backdrop-blur-md text-[#A1A1AA] hover:text-[#E31B23] border border-[#24242D]'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Image Container with Zoom & Hover Actions */}
      <Link to={`/products/${product.slug}`} className="block relative aspect-3/4 overflow-hidden bg-[#07070A] p-4 flex items-center justify-center">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/VKCAT.png';
          }}
        />

        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent opacity-80" />

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#09090B]/40 backdrop-blur-[2px]">
            <Button
              variant="outline"
              size="sm"
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
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Blade Architecture / Category */}
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] font-sport font-semibold tracking-wider uppercase mb-1">
            <span className="text-[#D4AF37]">{product.blade_architecture || product.category_name || 'English Willow'}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{product.rating_avg.toFixed(1)}</span>
              <span className="text-[#52525B]">({product.reviews_count})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug}`} className="block">
            <h4 className="font-serif font-bold text-lg text-[#F4F4F5] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
              {product.name}
            </h4>
          </Link>

          {/* Key Cricket Specs Pill */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-sport tracking-wider text-[#A1A1AA]">
            {product.edge_thickness && (
              <span className="px-2 py-0.5 bg-[#181821] border border-[#24242D] rounded-xs text-[#E4E4E7]">
                ⚡ {product.edge_thickness} Edges
              </span>
            )}
            {product.willow_grade && (
              <span className="px-2 py-0.5 bg-[#181821] border border-[#24242D] rounded-xs text-[#D4AF37]">
                🛡️ {product.willow_grade.split(' ')[0]} {product.willow_grade.split(' ')[1] || ''}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-[#24242D] flex items-center justify-between gap-3">
          <div className="flex flex-col">
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
            <span className="text-[10px] font-sport text-[#D4AF37] uppercase tracking-wider font-semibold">
              Bespoke Artisan Craft
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAdd}
              className="bg-[#D4AF37] hover:bg-[#E5BE4A] text-black font-sport font-black py-2.5 px-4 rounded-xs text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
