import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, Check, X, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { legalService } from '@/services/legalService';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
}

const STORAGE_KEY = 'vk_cookie_preferences';

export const CookieConsentBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    decided: false,
  });

  useEffect(() => {
    // Check existing stored preferences
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      } else {
        // First-time visit: show banner after brief smooth delay
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }

    // Listen to custom event to reopen preferences modal from footer or account
    const handleOpenEvent = () => {
      setShowModal(true);
    };

    window.addEventListener('vk:open_cookie_preferences', handleOpenEvent);
    return () => window.removeEventListener('vk:open_cookie_preferences', handleOpenEvent);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}

    setPreferences(prefs);
    setIsOpen(false);
    setShowModal(false);

    // Record auditable consent in backend
    legalService
      .recordConsent({
        consent_type: 'COOKIE_PREFERENCES',
        document_type: 'cookie-policy',
        document_version: '1.0',
        consent_status: prefs.analytics || prefs.marketing ? 'ACCEPTED' : 'REJECTED',
        source: 'cookie_banner',
      })
      .catch(() => {});
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      decided: true,
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      decided: true,
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      ...preferences,
      decided: true,
    });
  };

  if (!isOpen && !showModal) return null;

  return (
    <>
      {/* Bottom Floating Consent Notification Banner */}
      {isOpen && !showModal && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#12121A]/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-5 shadow-2xl space-y-4 text-left font-sport">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Cookie & Privacy Preferences
                </h4>
                <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed">
                  We use strictly necessary cookies to power our storefront and authentication. You can choose to allow optional analytics or marketing cookies to help us improve your browsing experience. Read our{' '}
                  <Link to="/cookie-policy" className="text-[#D4AF37] underline hover:text-[#F3E5AB]">
                    Cookie Policy
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="text-xs border-[#2A2A3C] text-[#A1A1AA] hover:text-white"
              >
                <Settings2 className="w-3.5 h-3.5 mr-1" />
                <span>CUSTOMIZE</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs border-[#2A2A3C] text-[#A1A1AA] hover:text-white"
              >
                <span>REJECT NON-ESSENTIAL</span>
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs font-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>ACCEPT ALL</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Cookie Customization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12121A] border border-[#242436] rounded-2xl max-w-lg w-full p-6 space-y-6 text-left font-sport shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#242436] pb-3">
              <div className="flex items-center gap-2.5 text-[#D4AF37]">
                <Cookie className="w-5 h-5" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Manage Cookie Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#71717A] hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed">
              Tailor your privacy settings. Strictly necessary cookies remain active to preserve shopping cart contents and security. Optional cookies are only activated with your affirmative consent.
            </p>

            <div className="space-y-4">
              {/* Strictly Necessary */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#161622] border border-[#2A2A3C]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      1. Strictly Necessary
                    </span>
                    <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-bold">
                      ALWAYS ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] font-sans leading-relaxed">
                    Essential for secure authentication, session management, and shopping cart persistence.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="w-4 h-4 accent-[#D4AF37] mt-1 cursor-not-allowed opacity-75"
                />
              </div>

              {/* Analytics & Performance */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#161622] border border-[#2A2A3C]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      2. Analytics & Performance
                    </span>
                    <span className="text-[10px] bg-[#2A2A3C] text-[#A1A1AA] px-2 py-0.5 rounded">
                      OPTIONAL
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] font-sans leading-relaxed">
                    Allows aggregated traffic metrics to help us optimize cleft catalog browsing and page load speed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#D4AF37] mt-1 cursor-pointer"
                />
              </div>

              {/* Marketing & Announcements */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#161622] border border-[#2A2A3C]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      3. Marketing & Announcements
                    </span>
                    <span className="text-[10px] bg-[#2A2A3C] text-[#A1A1AA] px-2 py-0.5 rounded">
                      OPTIONAL
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] font-sans leading-relaxed">
                    Remembers your interest in specific willow profiles or limited edition bat releases.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="cookie-marketing"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#D4AF37] mt-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#242436]">
              <Link
                to="/cookie-policy"
                onClick={() => setShowModal(false)}
                className="text-xs text-[#D4AF37] hover:underline"
              >
                View Full Cookie Policy
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectNonEssential}
                  className="text-xs border-[#2A2A3C]"
                >
                  REJECT ALL
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleSaveCustom}
                  className="text-xs font-bold"
                >
                  SAVE PREFERENCES
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
