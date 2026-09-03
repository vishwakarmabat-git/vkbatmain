import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, ExternalLink, Star } from 'lucide-react';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';
import { getImageUrl, handleImageError } from '@/utils/image';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ limit: 50, search: search || undefined });
      setProducts(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // Realtime instant auto-sync without refresh
  useRealtimeSync('vk:realtime:products', fetchProducts);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`⚠️ PERMANENTLY DELETE "${name}"?\n\nThis action permanently removes this product from the catalog and customer website.\n\nThis action cannot be undone.`)) return;
    try {
      await productService.deleteProduct(id);
      toast.success(`"${name}" permanently deleted from catalog`);
      fetchProducts();
    } catch (e) {
      toast.error('Error deleting product');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24242D] pb-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            PRODUCT CATALOG MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            CRICKET BATS CATALOG ({products.length})
          </h1>
        </div>

        <Link to="/admin/products/new">
          <Button variant="gold" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            ADD NEW CRICKET BAT
          </Button>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by bat name, SKU, willow..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-xs font-sport tracking-wider text-white pl-9 pr-3 py-2.5 rounded-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">BAT MODEL</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">EDITION</th>
                <th className="py-3 px-4 font-semibold">PRICE</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#71717A]">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#71717A]">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#181821]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-[#09090B] rounded-xs overflow-hidden shrink-0 border border-[#24242D]">
                          <img
                            src={getImageUrl(p.images?.[0]?.image_url, '/VKCAT.png')}
                            alt=""
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-[#A1A1AA]">{p.willow_grade}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#A1A1AA]">{p.sku}</td>
                    <td className="py-3 px-4 text-[#D4AF37]">{p.blade_architecture || p.category_name}</td>
                    <td className="py-3 px-4 font-black text-white text-sm">
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={p.status === 'active' ? 'success' : 'dark'}>
                        {p.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#71717A] hover:text-[#D4AF37]"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-[#71717A] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-[#71717A] hover:text-red-400 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View (Zero Horizontal Scrolling) */}
      <div className="md:hidden space-y-3 font-sport text-xs">
        {loading ? (
          <div className="py-8 text-center text-[#71717A]">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No products found.</div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-16 bg-[#09090B] rounded-xs overflow-hidden shrink-0 border border-[#24242D]">
                  <img
                    src={getImageUrl(p.images?.[0]?.image_url, '/VKCAT.png')}
                    alt=""
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                    <Badge variant={p.status === 'active' ? 'success' : 'dark'}>
                      {p.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#D4AF37]">{p.blade_architecture || p.category_name}</div>
                  <div className="text-[10px] text-[#71717A]">SKU: {p.sku}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#24242D]/60">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-white text-base">
                    ₹{Number(p.price).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/products/${p.slug}`}
                    target="_blank"
                    className="p-2 rounded-xs bg-[#181821] text-[#A1A1AA] hover:text-[#D4AF37] border border-[#24242D]"
                    title="View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="p-2 rounded-xs bg-[#181821] text-[#A1A1AA] hover:text-white border border-[#24242D]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-2 rounded-xs bg-[#181821] text-[#71717A] hover:text-red-400 border border-[#24242D] cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
