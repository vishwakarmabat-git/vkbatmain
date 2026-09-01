import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Menu, X, Shield, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/Button';
import { BulkOrderModal } from '@/components/common/BulkOrderModal';
import { AuthModal } from '@/components/common/AuthModal';

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
    <header className="sticky top-0 z-40 w-full bg-[#09090B] border-b border-[#24242D] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 items-center h-20">
          {/* 1. Left: Brand Logo (3 cols) */}
          <div className="md:col-span-3 flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <img
                src="/logo.png"
                alt="Vishwakarma Bat House"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xs group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          {/* 2. Center: Navigation Links (6 cols - Dead Center) */}
          <nav className="hidden md:flex md:col-span-6 items-center justify-center space-x-6 lg:space-x-8 xl:space-x-10 text-xs sm:text-sm font-sport font-black tracking-[0.15em] uppercase">
            {navLinks.map((link) => {
              if (link.label === 'BULK ORDERS') {
                return (
                  <button
                    key={link.label}
                    onClick={() => setBulkModalOpen(true)}
                    className="py-2 text-[#F4F4F5] hover:text-[#D4AF37] transition-all duration-200 uppercase cursor-pointer"
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
                  className={`py-2 transition-all duration-200 ${
                    isActive
                      ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                      : 'text-[#F4F4F5] hover:text-[#D4AF37]'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* 3. Right: Action Icons (3 cols - Far Right) */}
          <div className="md:col-span-3 flex items-center justify-end space-x-3 sm:space-x-5">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-[#F4F4F5] hover:text-[#D4AF37] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Small User / Login SVG Icon */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="p-1.5 text-[#F4F4F5] hover:text-[#D4AF37] transition-colors flex items-center gap-1 cursor-pointer"
                  aria-label="User Account"
                >
                  <User className="w-5 h-5 stroke-[2]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-[#12121A] border border-[#242436] shadow-2xl rounded-sm py-2 z-50 text-left font-sport tracking-wider text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-[#24242D] overflow-hidden">
                      <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-0.5">Signed in as</div>
                      <div className="text-white font-bold truncate text-xs" title={user.email}>
                        {user.email}
                      </div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3.5 py-2 text-[#D4AF37] hover:bg-[#181821] font-bold"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>ADMIN DASHBOARD</span>
                      </Link>
                    )}

                    <Link to="/profile" className="block px-3.5 py-2 text-[#E4E4E7] hover:bg-[#181821]">
                      MY PROFILE
                    </Link>
                    <Link to="/orders" className="block px-3.5 py-2 text-[#E4E4E7] hover:bg-[#181821]">
                      ORDER HISTORY
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3.5 py-2 text-red-400 hover:bg-[#181821]"
                    >
                      LOGOUT
                    </button>
                  </div>
                )}
              </div>
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

            {/* Favourites / Wishlist Heart Icon with Red Badge */}
            <Link
              to="/wishlist"
              className="p-1.5 text-[#F4F4F5] hover:text-[#E31B23] transition-colors relative"
              aria-label="Favourites"
            >
              <Heart className="w-5 h-5 stroke-[2]" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 bg-[#E31B23] text-white text-[10px] font-sport font-black rounded-full flex items-center justify-center leading-none shadow-sm">
                {wishlistItems.length}
              </span>
            </Link>

            {/* Cart Shopping Bag Icon with Red Badge */}
            <button
              onClick={openDrawer}
              className="p-1.5 text-[#F4F4F5] hover:text-[#D4AF37] transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 bg-[#E31B23] text-white text-[10px] font-sport font-black rounded-full flex items-center justify-center leading-none shadow-sm">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#A1A1AA] hover:text-white"
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
              className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-[#F4F4F5] px-4 py-2 text-sm rounded-sm focus:outline-none"
            />
            <Button type="submit" variant="gold" size="sm">
              SEARCH
            </Button>
          </form>
        )}
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0E0E12] border-b border-[#24242D] px-6 py-4 space-y-3 font-sport text-sm font-bold uppercase tracking-wider">
          {navLinks.map((link) => {
            if (link.label === 'BULK ORDERS') {
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setBulkModalOpen(true);
                  }}
                  className="block w-full text-left py-2 text-[#E4E4E7] hover:text-[#D4AF37]"
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
              className="block w-full text-left py-2 text-[#D4AF37] font-bold uppercase"
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
