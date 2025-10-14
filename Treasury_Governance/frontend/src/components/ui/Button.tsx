import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function Button({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105",
    outline: "border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10",
    ghost: "text-purple-300 hover:bg-purple-500/10"
  };
  
  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}