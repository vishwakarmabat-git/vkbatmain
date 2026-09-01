import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';

export const WishlistPage: React.FC = () => {
  const { items, removeItem } = useWishlistStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
      <div className="border-b border-[#24242D] pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            SAVED FOR LATER
          </span>
          <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            YOUR WISHLIST ({items.length})
          </h1>
        </div>

        <Link to="/products">
          <Button variant="gold" size="sm">
            EXPLORE BATS
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#121216] border border-[#24242D] rounded-md p-16 text-center space-y-4">
          <Heart className="w-12 h-12 text-[#52525B] mx-auto" />
          <h3 className="font-serif font-bold text-xl text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#A1A1AA]">
            Click the heart icon on any handcrafted blade to save it here for later.
          </p>
          <Link to="/products">
            <Button variant="gold" size="md">
              DISCOVER BATS
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
