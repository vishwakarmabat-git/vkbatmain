import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'red' | 'dark' | 'outline' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'gold',
  children,
  ...props
}) => {
  const variantStyles = {
    gold: 'bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/40 shadow-[0_0_10px_rgba(212,175,55,0.15)]',
    red: 'bg-[#E31B23]/15 text-[#FF6B6B] border border-[#E31B23]/40 shadow-[0_0_10px_rgba(227,27,35,0.15)]',
    dark: 'bg-[#181821] text-[#F4F4F5] border border-[#24242D]',
    outline: 'bg-transparent text-[#A1A1AA] border border-[#383846]',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-xs text-[11px] font-sport font-bold tracking-wider uppercase',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
