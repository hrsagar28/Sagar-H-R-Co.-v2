import React from 'react';

// Inertia scrolling logic removed to favor native browser scrolling behavior.
// This component now acts as a simple pass-through fragment to maintain app structure
// without interfering with native scroll events, stacking contexts, or sticky positioning.
const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
       {children}
    </>
  );
};

export default SmoothScroll;