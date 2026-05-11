import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInView } from '../hooks/useInView';

interface MarqueeProps {
  items?: readonly string[];
  direction?: 'left' | 'right';
  className?: string;
  itemClassName?: string;
  dotClassName?: string;
  itemWrapperClassName?: string;
  trackClassName?: string;
  showMasks?: boolean;
  maskClassName?: string;
  ariaLabel?: string;
}

const DEFAULT_ITEMS = ['Statutory Audit', 'Direct Tax', 'GST', 'Company Law', 'Business Advisory', 'Internal Audit'];

const Marquee: React.FC<MarqueeProps> = React.memo(
  ({
    items = DEFAULT_ITEMS,
    direction = 'left',
    className = 'py-16 bg-brand-bg border-y border-brand-border/60',
    itemClassName = 'font-heading font-medium text-3xl md:text-5xl text-brand-dark tracking-tight whitespace-nowrap',
    dotClassName = 'w-2 h-2 rounded-full bg-brand-moss ml-8',
    itemWrapperClassName = 'flex items-center gap-6 mx-8',
    trackClassName = '',
    showMasks = true,
    maskClassName = 'from-brand-bg',
    ariaLabel = 'Services',
  }) => {
    const shouldReduceMotion = useReducedMotion();
    const [ref, isVisible] = useInView({ rootMargin: '100px' });

    const ItemGroup = () => (
      <>
        {items.map((item) => (
          <div key={item} className={itemWrapperClassName}>
            <span className={itemClassName}>{item}</span>
            <div className={dotClassName}></div>
          </div>
        ))}
      </>
    );

    const isPlaying = isVisible && !shouldReduceMotion;
    const animationStyle = {
      animationDirection: direction === 'right' ? 'reverse' : 'normal',
      animationPlayState: isPlaying ? 'running' : 'paused',
    };

    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`group relative flex select-none overflow-hidden ${className}`}
        aria-label={ariaLabel}
      >
        {/* Gradient Masks for smooth fade in/out */}
        {showMasks && (
          <>
            <div
              className={`absolute bottom-0 left-0 top-0 w-24 bg-gradient-to-r md:w-48 ${maskClassName} pointer-events-none z-10 to-transparent`}
            ></div>
            <div
              className={`absolute bottom-0 right-0 top-0 w-24 bg-gradient-to-l md:w-48 ${maskClassName} pointer-events-none z-10 to-transparent`}
            ></div>
          </>
        )}

        <div
          className={`flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused] ${trackClassName}`}
          style={animationStyle}
        >
          <ItemGroup />
        </div>
        <div
          className={`flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused] ${trackClassName}`}
          style={animationStyle}
          aria-hidden="true"
        >
          <ItemGroup />
        </div>
      </div>
    );
  },
);

export default Marquee;
