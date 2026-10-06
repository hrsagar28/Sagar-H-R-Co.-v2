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
    // A 2px copper line (index.css, .sx-progress).
    <div className="sx-progress" aria-hidden="true">
      <i style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
};

export default TopProgressBar;
