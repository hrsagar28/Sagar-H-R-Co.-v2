import React from 'react';

// Line icons for the redesigned pages. Drawn at a light stroke to sit with the
// serif headings; lucide's default weight reads too heavy against them.

interface IconProps {
  size?: number;
}

const base = (size: number, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  'aria-hidden': true,
  focusable: false,
});

export const ArrowRight: React.FC<IconProps> = ({ size = 16 }) => (
  <svg {...base(size, 1.5)}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft: React.FC<IconProps> = ({ size = 14 }) => (
  <svg {...base(size, 1.5)}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const ArrowUp: React.FC<IconProps> = ({ size = 14 }) => (
  <svg {...base(size, 1.5)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 17 }) => (
  <svg {...base(size, 1.4)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg {...base(size, 1.4)}>
    <path d="M3 9h18M3 15h18" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg {...base(size, 1.4)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg {...base(size, 1.5)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
);

export const ChevronDown: React.FC<IconProps> = ({ size = 14 }) => (
  <svg {...base(size, 1.6)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
