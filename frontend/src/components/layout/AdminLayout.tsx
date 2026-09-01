import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Menu, X, Bell, Shield, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Security Gate: Protect all admin routes on frontend
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F5] flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="h-16 bg-[#0E0E12] border-b border-[#24242D] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-[#A1A1AA] hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-sport tracking-wider text-[#A1A1AA] uppercase">
                ADMINISTRATION & OPERATIONS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-sport tracking-wider text-[#A1A1AA] hover:text-[#D4AF37] border border-[#24242D] px-3 py-1.5 rounded-sm hover:bg-[#181821] transition-all"
            >
              <span>LIVE STORE</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
