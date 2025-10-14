import React from 'react';
import { cn } from '../../utils/helpers';

interface ProgressBarProps {
  value: number;
  label: string;
  color?: 'blue' | 'purple' | 'pink';
}

export function ProgressBar({ value, label, color = "blue" }: ProgressBarProps) {
  const colors = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
    purple: "bg-gradient-to-r from-purple-500 to-purple-600",
    pink: "bg-gradient-to-r from-pink-500 to-pink-600"
  };
  
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-gray-300 text-sm">{label}</span>
        <span className="text-gray-400 text-sm">{value}%</span>
      </div>
      <div className="w-full bg-purple-900/30 rounded-full h-2.5">
        <div 
          className={cn("h-2.5 rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}