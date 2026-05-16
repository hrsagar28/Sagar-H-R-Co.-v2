import React from 'react';

interface GhostWordProps {
  children: string;
  sizeClass?: string; // default text-display-xl
  position?: React.CSSProperties;
  color?: string; // default var(--zone-accent) at opacity 0.04
  className?: string;
}

export const GhostWord: React.FC<GhostWordProps> = ({
  children,
  sizeClass = 'text-display-xl tracking-tight leading-none',
  position,
  color = 'var(--zone-accent)',
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none text-center font-serif italic ${sizeClass} ${className}`}
      style={{
        ...position,
        color,
        opacity: 0.04,
      }}
    >
      {children}
    </div>
  );
};
