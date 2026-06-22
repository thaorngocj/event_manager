/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  collapsed?: boolean;
}

export function Logo({ className, variant = 'dark', collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className={cn(
        "relative transition-transform duration-300 group-hover:scale-110",
        collapsed ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12"
      )}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* VA Logo - One continuous geometric shape */}
          <path 
            d="M10 25L38 80L66 25L94 80" 
            stroke={variant === 'light' ? "white" : "#0f172a"} 
            strokeWidth="15" 
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />
          <path 
            d="M58 58H88" 
            stroke={variant === 'light' ? "white" : "#0f172a"} 
            strokeWidth="12" 
            strokeLinecap="butt"
          />
        </svg>
      </div>
      {!collapsed && (
        <span className={cn(
          "text-xl font-black tracking-tighter uppercase italic transition-colors duration-300 hidden sm:block",
          variant === 'light' ? "text-white" : "text-slate-900"
        )}>
          EVENT
        </span>
      )}
    </div>
  );
}


