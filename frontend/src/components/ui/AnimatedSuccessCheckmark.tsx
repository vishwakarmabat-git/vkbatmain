import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedSuccessCheckmarkProps {
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedSuccessCheckmark: React.FC<AnimatedSuccessCheckmarkProps> = ({ size = 'md' }) => {
  const dimensions = {
    sm: {
      container: 'w-16 h-16',
      rippleOuter: 'w-24 h-24',
      rippleInner: 'w-20 h-20',
      circle: 'w-14 h-14',
      svg: 'w-7 h-7',
      strokeWidth: 3.5,
    },
    md: {
      container: 'w-24 h-24',
      rippleOuter: 'w-36 h-36',
      rippleInner: 'w-30 h-30',
      circle: 'w-20 h-20',
      svg: 'w-10 h-10',
      strokeWidth: 3.5,
    },
    lg: {
      container: 'w-32 h-32',
      rippleOuter: 'w-48 h-48',
      rippleInner: 'w-40 h-40',
      circle: 'w-28 h-28',
      svg: 'w-14 h-14',
      strokeWidth: 4,
    },
  }[size];

  return (
    <div className={`relative ${dimensions.container} flex items-center justify-center mx-auto`}>
      {/* Outer Ripple Wave */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.35, 1.5], opacity: [0.5, 0.2, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className={`absolute ${dimensions.rippleOuter} rounded-full bg-emerald-500/20 blur-xs pointer-events-none`}
      />

      {/* Second Ripple Wave */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.85, 1.2, 1.35], opacity: [0.6, 0.25, 0] }}
        transition={{
          duration: 2,
          delay: 0.35,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className={`absolute ${dimensions.rippleInner} rounded-full bg-emerald-400/25 pointer-events-none`}
      />

      {/* Main Circle with Spring Entry */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          damping: 14,
          stiffness: 220,
          duration: 0.5,
        }}
        className={`relative ${dimensions.circle} rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 p-[2px] shadow-[0_0_35px_rgba(16,185,129,0.55)] flex items-center justify-center`}
      >
        <div className="w-full h-full rounded-full bg-[#0c1410] flex items-center justify-center overflow-hidden relative">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full" />

          {/* Animated SVG Checkmark */}
          <svg
            className={`${dimensions.svg} text-emerald-400 relative z-10`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={dimensions.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M4.5 12.75l5 5L19.5 7.25"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
                delay: 0.2,
              }}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
