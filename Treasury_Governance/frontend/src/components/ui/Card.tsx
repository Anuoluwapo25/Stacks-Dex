import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}