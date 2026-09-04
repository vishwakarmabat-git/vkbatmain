import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | 'primary' 
    | 'gold' 
    | 'willow'
    | 'cricket'
    | 'cricket-ball'
    | 'crease'
    | 'turf'
    | 'outline' 
    | 'secondary' 
    | 'danger' 
    | 'ghost' 
    | 'whatsapp';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none relative overflow-hidden active:scale-[0.97] bat-swing-shine';

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 tracking-wider uppercase font-bold font-sport',
      md: 'text-sm px-5 py-2.5 gap-2 tracking-wider uppercase font-bold font-sport',
      lg: 'text-base px-7 py-3.5 gap-2.5 tracking-wider uppercase font-black font-sport',
      xl: 'text-lg px-9 py-4 gap-3 tracking-widest uppercase font-black font-sport',
    };

    const variantStyles = {
      // 1. English Willow Cleft Gold (Organic Honey Wood Grain with Gold Stamp)
      gold: 'bg-gradient-to-r from-[#FFE29A] via-[#E5A832] to-[#A06C13] text-[#0A0D12] hover:shadow-[0_0_30px_rgba(229,168,50,0.5)] font-black border border-[#FFD573] hover:brightness-105',
      willow: 'bg-gradient-to-r from-[#FFE8A3] via-[#DDA843] to-[#8C5D0E] text-[#0A0D12] hover:shadow-[0_0_30px_rgba(221,168,67,0.55)] font-black border border-[#FFE8A3]/80 hover:brightness-105',

      // 2. Cricket Red Leather Ball with White Hand-Stitched Seam
      primary: 'bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] text-white hover:shadow-[0_0_25px_rgba(201,24,43,0.5)] border-y border-[#FF4D5E]/60 border-x border-[#780E1B] font-black',
      cricket: 'bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] text-white hover:shadow-[0_0_25px_rgba(201,24,43,0.5)] border-y border-[#FF4D5E]/60 border-x border-[#780E1B] font-black',
      'cricket-ball': 'bg-gradient-to-r from-[#8B1220] via-[#C9182B] to-[#780E1B] text-white hover:shadow-[0_0_30px_rgba(201,24,43,0.6)] border-y-2 border-dashed border-white/60 font-black',

      // 3. Batting Crease Chalk Line (Pitch White with Turf Glow on Hover)
      outline: 'bg-[#12121A]/80 border border-[#E2E8F0]/30 text-[#F4F4F5] hover:border-[#F5C542] hover:text-[#F5C542] hover:shadow-[0_0_20px_rgba(245,197,66,0.25)] hover:bg-[#181824]',
      crease: 'bg-transparent border-2 border-[#E2E8F0] text-white hover:border-[#00FF87] hover:text-[#00FF87] hover:shadow-[0_0_25px_rgba(0,255,135,0.3)] hover:bg-[#06150E]',

      // 4. Stadium Outfield Turf Neon
      turf: 'bg-gradient-to-r from-[#00E575] via-[#10B981] to-[#047857] text-[#07130C] hover:shadow-[0_0_30px_rgba(0,229,117,0.5)] font-black border border-[#00FF87]',

      secondary: 'bg-[#161622] hover:bg-[#202030] text-[#F4F4F5] border border-[#2A2A3C] hover:border-[#F5C542]/50 font-bold',
      danger: 'bg-red-950/60 text-red-300 border border-red-800/60 hover:bg-red-900/60 font-bold',
      ghost: 'bg-transparent text-[#A1A1AA] hover:text-white hover:bg-[#181822]',
      whatsapp: 'bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-white font-black border border-[#25D366] shadow-[0_0_25px_rgba(37,211,102,0.35)]',
    };

    const isSeamVariant = variant === 'cricket-ball' || variant === 'cricket' || variant === 'primary';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {/* Subtle white cricket ball stitch line through center for seam buttons */}
        {isSeamVariant && (
          <span 
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] opacity-25 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #FFF 0px, #FFF 3px, transparent 3px, transparent 6px)'
            }}
          />
        )}

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 z-10">{leftIcon}</span>}
            <span className="z-10 tracking-wider inline-flex items-center justify-center gap-2">{children}</span>
            {rightIcon && <span className="inline-flex shrink-0 z-10">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
