import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Use refs for coordinates to avoid re-renders on every frame
  const mouse = useRef({ x: -100, y: -100 }); // Start off-screen
  const follower = useRef({ x: -100, y: -100 });
  
  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const moveMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      // Move the center dot instantly
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Show cursor when moving inside the window
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check for clickable elements
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('a') || 
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener('mousemove', moveMouse);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop for the follower (Ring)
    let rafId: number;
    
    const animate = () => {
      // Linear Interpolation (LERP) for smooth, organic movement
      // 0.15 = 15% of the distance per frame. 
      // Higher = Snappier, Lower = Floatior.
      const lerpFactor = 0.15; 
      
      follower.current.x += (mouse.current.x - follower.current.x) * lerpFactor;
      follower.current.y += (mouse.current.y - follower.current.y) * lerpFactor;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${follower.current.x}px, ${follower.current.y}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', moveMouse);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const blendModeClass = "mix-blend-difference";

  return (
    <>
      {/* Center Dot - Disappears on hover to let the lens take over */}
      <div 
        ref={cursorRef} 
        className={`
          hidden md:block fixed top-0 left-0 w-2.5 h-2.5 bg-white rounded-full pointer-events-none z-[9999] 
          -mt-1.25 -ml-1.25 ${blendModeClass} 
          transition-opacity duration-300 ease-out
          ${(isHovering || !isVisible) ? 'opacity-0' : 'opacity-100'}
        `}
      />
      
      {/* Follower Ring - Morphs into a lens on hover */}
      <div 
        ref={followerRef}
        className={`
          hidden md:block fixed top-0 left-0 rounded-full pointer-events-none z-[9998] 
          -mt-5 -ml-5 w-10 h-10
          ${blendModeClass}
          transition-all duration-500 ease-out
          ${!isVisible
             ? 'opacity-0 scale-50'
             : isHovering 
                ? 'scale-[2.5] bg-white border-0 opacity-100' // Hover: Becomes a large, solid "Lens"
                : isClicking 
                  ? 'scale-75 border border-white bg-transparent opacity-50' // Click: Sharp shrink
                  : 'scale-100 border border-white bg-transparent opacity-100' // Normal: Thin ring
          }
        `}
      />
    </>
  );
};

export default CustomCursor;