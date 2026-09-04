import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { legalService, ReconsentStatus } from '@/services/legalService';
import { toast } from 'sonner';

export const ReconsentModal: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [reconsentData, setReconsentData] = useState<ReconsentStatus | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    legalService
      .checkReconsent()
      .then((res) => {
        if (res.requires_reconsent && res.pending_documents.length > 0) {
          setReconsentData(res);
        } else {
          setReconsentData(null);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, user?.id]);

  if (!reconsentData || !reconsentData.requires_reconsent) {
    return null;
  }

  const handleAcceptUpdatedTerms = async () => {
    if (!agreed) {
      toast.error('Please check the box to acknowledge the updated legal terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Record consent for each pending updated document
      for (const doc of reconsentData.pending_documents) {
        await legalService.recordConsent({
          consent_type: 'TERMS_AND_PRIVACY',
          document_type: doc.slug,
          document_version: doc.version,
          consent_status: 'ACCEPTED',
          source: 'reconsent_modal',
        });
      }

      toast.success('Thank you. Updated terms acknowledged successfully.');
      setReconsentData(null);
    } catch (e) {
      toast.error('Failed to submit re-consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#12121A] border border-[#D4AF37]/50 rounded-2xl w-full max-w-[min(calc(100vw-1.5rem),32rem)] p-4 sm:p-8 space-y-5 sm:space-y-6 text-left font-sport shadow-[0_0_50px_rgba(212,175,55,0.2)] relative max-h-[90dvh] overflow-y-auto overscroll-contain my-auto">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest block">
              Policy Update Notice
            </span>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Updated Terms & Conditions
            </h3>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#A1A1AA] font-sans leading-relaxed">
          <p>
            We have updated our governing store policies to enhance transparency and comply with updated consumer protection guidelines. Please review the updated documents:
          </p>
          <div className="space-y-2 pt-1">
            {reconsentData.pending_documents.map((doc) => (
              <div
                key={doc.slug}
                className="flex items-center justify-between p-3 rounded-xl bg-[#181824] border border-[#2A2A3C]"
              >
                <div>
                  <p className="font-bold text-white font-sport uppercase tracking-wider text-xs">
                    {doc.title}
                  </p>
                  <p className="text-[10px] text-[#71717A]">
                    Version {doc.version} • Effective {doc.effective_date}
                  </p>
                </div>
                <Link
                  to={`/${doc.slug}`}
                  target="_blank"
                  className="text-xs text-[#D4AF37] hover:text-[#F3E5AB] font-sport font-bold flex items-center gap-1 transition-colors"
                >
                  <span>VIEW</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-[#242436]">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="reconsent-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#D4AF37] rounded cursor-pointer"
            />
            <span className="text-xs text-[#A1A1AA] group-hover:text-white transition-colors font-sans leading-relaxed">
              I have read, understand, and agree to the updated Terms & Conditions and acknowledge the updated Privacy Policy.
            </span>
          </label>

          <Button
            variant="gold"
            size="lg"
            disabled={!agreed || isSubmitting}
            onClick={handleAcceptUpdatedTerms}
            className="w-full font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'RECORDING ACCEPTANCE...' : 'CONFIRM & CONTINUE'}
          </Button>
        </div>
      </div>
    </div>
  );
};
