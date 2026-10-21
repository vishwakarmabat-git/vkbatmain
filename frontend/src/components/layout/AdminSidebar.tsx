import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, Boxes, ShoppingCart, Users,
  Star, Tag, Image, MessageSquare, HelpCircle, Settings, UserCheck,
  History, ArrowLeft, LogOut, ShieldAlert, Sliders, Briefcase, Sparkles, Scale
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRealtime } from '@/realtime/RealtimeProvider';

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const { isConnected } = useRealtime();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Products', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Categories', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { label: 'Banners Slider', path: '/admin/banners', icon: <Sliders className="w-4 h-4" /> },
    { label: 'Why VK Showcase', path: '/admin/why-vk', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Orders & Sales', path: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { label: 'Bulk Orders', path: '/admin/bulk-orders', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Customers', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Coupons & Promos', path: '/admin/coupons', icon: <Tag className="w-4 h-4" /> },
    { label: 'Legal & Policies', path: '/admin/legal-policies', icon: <Scale className="w-4 h-4" /> },
    { label: 'CMS & Content', path: '/admin/cms', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Workshop Gallery', path: '/admin/gallery', icon: <Image className="w-4 h-4" /> },
    { label: 'Global Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
    { label: 'Admin Users', path: '/admin/admin-users', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0E0E12] border-r border-[#24242D] flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand & Top Bar */}
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#24242D]">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Vishwakarma Bat House"
              className="w-9 h-9 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm text-[#F4F4F5]">ADMIN PORTAL</span>
              <span className="text-[10px] font-sport text-[#D4AF37] tracking-wider uppercase">
                CONTROL CENTER
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] font-sport tracking-wider text-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all uppercase font-semibold ${
                  isActive
                    ? 'bg-[#181821] text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-sm'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#14141A]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Exit to Storefront */}
      <div className="p-4 border-t border-[#24242D] bg-[#09090B] space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-sport tracking-wider text-[#A1A1AA] hover:text-[#D4AF37] py-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>VIEW STOREFRONT</span>
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-[#24242D]/50 text-xs">
          <div className="truncate max-w-[140px]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#F4F4F5] truncate">{user?.full_name || 'Admin'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 animate-pulse'
                }`}
                title={isConnected ? 'Realtime Live Connected' : 'Reconnecting Realtime...'}
              />
            </div>
            <div className="text-[10px] text-[#71717A] capitalize flex items-center gap-1">
              <span>{user?.role || 'Administrator'}</span>
              <span className="text-[9px] text-[#D4AF37] font-sport uppercase tracking-wider">
                {isConnected ? '• LIVE' : '• RECONNECTING'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 text-[#71717A] hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
