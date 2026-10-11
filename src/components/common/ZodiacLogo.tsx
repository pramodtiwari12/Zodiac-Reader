import React from 'react';

interface ZodiacLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export const ZodiacMark: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Zodiac Emblem"
    >
      {/* Outer circle with small crescent notch at upper right */}
      <circle
        cx="14"
        cy="14"
        r="11.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="64 7"
      />
      {/* Crescent notch accent dot / crescent marker */}
      <circle cx="21" cy="7" r="1.5" fill="currentColor" />

      {/* 4-point compass / star sparkle at center */}
      <path
        d="M14 6.5 C14 11 11 14 6.5 14 C11 14 14 17 14 21.5 C14 17 17 14 21.5 14 C17 14 14 11 14 6.5 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Center pinpoint */}
      <circle cx="14" cy="14" r="1.25" fill="var(--bg-paper, #ffffff)" />
    </svg>
  );
};

export const ZodiacLogo: React.FC<ZodiacLogoProps> = ({ size = 28, className = '', showWordmark = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
        style={{
          backgroundColor: 'var(--bg-active)',
          color: 'var(--accent)',
          border: '1px solid var(--border)'
        }}
      >
        <ZodiacMark size={20} />
      </div>

      {showWordmark && (
        <div className="flex items-baseline gap-1.5 select-none">
          <span className="font-bold text-base tracking-tight text-[var(--text-primary)] font-['Inter']">
            Zodiac
          </span>
          <span className="font-normal text-xs text-[var(--text-muted)] tracking-wide uppercase font-['Inter']">
            Reader
          </span>
        </div>
      )}
    </div>
  );
};
