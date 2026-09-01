import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, MapPin, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuthStore();

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
    <div className="max-w-4xl mx-auto px-4 py-10 text-left space-y-10">
      <div className="border-b border-[#24242D] pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            BATSMAN PROFILE
          </span>
          <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            MY ACCOUNT & PREFERENCES
          </h1>
        </div>

        <Link to="/orders">
          <Button variant="outline" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            VIEW ORDER HISTORY
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <form onSubmit={handleUpdateProfile} className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase flex items-center gap-2">
            <User className="w-4 h-4 text-[#D4AF37]" />
            PERSONAL INFORMATION
          </h3>

          <Input
            label="FULL NAME"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="EMAIL ADDRESS (CANNOT BE CHANGED)"
            value={user.email}
            disabled
          />

          <Input
            label="PHONE NUMBER"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />

          <Button type="submit" variant="gold" size="md" isLoading={isUpdating}>
            SAVE CHANGES
          </Button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            SECURITY & PASSWORD
          </h3>

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

          <Button type="submit" variant="outline" size="md" isLoading={isChangingPass}>
            UPDATE PASSWORD
          </Button>
        </form>
      </div>
    </div>
  );
};
