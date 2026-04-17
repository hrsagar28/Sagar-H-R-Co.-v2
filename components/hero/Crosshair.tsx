import React from 'react';

interface CrosshairProps {
  position: 'tl' | 'tr' | 'bl' | 'br' | { top?: string, right?: string, bottom?: string, left?: string };
  color?: string; // defaults to var(--zone-accent)
  size?: number; // default 24
}

export const Crosshair: React.FC<CrosshairProps> = ({ position, color = 'var(--zone-accent)', size = 24 }) => {
  const getStyleKeys = () => {
    if (typeof position === 'object') return position;
    switch (position) {
      case 'tl': return { top: '-1px', left: '-1px', transform: 'translate(-50%, -50%)' };
      case 'tr': return { top: '-1px', right: '-1px', transform: 'translate(50%, -50%)' };
      case 'bl': return { bottom: '-1px', left: '-1px', transform: 'translate(-50%, 50%)' };
      case 'br': return { bottom: '-1px', right: '-1px', transform: 'translate(50%, 50%)' };
      default: return {};
    }
  };

  const cSize = `${size}px`;
  
  return (
    <div className="absolute z-10 pointer-events-none" style={{ width: cSize, height: cSize, ...getStyleKeys() }}>
      <div className="absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2" style={{ backgroundColor: color }} />
      <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2" style={{ backgroundColor: color }} />
    </div>
  );
};
