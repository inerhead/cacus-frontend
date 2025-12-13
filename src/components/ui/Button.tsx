import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'black' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-bold uppercase tracking-wide transition-all duration-200 active:scale-95';
  
  const variants = {
    primary: 'bg-lego-yellow text-black hover:bg-lego-yellow-dark',
    secondary: 'bg-lego-blue text-white hover:bg-lego-blue-light',
    black: 'bg-black text-white hover:bg-lego-gray-darker',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        'rounded-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

