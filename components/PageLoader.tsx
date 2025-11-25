import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg transition-opacity duration-500">
      <div className="relative w-16 h-16 mb-6">
         <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-border/30 rounded-full"></div>
         <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-moss rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="text-brand-moss text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
        Loading
      </div>
    </div>
  );
};

export default PageLoader;