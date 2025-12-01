
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { useLocation } = ReactRouterDOM;

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
    <div className="fixed top-0 left-0 w-full h-1 z-[2000] pointer-events-none">
      <div 
        className="h-full bg-brand-moss shadow-[0_0_10px_#1A4D2E] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TopProgressBar;