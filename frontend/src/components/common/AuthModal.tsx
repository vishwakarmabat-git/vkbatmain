import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { CricketBallIcon, CricketBatIcon } from '@/components/common/CricketIcons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const { setAuth } = useAuthStore();

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      toast.error('Google Sign-In failed. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = parseJwt(response.credential);
      const googleEmail = payload?.email || 'player@gmail.com';
      const googleName = payload?.name || 'Cricket Player';

      const data = await authService.googleLogin({
        token: response.credential,
        email: googleEmail,
        name: googleName,
      });

      setAuth(data.user, data.access_token);
      toast.success(`Signed in as ${data.user.full_name}!`);
      onClose();
      if (data.user.role === 'admin' || data.user.role === 'superadmin') {
        navigate('/admin');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Google sign in authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google Identity Services when modal is opened
  useEffect(() => {
    if (!isOpen) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            shape: 'rectangular',
            text: 'continue_with',
          });
        }
      } catch (err) {
        console.warn('Google Identity initialization notice:', err);
      }
    }
  }, [isOpen]);

  const handleGoogleSignInClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (window.google?.accounts?.oauth2 && clientId) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              setIsLoading(true);
              try {
                // Fetch basic profile info using access token
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();
                
                const data = await authService.googleLogin({
                  token: tokenResponse.access_token,
                  email: userInfo.email,
                  name: userInfo.name,
                });

                setAuth(data.user, data.access_token);
                toast.success(`Welcome, ${data.user.full_name}!`);
                onClose();
                if (data.user.role === 'admin' || data.user.role === 'superadmin') {
                  navigate('/admin');
                }
              } catch {
                toast.error('Failed to retrieve Google profile.');
              } finally {
                setIsLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('Direct token client error:', err);
      }
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback
      toast.info('Connecting to Google services...');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.full_name}!`);
      onClose();
      setEmail('');
      setPassword('');
      if (data.user.role === 'admin' || data.user.role === 'superadmin') {
        navigate('/admin');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!acceptTerms) {
      toast.error('You must agree to the Terms & Conditions and acknowledge the Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.register({
        full_name: fullName,
        email,
        password,
        phone: phoneNumber || undefined,
        accept_terms_and_privacy: acceptTerms,
        marketing_opt_in: marketingOptIn,
      });
      setAuth(data.user, data.access_token);
      toast.success(`Account created! Welcome to VK Bat House, ${data.user.full_name}!`);
      onClose();
      setFullName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed. Email might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#12121A] border border-[#242436] rounded-2xl p-6 sm:p-8 shadow-2xl text-left z-10 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-[#71717A] hover:text-white transition-colors p-1"
              aria-label="Close authentication modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Logo & Header */}
            <div className="text-center space-y-2">
              <img
                src="/logo.png"
                alt="Vishwakarma Bat House"
                className="w-14 h-14 object-contain mx-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              />
              <h2 className="text-2xl font-serif font-black text-white uppercase tracking-wider">
                {tab === 'login' ? 'WELCOME BACK' : 'JOIN THE MASTERCRAFT'}
              </h2>
              <p className="text-xs text-[#A1A1AA] font-sans">
                {tab === 'login'
                  ? 'Sign in to access your orders, custom bat specs, and wishlist'
                  : 'Create an account for expedited checkout & tailored bat builds'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#181822] rounded-lg border border-[#2A2A3C] font-sport text-xs font-bold tracking-wider">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2 rounded-md transition-all uppercase ${
                  tab === 'login'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`py-2 rounded-md transition-all uppercase ${
                  tab === 'register'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Google Sign-In Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isLoading}
                className="w-full bg-[#181822] hover:bg-[#20202E] border border-[#2A2A3C] hover:border-[#D4AF37] text-white font-sport font-bold py-3.5 px-4 rounded-md text-xs tracking-wider uppercase flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#242436] w-full" />
              <span className="bg-[#12121A] px-3 text-[10px] font-sport tracking-widest text-[#71717A] uppercase shrink-0">
                OR WITH EMAIL
              </span>
              <div className="border-t border-[#242436] w-full" />
            </div>

            {/* Sign In Form */}
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 font-sport tracking-wider text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    EMAIL ADDRESS *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="cricketplayer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-3 py-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                      PASSWORD *
                    </label>
                    <a
                      href="mailto:support@vkbathouse.com?subject=Password%20Reset"
                      className="text-[10px] text-[#D4AF37] hover:underline"
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-3 py-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] hover:shadow-[0_0_25px_rgba(201,24,43,0.55)] border-y border-dashed border-white/60 text-white font-sport font-black py-4 px-6 rounded-xs uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer bat-swing-shine mt-2 group/btn"
                >
                  <CricketBallIcon size={14} className="group-hover/btn:rotate-45 transition-transform duration-300" />
                  <span>{isLoading ? 'VERIFYING...' : 'SIGN IN TO PLAYER ACCOUNT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleRegister} className="space-y-4 font-sport tracking-wider text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    FULL NAME *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Hardik Pandya"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-3 py-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    EMAIL ADDRESS *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="player@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-3 py-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    PHONE NUMBER (OPTIONAL)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-3 py-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#A1A1AA] uppercase font-bold text-[10px]">
                    PASSWORD * (MIN 6 CHARACTERS)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-[#181822] border border-[#2A2A3C] focus:border-[#D4AF37] text-white pl-10 pr-3 py-3 rounded-xs text-xs focus:outline-none placeholder:text-[#52525B]"
                    />
                  </div>
                </div>

                {/* Mandatory Legal Terms & Conditions Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      id="authmodal-register-terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                      className="w-4 h-4 mt-0.5 accent-[#D4AF37] rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-[#A1A1AA] group-hover:text-white transition-colors font-sans leading-relaxed">
                      I agree to the{' '}
                      <Link
                        to="/terms-and-conditions"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#D4AF37] underline hover:text-[#F3E5AB] font-bold"
                      >
                        Terms & Conditions
                      </Link>{' '}
                      and acknowledge the{' '}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#D4AF37] underline hover:text-[#F3E5AB] font-bold"
                      >
                        Privacy Policy
                      </Link>
                      . <span className="text-red-400">*</span>
                    </span>
                  </label>
                </div>

                {/* Optional Separate Marketing Opt-In Checkbox */}
                <div className="pb-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      id="authmodal-register-marketing"
                      checked={marketingOptIn}
                      onChange={(e) => setMarketingOptIn(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#D4AF37] rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-[#71717A] group-hover:text-[#A1A1AA] transition-colors font-sans leading-relaxed">
                      Send me offers, discounts and new bat cleft releases by email / WhatsApp / SMS (Optional).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#FFE8A3] via-[#DDA843] to-[#8C5D0E] hover:shadow-[0_0_25px_rgba(221,168,67,0.5)] border border-[#FFE8A3] text-black font-sport font-black py-4 px-6 rounded-xs uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg mt-2 cursor-pointer bat-swing-shine disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                  <CricketBatIcon size={16} className="text-black shrink-0" />
                  <span>{isLoading ? 'CRAFTING PROFILE...' : 'CREATE MY PLAYER ACCOUNT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
