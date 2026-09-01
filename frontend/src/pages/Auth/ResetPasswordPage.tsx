import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing password reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        token,
        new_password: newPassword,
      });
      setIsSuccess(true);
      toast.success(res.message || 'Password successfully updated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid or expired password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#12121A] border border-red-500/30 rounded-xl p-8 space-y-6 shadow-2xl text-center">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-black text-white uppercase tracking-wider">
              Invalid Reset Link
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              This password reset link is missing a valid security token or has already expired.
            </p>
          </div>
          <Link to="/forgot-password" className="block w-full">
            <Button variant="gold" size="lg" className="w-full font-black text-xs sm:text-sm">
              REQUEST NEW RESET LINK
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-[#12121A] border border-[#242436] rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl text-left relative overflow-hidden">
        {/* Subtle Gold Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white uppercase tracking-wider">
            Set New Password
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
            {isSuccess
              ? 'Your password has been changed.'
              : 'Choose a strong password to protect your account.'}
          </p>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="space-y-5">
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
              <div className="text-sm font-bold text-white">Password Updated!</div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                You can now sign in to your Vishwakarma Bat House account using your new password.
              </p>
            </div>

            <Button
              type="button"
              variant="gold"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full font-black text-xs sm:text-sm py-3.5"
            >
              SIGN IN NOW →
            </Button>
          </div>
        ) : (
          /* Password Form */
          <form onSubmit={handleReset} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5 font-sport text-xs">
              <label className="block text-[#A1A1AA] uppercase font-bold text-[10px] tracking-wider">
                NEW PASSWORD (MIN. 6 CHARACTERS) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-10 py-3 rounded-md text-xs focus:outline-none placeholder:text-[#52525B] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#71717A] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5 font-sport text-xs">
              <label className="block text-[#A1A1AA] uppercase font-bold text-[10px] tracking-wider">
                CONFIRM NEW PASSWORD *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-3.5 py-3 rounded-md text-xs focus:outline-none placeholder:text-[#52525B] transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={isLoading}
              className="w-full py-3.5 font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>UPDATING PASSWORD...</span>
                </>
              ) : (
                <>
                  <span>UPDATE PASSWORD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center pt-3 border-t border-[#1E1E28]">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors font-sport uppercase tracking-wider font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
