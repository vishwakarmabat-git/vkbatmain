import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 
    | 'gold' 
    | 'willow'
    | 'red' 
    | 'cricket'
    | 'dark' 
    | 'outline' 
    | 'success' 
    | 'turf'
    | 'crease'
    | 'warning'
    | 'scoreboard';
  showCricketBall?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'gold',
  showCricketBall = false,
  children,
  ...props
}) => {
  const variantStyles = {
    // English Willow Honey Gold
    gold: 'bg-gradient-to-r from-[#D4AF37]/20 to-[#AA7C11]/10 text-[#F5C542] border border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]',
    willow: 'bg-gradient-to-r from-[#DDA843]/25 to-[#8C5D0E]/15 text-[#FFE8A3] border border-[#DDA843]/60 shadow-[0_0_12px_rgba(221,168,67,0.2)]',

    // Dukes Red Leather Ball
    red: 'bg-gradient-to-r from-[#8B1220]/40 to-[#C9182B]/20 text-[#FFA3AC] border border-[#C9182B]/60 shadow-[0_0_12px_rgba(201,24,43,0.25)]',
    cricket: 'bg-gradient-to-r from-[#8B1220]/80 to-[#C9182B]/50 text-white border-y border-dashed border-white/50 shadow-[0_0_15px_rgba(201,24,43,0.4)]',

    // Stadium Turf Outfield
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
    turf: 'bg-gradient-to-r from-[#00E575]/20 to-[#047857]/15 text-[#00FF87] border border-[#00FF87]/50 shadow-[0_0_12px_rgba(0,255,135,0.2)]',

    // Pitch Batting Crease Chalk
    crease: 'bg-white/10 text-white border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.15)]',
    scoreboard: 'bg-[#0B0F15] text-[#F5C542] border border-[#242A38] font-mono tracking-widest',

    dark: 'bg-[#181824] text-[#F4F4F5] border border-[#28283A]',
    outline: 'bg-transparent text-[#A1A1AA] border border-[#383846]',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-sport font-black tracking-wider uppercase select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {showCricketBall && (
        <span className="w-2 h-2 rounded-full bg-[#C9182B] border border-white/80 shrink-0 shadow-[0_0_6px_#C9182B]" />
      )}
      {children}
    </span>
  );
};
