import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#09090B]/85 backdrop-blur-md transition-opacity"
            aria-hidden="true"
          />

          {/* Centering Wrapper: min-h-full flex items-center with my-auto prevents negative offset clipping on mobile */}
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6 py-4 sm:py-8 pointer-events-none">
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={clsx(
                'pointer-events-auto relative w-full bg-[#121216] border border-[#24242D] rounded-md shadow-2xl p-4 sm:p-6 text-left z-10 my-auto flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100vh-3rem)]',
                maxWidthStyles[maxWidth]
              )}
            >
              {/* Top gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shrink-0" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#24242D] mb-4 shrink-0">
                {title && (
                  <h3 className="text-base sm:text-xl font-bold font-serif gold-gradient-text tracking-wide truncate pr-2">
                    {title}
                  </h3>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#181821] p-1.5 rounded-sm transition-colors ml-auto shrink-0 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="text-[#D4D4D8] overflow-y-auto overflow-x-hidden flex-1 overscroll-contain pr-1 -mr-1">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
