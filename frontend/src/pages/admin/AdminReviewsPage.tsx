import React, { useEffect, useState } from 'react';
import { Star, Check, X, Eye, Trash2 } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews();
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Realtime instant updates for batsman reviews
  useRealtimeSync('vk:realtime:reviews', fetchReviews);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await adminService.updateReviewStatus(id, { status: newStatus });
      toast.success(`Review ${newStatus}`);
      fetchReviews();
    } catch (e) {
      toast.error('Error updating review');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-[#24242D] pb-4">
        <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
          BATSMAN FEEDBACK & MODERATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
          PRODUCT REVIEWS ({reviews.length})
        </h1>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">PRODUCT</th>
                <th className="py-3 px-4 font-semibold">BATSMAN</th>
                <th className="py-3 px-4 font-semibold">RATING</th>
                <th className="py-3 px-4 font-semibold">REVIEW CONTENT</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">MODERATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#71717A]">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#71717A]">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#181821]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">{r.product_name}</td>
                    <td className="py-3.5 px-4 text-[#D4AF37]">{r.reviewer_name}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-white">{r.title}</div>
                      <div className="text-[11px] text-[#A1A1AA] line-clamp-2">{r.comment}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.status === 'approved' ? 'success' : 'red'}>
                        {r.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(r.id, 'approved')}
                            className="text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20"
                          >
                            APPROVE
                          </Button>
                        )}
                        {r.status !== 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(r.id, 'rejected')}
                            className="text-red-400 border-red-500/40 hover:bg-red-500/20"
                          >
                            REJECT
                          </Button>
                        )}
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
          <div className="py-8 text-center text-[#71717A]">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No reviews found.</div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{r.product_name}</h4>
                  <div className="text-[11px] text-[#D4AF37]">By {r.reviewer_name}</div>
                </div>
                <Badge variant={r.status === 'approved' ? 'success' : 'red'}>
                  {r.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white">{r.title}</div>
                <div className="text-[11px] text-[#A1A1AA] leading-relaxed">{r.comment}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#24242D]/60">
                {r.status !== 'approved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(r.id, 'approved')}
                    className="text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20 text-xs py-1.5 px-3"
                  >
                    APPROVE
                  </Button>
                )}
                {r.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(r.id, 'rejected')}
                    className="text-red-400 border-red-500/40 hover:bg-red-500/20 text-xs py-1.5 px-3"
                  >
                    REJECT
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
