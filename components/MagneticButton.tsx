import React, { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number; // How strong the magnetic pull is (higher = moves more)
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = '', onClick, strength = 0.5 }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion || !btnRef.current) return;

    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);

    setPosition({ x: x * strength, y: y * strength });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform: shouldReduceMotion ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        transition: isHovered ? 'transform 0.1s linear' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`group relative flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/20 bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-brand-dark shadow-xl hover:shadow-2xl hover:shadow-brand-moss/20 ${className} `}
    >
      {/* Liquid Background Fill */}
      <div
        className={`absolute inset-0 -z-0 translate-y-full rounded-full bg-brand-moss transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 ${shouldReduceMotion ? 'duration-0' : ''} `}
      ></div>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
        {children}
      </span>

      {/* Icon Circle */}
      <div
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-white transition-colors duration-300 group-hover:bg-white group-hover:text-brand-dark`}
      >
        <ArrowRight
          size={14}
          className={`transition-transform duration-500 ${shouldReduceMotion ? '' : 'group-hover:-rotate-45'}`}
        />
      </div>
    </button>
  );
};

export default MagneticButton;
