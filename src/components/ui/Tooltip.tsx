import React from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, position = 'top' }) => {
  return (
    <span className="relative group inline-flex items-center">
      <Info className="w-4 h-4 text-gray-400 ml-1" />
      <span className={`absolute z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg ${
        position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' :
        position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' :
        position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
        'left-full top-1/2 -translate-y-1/2 ml-2'
      }`}>
        {text}
      </span>
    </span>
  );
};