import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number; // How strong the magnetic pull is (higher = moves more)
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = "", 
  onClick,
  strength = 0.5 
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;

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
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isHovered ? 'transform 0.1s linear' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`
        relative overflow-hidden px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase
        flex items-center justify-center gap-4 group
        bg-white text-brand-dark border border-white/20 shadow-xl
        hover:shadow-2xl hover:shadow-brand-moss/20
        ${className}
      `}
    >
      {/* Liquid Background Fill */}
      <div className={`
        absolute inset-0 bg-brand-moss rounded-full translate-y-full group-hover:translate-y-0
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] -z-0
      `}></div>
      
      {/* Content */}
      <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center gap-2">
        {children}
      </span>
      
      {/* Icon Circle */}
      <div className={`
        relative z-10 w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center
        group-hover:bg-white group-hover:text-brand-dark transition-colors duration-300
      `}>
        <ArrowRight size={14} className="group-hover:-rotate-45 transition-transform duration-500" />
      </div>

    </button>
  );
};

export default MagneticButton;