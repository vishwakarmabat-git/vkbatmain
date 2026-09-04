import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Menu, X, Shield, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/Button';
import { BulkOrderModal } from '@/components/common/BulkOrderModal';
import { AuthModal } from '@/components/common/AuthModal';
import { UserProfileModal } from '@/components/common/UserProfileModal';


export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { getItemCount, openDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const cartCount = getItemCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'BATS', path: '/products' },
    { label: 'GALLERY', path: '/gallery' },
    { label: 'BULK ORDERS', path: '/contact?type=bulk' },
    { label: 'CRAFTING', path: '/craftsmanship' },
    { label: 'CONTACT', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090E]/95 backdrop-blur-md border-b border-[#1E2433] transition-all shadow-[0_4px_25px_rgba(0,0,0,0.6),0_1px_0_rgba(212,175,55,0.18)]">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 sm:h-20 min-w-0">
          {/* 1. Left: Brand Logo */}
          <div className="flex items-center justify-start shrink-0 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
              <img
                src="/logo.png"
                alt="Vishwakarma Bat House"
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xs group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] shrink-0"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-serif font-black text-sm tracking-wider text-white group-hover:text-[#D4AF37] transition-colors leading-tight uppercase truncate">
                  VISHWAKARMA
                </span>
                <span className="text-[9px] font-sport font-extrabold text-[#D4AF37] tracking-widest uppercase leading-tight flex items-center gap-1.5 truncate">
                  <span>BAT HOUSE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9182B] shadow-[0_0_4px_#C9182B] shrink-0" />
                  <span className="text-[#8E97A8]">EST. GUJARAT</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Center: Navigation Links (Fluid space, collapses cleanly on smaller/zoomed viewports) */}
          <nav className="hidden xl:flex items-center justify-center space-x-5 lg:space-x-7 2xl:space-x-8 text-xs lg:text-[13px] font-sport font-black tracking-[0.14em] uppercase min-w-0">
            {navLinks.map((link) => {
              if (link.label === 'BULK ORDERS') {
                return (
                  <button
                    key={link.label}
                    onClick={() => setBulkModalOpen(true)}
                    className="py-2 transition-all duration-200 relative group text-[#E2E8F0] hover:text-[#F5C542] cursor-pointer whitespace-nowrap"
                  >
                    {link.label}
                  </button>
                );
              }

              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : link.path.includes('?')
                  ? location.pathname + location.search === link.path
                  : location.pathname.startsWith(link.path);

              return (
                <NavLink
                  key={link.label}
                  to={link.path}
                  className={`py-2 transition-all duration-200 relative group whitespace-nowrap ${
                    isActive
                      ? 'text-[#F5C542] font-black'
                      : 'text-[#E2E8F0] hover:text-[#F5C542]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5C542] to-transparent shadow-[0_0_8px_#F5C542]" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* 3. Right: Action Icons (Far Right, flex-shrink-0) */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-4 shrink-0">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-[#F4F4F5] hover:text-[#D4AF37] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Small User / Login SVG Icon / Avatar */}
            {isAuthenticated && user ? (
              <>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(true)}
                  className="p-1 text-[#F4F4F5] hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer group"
                  aria-label="User Account"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#09090B] font-bold text-xs flex items-center justify-center ring-2 ring-[#D4AF37]/40 shadow-sm group-hover:scale-105 group-hover:ring-[#D4AF37] transition-all">
                    {(user.full_name || user.email || 'VK').slice(0, 2).toUpperCase()}
                  </div>
                </button>

                <UserProfileModal
                  isOpen={userDropdownOpen}
                  onClose={() => setUserDropdownOpen(false)}
                />
              </>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="p-1.5 text-[#F4F4F5] hover:text-[#D4AF37] transition-colors cursor-pointer"
                aria-label="Sign In"
              >
                <User className="w-5 h-5 stroke-[2]" />
              </button>
            )}

            {/* Favourites / Wishlist Heart Icon with Cricket Ball Badge */}
            <Link
              to="/wishlist"
              className="p-1.5 text-[#F4F4F5] hover:text-[#E31B23] transition-colors relative group"
              aria-label="Favourites"
            >
              <Heart className="w-5 h-5 stroke-[2] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] border border-white/90 text-white text-[9px] font-sport font-black rounded-full flex items-center justify-center leading-none shadow-[0_0_8px_rgba(201,24,43,0.7)]">
                {wishlistItems.length}
              </span>
            </Link>

            {/* Cart Shopping Bag Icon with Cricket Ball Badge */}
            <button
              onClick={openDrawer}
              className="p-1.5 text-[#F4F4F5] hover:text-[#D4AF37] transition-colors relative group cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] border border-white/90 text-white text-[9px] font-sport font-black rounded-full flex items-center justify-center leading-none shadow-[0_0_10px_rgba(201,24,43,0.8)]">
                {cartCount}
              </span>
            </button>

            {/* Mobile / Tablet Menu Toggle (Visible below xl) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-[#A1A1AA] hover:text-white cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#D4AF37]" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="py-3 border-t border-[#24242D] flex items-center gap-2">
            <input
              type="text"
              placeholder="Search cricket bats by model, willow grade, blade edition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-[#F4F4F5] px-4 py-2 text-xs sm:text-sm rounded-sm focus:outline-none min-w-0"
            />
            <Button type="submit" variant="gold" size="sm" className="shrink-0">
              SEARCH
            </Button>
          </form>
        )}
      </div>

      {/* Mobile / Tablet Dropdown Navigation with Extreme Zoom Safety */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0E0E12]/98 backdrop-blur-md border-b border-[#24242D] px-6 py-4 space-y-3 font-sport text-sm font-bold uppercase tracking-wider max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain shadow-2xl">
          {navLinks.map((link) => {
            if (link.label === 'BULK ORDERS') {
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setBulkModalOpen(true);
                  }}
                  className="block w-full text-left py-2 text-[#E4E4E7] hover:text-[#D4AF37] cursor-pointer"
                >
                  {link.label}
                </button>
              );
            }

            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#E4E4E7] hover:text-[#D4AF37]"
              >
                {link.label}
              </Link>
            );
          })}
          {!isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="block w-full text-left py-2 text-[#D4AF37] font-bold uppercase cursor-pointer"
            >
              SIGN IN / REGISTER
            </button>
          )}
        </div>
      )}

      {/* Bulk Orders Specifications Modal */}
      <BulkOrderModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
      />

      {/* Unified Login & Register Modal with Google Sign-In */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
};
