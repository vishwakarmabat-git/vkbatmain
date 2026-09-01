import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setIsSubmitted(true);
      toast.success(res.message || 'Password reset link sent to your inbox!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to send password reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-[#12121A] border border-[#242436] rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl text-left relative overflow-hidden">
        {/* Subtle Gold Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white uppercase tracking-wider">
            Forgot Password?
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
            {isSubmitted
              ? 'Check your inbox for reset instructions.'
              : 'Enter your registered email address and we will send you a secure link to reset your password.'}
          </p>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div className="space-y-5">
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
              <div className="text-sm font-bold text-white">Reset Link Dispatched</div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, you will receive an email shortly with a link valid for <strong>30 minutes</strong>.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsSubmitted(false)}
                className="w-full text-xs"
              >
                Try Another Email
              </Button>

              <Link to="/login" className="block w-full">
                <Button variant="gold" size="lg" className="w-full font-black text-xs sm:text-sm">
                  BACK TO SIGN IN
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 font-sport text-xs">
              <label className="block text-[#A1A1AA] uppercase font-bold text-[10px] tracking-wider">
                EMAIL ADDRESS *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="cricketplayer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
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
                  <span>SENDING LINK...</span>
                </>
              ) : (
                <>
                  <span>SEND RESET LINK</span>
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
