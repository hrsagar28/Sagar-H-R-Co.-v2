import React from 'react';
import Skeleton from './Skeleton';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-brand-bg p-4 md:p-8 pt-24 md:pt-32 max-w-7xl mx-auto flex flex-col gap-12">
       {/* Hero Section Skeleton */}
       <div className="space-y-6 max-w-4xl animate-fade-in-up">
          <Skeleton variant="text" width={120} className="mb-6" />
          <div className="space-y-3">
            <Skeleton variant="rectangular" className="h-16 md:h-24 w-3/4 md:w-2/3" />
            <Skeleton variant="rectangular" className="h-16 md:h-24 w-1/2 md:w-1/3" />
          </div>
          <div className="pt-4 space-y-3">
             <Skeleton variant="text" className="w-full max-w-xl h-6" />
             <Skeleton variant="text" className="w-2/3 max-w-lg h-6" />
          </div>
       </div>

       {/* Grid Skeleton */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {[1, 2, 3].map(i => (
             <div key={i} className="p-8 border border-brand-border rounded-[2rem] h-72 flex flex-col justify-between bg-brand-surface/50">
                <Skeleton variant="circular" width={56} height={56} className="mb-4" />
                <div className="space-y-4 w-full">
                   <Skeleton variant="text" className="w-3/4 h-8" />
                   <div className="space-y-2">
                     <Skeleton variant="text" className="w-full h-4" />
                     <Skeleton variant="text" className="w-5/6 h-4" />
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default PageLoader;