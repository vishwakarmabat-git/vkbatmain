import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { productService, categoryService } from '@/services/productService';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

import { useRealtimeSync } from '@/hooks/useRealtime';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Read URL query params
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentWillow = searchParams.get('willow') || '';
  const currentPressing = searchParams.get('pressing') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';

  const fetchCategories = () => {
    categoryService.getCategories().then(setCategories).catch(console.error);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        category_slug: currentCategory || undefined,
        search: currentSearch || undefined,
        willow_grade: currentWillow || undefined,
        pressing_type: currentPressing || undefined,
        min_price: currentMinPrice ? Number(currentMinPrice) : undefined,
        max_price: currentMaxPrice ? Number(currentMaxPrice) : undefined,
        sort_by: currentSort,
        limit: 30,
      });
      setProducts(res.items);
      setTotalCount(res.total);
    } catch (e) {
      console.error('Error fetching products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentWillow, currentPressing, currentMinPrice, currentMaxPrice]);

  // Realtime instant updates without refresh
  useRealtimeSync('vk:realtime:products', fetchProducts);
  useRealtimeSync('vk:realtime:categories', fetchCategories);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const willowOptions = ['Grade 1+', 'Grade 1', 'Grade 1 Reserve', 'Grade 1 Limited Edition'];
  const pressingOptions = ['Precision Hand Pressed', 'High Dynamic Pressure', '4-Ton Hydraulic Cold Pressed', 'Master Ultra-Hydraulic Pressed'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
      {/* Header */}
      <div className="border-b border-[#24242D] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            COMPLETE ARTISAN REPERTORY
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#F4F4F5] uppercase mt-1">
            CRICKET BAT CATALOG
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Displaying {totalCount} bespoke Kashmir Willow handcrafted blades.
          </p>
        </div>

        {/* Top Controls: Search Bar & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full xs:w-auto flex-1 sm:flex-initial sm:min-w-[200px] min-w-0">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bats..."
              value={currentSearch}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-xs font-sport tracking-wider text-[#F4F4F5] pl-9 pr-3 py-2 rounded-xs focus:outline-none min-w-0"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full xs:w-auto flex-1 sm:flex-initial sm:min-w-[170px] min-w-0">
            <Select
              value={currentSort}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam('sort', e.target.value)}
              options={[
                { value: 'featured', label: 'Sort: Featured' },
                { value: 'bestseller', label: 'Sort: Bestsellers' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'rating', label: 'Highest Rated' },
              ]}
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="lg:hidden p-2 bg-[#121216] border border-[#24242D] rounded-sm text-[#A1A1AA] cursor-pointer shrink-0"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block space-y-6 font-sport tracking-wider">
          <div className="flex items-center justify-between pb-3 border-b border-[#24242D]">
            <span className="font-bold text-sm text-[#F4F4F5] uppercase flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
              FILTERS
            </span>
            {(currentCategory || currentWillow || currentPressing || currentMinPrice || currentSearch) && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-red-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Blade Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase">BLADE ARCHITECTURE</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left px-3 py-1.5 rounded-xs text-xs transition-colors ${!currentCategory ? 'bg-[#181821] text-[#D4AF37] font-bold' : 'text-[#A1A1AA] hover:text-white'
                  }`}
              >
                All Blade Editions
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-xs text-xs transition-colors flex items-center justify-between ${currentCategory === c.slug
                      ? 'bg-[#181821] text-[#D4AF37] font-bold border-l-2 border-[#D4AF37]'
                      : 'text-[#A1A1AA] hover:text-white'
                    }`}
                >
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Willow Grade Filter */}
          <div className="space-y-2 pt-4 border-t border-[#24242D]">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase">WILLOW GRADE</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('willow', '')}
                className={`w-full text-left px-3 py-1.5 rounded-xs text-xs transition-colors ${!currentWillow ? 'bg-[#181821] text-[#D4AF37] font-bold' : 'text-[#A1A1AA] hover:text-white'
                  }`}
              >
                All Grades
              </button>
              {willowOptions.map((g) => (
                <button
                  key={g}
                  onClick={() => updateParam('willow', g)}
                  className={`w-full text-left px-3 py-1.5 rounded-xs text-xs transition-colors ${currentWillow === g
                      ? 'bg-[#181821] text-[#D4AF37] font-bold border-l-2 border-[#D4AF37]'
                      : 'text-[#A1A1AA] hover:text-white'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2 pt-4 border-t border-[#24242D]">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase">PRICE RANGE (₹)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={currentMinPrice}
                onChange={(e) => updateParam('min_price', e.target.value)}
                className="w-full bg-[#121216] border border-[#24242D] text-xs p-2 text-white rounded-xs"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={currentMaxPrice}
                onChange={(e) => updateParam('max_price', e.target.value)}
                className="w-full bg-[#121216] border border-[#24242D] text-xs p-2 text-white rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* Product Catalog Grid - Fluid Auto-Fit/Auto-Fill */}
        <div className="lg:col-span-3 min-w-0">
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-5 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-[#121216] border border-[#24242D] rounded-md animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#121216] border border-[#24242D] rounded-md p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold text-white">No cricket bats match your criteria</h3>
              <p className="text-xs text-[#A1A1AA]">Try adjusting your search terms or filters.</p>
              <Button variant="outline" size="sm" onClick={resetAllFilters}>
                CLEAR ALL FILTERS
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-5 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
