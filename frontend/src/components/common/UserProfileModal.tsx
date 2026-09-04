import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Shield, 
  LogOut, 
  X, 
  ChevronRight, 
  Sparkles,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on outside click for desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!user) return null;

  // Extract initials
  const initials = (user.full_name || user.email || 'VK')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for Mobile & Desktop click dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm md:bg-black/40"
            aria-hidden="true"
          />

          {/* Modal / Popover Container */}
          <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center md:justify-end md:items-start p-3 sm:p-6 md:pt-20 md:pr-6 lg:pr-16 overflow-y-auto">
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto w-full max-w-[min(calc(100vw-1.5rem),22rem)] bg-[#121218]/95 backdrop-blur-2xl border border-[#D4AF37]/35 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 text-left font-sport relative max-h-[85dvh] overflow-y-auto overscroll-contain"
            >
              {/* Subtle top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#D4AF37]/15 blur-2xl pointer-events-none rounded-full" />

              {/* Header with Avatar & Details */}
              <div className="flex items-start justify-between pb-4 border-b border-[#242436] relative">
                <div className="flex items-center gap-3.5">
                  {/* Circular Avatar with Glowing Gold Border */}
                  <div className="relative shrink-0">
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#09090B] font-serif font-black text-lg flex items-center justify-center shadow-lg shadow-[#D4AF37]/25 ring-2 ring-[#D4AF37]/40">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#121218] border border-[#D4AF37]/50 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    </div>
                  </div>

                  {/* Name, Email & Role Pill */}
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-base tracking-wide truncate max-w-[170px] sm:max-w-[200px]">
                        {user.full_name || 'Cricket Player'}
                      </h3>
                    </div>
                    <p className="text-[#A1A1AA] text-xs font-normal truncate max-w-[180px] sm:max-w-[210px] font-mono mt-0.5">
                      {user.email}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase">
                      {isAdmin ? (
                        <>
                          <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                          MASTER ADMIN
                        </>
                      ) : (
                        <>
                          <Award className="w-2.5 h-2.5 text-[#D4AF37]" />
                          PRO MEMBER
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#1E1E2C] hover:bg-[#2A2A3E] text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors border border-[#2F2F44] cursor-pointer shrink-0"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Action Buttons (Pill / Circular Borders) */}
              <div className="py-3 space-y-2">
                {/* Admin Dashboard Pill (if Admin) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/30 border border-[#D4AF37]/50 text-[#D4AF37] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs tracking-widest uppercase">Admin Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {/* My Profile */}
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-[#181824] hover:bg-[#202030] border border-[#29293D] hover:border-[#D4AF37]/50 text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#232334] text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase">My Profile & Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-white group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Orders History */}
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-[#181824] hover:bg-[#202030] border border-[#29293D] hover:border-[#D4AF37]/50 text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#232334] text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase">Order History & Tracking</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-white group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  onClick={onClose}
                  className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-[#181824] hover:bg-[#202030] border border-[#29293D] hover:border-[#D4AF37]/50 text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#232334] text-[#E31B23] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase">My Wishlist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {wishlistItems.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E31B23] text-white text-[10px] font-bold">
                        {wishlistItems.length}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-[#242436]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs tracking-widest uppercase transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
