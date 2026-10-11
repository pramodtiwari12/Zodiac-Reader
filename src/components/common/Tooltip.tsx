import React, { useState, useRef } from 'react';

interface TooltipProps {
  content: string;
  shortcut?: string;
  position?: 'right' | 'bottom' | 'top' | 'left';
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  position = 'bottom',
  children,
  delay = 250
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<any>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'top':
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
      case 'bottom':
      default:
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 text-xs rounded-full shadow-lg transition-opacity duration-150 flex items-center gap-1.5 ${getPositionClasses()}`}
          style={{
            backgroundColor: 'var(--tooltip-bg)',
            color: 'var(--tooltip-text)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <span>{content}</span>
          {shortcut && (
            <span className="opacity-60 text-[10px] font-mono tracking-wide bg-black/20 dark:bg-white/10 px-1 py-0.5 rounded">
              {shortcut}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
