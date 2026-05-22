import React from 'react';

export interface GrainProps {
  opacity?: number;
  blendMode?: React.CSSProperties['mixBlendMode'];
}

export function Grain({ opacity = 0.05, blendMode = 'overlay' }: GrainProps) {
  const svg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>`;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ backgroundImage: `url("${svg}")`, mixBlendMode: blendMode, opacity }}
    />
  );
}
