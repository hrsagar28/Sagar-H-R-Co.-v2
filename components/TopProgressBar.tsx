import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TopProgressBar: React.FC = () => {
  const { pathname } = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start animation on route change
    setIsVisible(true);
    setProgress(0);

    // Simulate progress sequence
    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(60), 200);
    const t3 = setTimeout(() => setProgress(85), 400);
    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setIsVisible(false), 200);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[2000] h-1 w-full">
      <div
        className="h-full w-full origin-left bg-brand-moss shadow-[0_0_10px_#1A4D2E] transition-transform duration-300 ease-out"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
};

export default TopProgressBar;
