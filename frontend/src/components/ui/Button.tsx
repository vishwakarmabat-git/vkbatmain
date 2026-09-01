import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'secondary' | 'danger' | 'ghost' | 'whatsapp';
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
      'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none relative overflow-hidden active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 tracking-wider uppercase font-semibold font-sport',
      md: 'text-sm px-5 py-2.5 gap-2 tracking-wider uppercase font-semibold font-sport',
      lg: 'text-base px-7 py-3.5 gap-2.5 tracking-wider uppercase font-bold font-sport',
      xl: 'text-lg px-9 py-4 gap-3 tracking-widest uppercase font-black font-sport',
    };

    const variantStyles = {
      gold: 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#09090B] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:brightness-110 font-bold border border-[#D4AF37]',
      primary: 'bg-[#E31B23] hover:bg-[#B5131A] text-white hover:shadow-[0_0_20px_rgba(227,27,35,0.4)] border border-[#E31B23]',
      outline: 'bg-transparent border border-[#383846] text-[#F4F4F5] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#181821]',
      secondary: 'bg-[#181821] hover:bg-[#20202C] text-[#F4F4F5] border border-[#24242D] hover:border-[#383846]',
      danger: 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30',
      ghost: 'bg-transparent text-[#A1A1AA] hover:text-white hover:bg-[#181821]',
      whatsapp: 'bg-[#25D366] hover:bg-[#20ba59] text-white font-bold border border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.3)]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
