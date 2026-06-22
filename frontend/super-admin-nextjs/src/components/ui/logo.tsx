import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  className,
  iconClassName,
  textClassName,
  showText = true,
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white shadow-lg",
        iconClassName
      )}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
        >
          <path
            d="M10 25L38 75L62 25L90 75"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M52 55H80"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-bold text-xl tracking-tight", textClassName)}>
            VA <span className="text-indigo-600">Event</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-60">
            Management System
          </span>
        </div>
      )}
    </div>
  )
}
