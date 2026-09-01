import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShoppingBag, 
  ShieldCheck, 
  Heart, 
  LogOut, 
  Award, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, updateUser, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const initials = (user.full_name || user.email || 'VK')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updated = await authService.updateProfile({ full_name: fullName, phone });
      updateUser(updated);
      toast.success('Profile updated successfully');
    } catch (e) {
      toast.error('Error updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPass(true);
    try {
      await authService.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error changing password');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8 font-sport">
      {/* 1. Header Profile Banner Card */}
      <div className="bg-gradient-to-br from-[#161622] via-[#121218] to-[#0D0D12] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background ambient gold aura */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#D4AF37]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Circular Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#09090B] font-serif font-black text-2xl flex items-center justify-center shadow-xl shadow-[#D4AF37]/20 ring-4 ring-[#D4AF37]/30">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#121218] border border-[#D4AF37] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
            </div>

            {/* User Details */}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-white uppercase tracking-wide">
                  {user.full_name || 'Cricket Player'}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold tracking-wider uppercase">
                  {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                  {isAdmin ? 'Master Admin' : 'Pro Member'}
                </span>
              </div>
              <p className="text-[#A1A1AA] text-sm font-mono mt-1">{user.email}</p>
              {user.phone && (
                <p className="text-[#71717A] text-xs font-mono mt-0.5">{user.phone}</p>
              )}
            </div>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link to="/orders">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A24] hover:bg-[#D4AF37]/15 border border-[#2F2F44] hover:border-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                Orders
              </button>
            </Link>

            <Link to="/wishlist">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A24] hover:bg-[#E31B23]/15 border border-[#2F2F44] hover:border-[#E31B23] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
              >
                <Heart className="w-3.5 h-3.5 text-[#E31B23]" />
                Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
              </button>
            </Link>

            {isAdmin && (
              <Link to="/admin">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#AA7C11]/20 border border-[#D4AF37]/60 text-[#D4AF37] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </button>
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Personal Information Form */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-[#121218]/90 border border-[#242436] p-6 sm:p-7 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#242436]">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                <User className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Personal Information
              </h3>
            </div>

            <Input
              label="FULL NAME"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sunil Gavaskar"
              required
            />

            <Input
              label="EMAIL ADDRESS (LOCKED)"
              value={user.email}
              disabled
            />

            <Input
              label="PHONE NUMBER"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#09090B] font-extrabold text-xs tracking-widest uppercase shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUpdating ? 'SAVING...' : 'SAVE PROFILE CHANGES'}</span>
          </button>
        </form>

        {/* Security & Password Form */}
        <form
          onSubmit={handleChangePassword}
          className="bg-[#121218]/90 border border-[#242436] p-6 sm:p-7 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#242436]">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Security & Password
              </h3>
            </div>

            <Input
              label="CURRENT PASSWORD"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="NEW PASSWORD"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Use a strong combination of letters, numbers, and symbols to protect your Vishwakarma account.
            </p>
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#1A1A24] hover:bg-[#222232] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-white font-bold text-xs tracking-widest uppercase shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>{isChangingPass ? 'UPDATING...' : 'UPDATE PASSWORD'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
