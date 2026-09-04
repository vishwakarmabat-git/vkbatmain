import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Shield,
  MessageSquare,
  Cookie,
  AlertTriangle,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { authService } from '@/services/authService';
import { legalService, MarketingPreferences } from '@/services/legalService';
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

  // Marketing Preferences
  const [marketingPrefs, setMarketingPrefs] = useState<MarketingPreferences>({
    email_marketing: false,
    sms_marketing: false,
    whatsapp_marketing: false,
  });
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);

  // Deletion Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      legalService
        .getMarketingPreferences()
        .then(setMarketingPrefs)
        .catch(() => {});
    }
  }, [isAuthenticated]);

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

      {/* 4. Privacy, Consent & Data Rights Card */}
      <div className="bg-[#121218]/90 border border-[#242436] p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242436]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Privacy, Consent & Data Rights
              </h3>
              <p className="text-[11px] text-[#71717A] font-sans">
                Manage your communication opt-ins, cookie controls, and account deletion rights
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('vk:open_cookie_preferences'))}
            className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#F3E5AB] border border-[#2A2A3C] hover:border-[#D4AF37] px-3 py-1.5 rounded-full transition-all cursor-pointer w-fit"
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookie Preferences</span>
          </button>
        </div>

        {/* Marketing Channel Preferences */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#D4AF37]">
            Marketing Communication Channels
          </h4>
          <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed">
            Transactional notifications (order confirmations, shipping tracking, invoices) are always sent to ensure purchase fulfillment. You can independently control optional promotional announcements below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Email Marketing */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181824] border border-[#2A2A3C]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-bold text-white uppercase">Email</p>
                  <p className="text-[10px] text-[#71717A]">Cleft release drops</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="pref-email"
                checked={marketingPrefs.email_marketing}
                onChange={async () => {
                  const updated = { ...marketingPrefs, email_marketing: !marketingPrefs.email_marketing };
                  setMarketingPrefs(updated);
                  await legalService.updateMarketingPreferences(updated);
                  toast.success('Email preference saved');
                }}
                className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
              />
            </div>

            {/* SMS Marketing */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181824] border border-[#2A2A3C]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-bold text-white uppercase">SMS</p>
                  <p className="text-[10px] text-[#71717A]">Festive flash deals</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="pref-sms"
                checked={marketingPrefs.sms_marketing}
                onChange={async () => {
                  const updated = { ...marketingPrefs, sms_marketing: !marketingPrefs.sms_marketing };
                  setMarketingPrefs(updated);
                  await legalService.updateMarketingPreferences(updated);
                  toast.success('SMS preference saved');
                }}
                className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
              />
            </div>

            {/* WhatsApp Marketing */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181824] border border-[#2A2A3C]">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-bold text-white uppercase">WhatsApp</p>
                  <p className="text-[10px] text-[#71717A]">VIP bat reservations</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="pref-whatsapp"
                checked={marketingPrefs.whatsapp_marketing}
                onChange={async () => {
                  const updated = { ...marketingPrefs, whatsapp_marketing: !marketingPrefs.whatsapp_marketing };
                  setMarketingPrefs(updated);
                  await legalService.updateMarketingPreferences(updated);
                  toast.success('WhatsApp preference saved');
                }}
                className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Quick Legal Links & Account Deletion Zone */}
        <div className="pt-4 border-t border-[#242436] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-sport">
            <Link to="/privacy-policy" className="text-[#A1A1AA] hover:text-[#D4AF37] underline">
              Privacy Policy
            </Link>
            <span className="text-[#52525B]">•</span>
            <Link to="/terms-and-conditions" className="text-[#A1A1AA] hover:text-[#D4AF37] underline">
              Terms & Conditions
            </Link>
            <span className="text-[#52525B]">•</span>
            <Link to="/grievance-redressal" className="text-[#A1A1AA] hover:text-[#D4AF37] underline">
              Grievance Redressal
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-sport uppercase tracking-wider transition-colors cursor-pointer border border-red-900/40 hover:border-red-500/50 px-3.5 py-2 rounded-xl bg-red-950/20"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Request Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#12121A] border border-red-500/40 rounded-2xl w-full max-w-[min(calc(100vw-1.5rem),32rem)] p-4 sm:p-8 space-y-5 sm:space-y-6 text-left font-sport shadow-2xl relative max-h-[90dvh] overflow-y-auto overscroll-contain my-auto">
            <div className="flex items-center justify-between border-b border-[#242436] pb-3">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Request Account Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletionSubmitted(false);
                }}
                className="text-[#71717A] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deletionSubmitted ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Deletion Request Registered
                  </h4>
                  <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed max-w-md mx-auto">
                    Your account deletion request has been formally logged (ID: PENDING). Our compliance desk will verify any open order fulfillment and process deactivation within 7 business days.
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletionSubmitted(false);
                  }}
                  className="mt-2 text-xs"
                >
                  CLOSE
                </Button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!deletePassword) {
                    toast.error('Please enter your password to authenticate.');
                    return;
                  }
                  setIsDeleting(true);
                  try {
                    await legalService.createPrivacyRequest({
                      request_type: 'ACCOUNT_DELETION',
                      reason: deleteReason,
                      current_password: deletePassword,
                    });
                    setDeletionSubmitted(true);
                    toast.success('Account deletion request submitted successfully.');
                  } catch (err: any) {
                    toast.error(err?.response?.data?.detail || 'Deletion request failed. Check password.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="space-y-4 text-xs font-sans"
              >
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 space-y-2 text-[#FCA5A5] leading-relaxed">
                  <p className="font-bold uppercase text-[11px] text-red-300 font-sport tracking-wider">
                    Important Statutory Disclosure
                  </p>
                  <ul className="list-disc ml-4 space-y-1 text-[11px]">
                    <li>Your login access and profile data will be permanently deactivated.</li>
                    <li>Any pending cricket bat orders in progress will still be fulfilled and delivered.</li>
                    <li>
                      <strong>Legal Retention:</strong> In accordance with Indian tax laws (GST Act & Companies Act), financial invoices and transaction records must be retained for statutory auditing purposes.
                    </li>
                  </ul>
                </div>

                <div className="space-y-1.5 font-sport text-left">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    CONFIRM YOUR CURRENT PASSWORD *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-red-500 text-white px-3 py-2.5 rounded-xs text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 font-sport text-left">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    REASON FOR DELETION (OPTIONAL)
                  </label>
                  <textarea
                    placeholder="e.g. No longer active in league cricket"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    rows={2}
                    className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-2.5 rounded-xs text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#242436] font-sport">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(false)}
                    className="text-xs border-[#2A2A3C]"
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    disabled={isDeleting || !deletePassword}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'VERIFYING...' : 'CONFIRM ACCOUNT DELETION'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
