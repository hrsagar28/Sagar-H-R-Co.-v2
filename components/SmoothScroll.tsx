import React from 'react';

// Inertia scrolling has been removed to favor native browser scrolling 
// which supports 120Hz/ProMotion displays naturally and provides a better UX on mobile.
const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full min-h-screen relative">
       {children}
    </div>
  );
};

export default SmoothScroll;