import React from 'react';
import Skeleton from './Skeleton';

interface PageLoaderProps {
  tone?: 'paper' | 'ink';
}

const PageLoader: React.FC<PageLoaderProps> = ({ tone = 'paper' }) => {
  const isInk = tone === 'ink';
  const surfaceClass = isInk ? 'bg-brand-black text-white' : 'bg-brand-bg text-brand-dark';
  const skeletonClass = isInk ? 'bg-white/10' : '';
  const cardClass = isInk
    ? 'border-white/10 bg-white/5'
    : 'border-brand-border bg-brand-surface/50';

  return (
    <div className={`min-h-screen w-full ${surfaceClass}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 p-4 pt-24 md:p-8 md:pt-32">
        {/* Hero Section Skeleton */}
        <div className="space-y-6 max-w-4xl animate-fade-in-up">
          <Skeleton variant="text" width={120} className={`mb-6 ${skeletonClass}`} />
          <div className="space-y-3">
            <Skeleton variant="rectangular" className={`h-16 md:h-24 w-3/4 md:w-2/3 ${skeletonClass}`} />
            <Skeleton variant="rectangular" className={`h-16 md:h-24 w-1/2 md:w-1/3 ${skeletonClass}`} />
          </div>
          <div className="pt-4 space-y-3">
            <Skeleton variant="text" className={`w-full max-w-xl h-6 ${skeletonClass}`} />
            <Skeleton variant="text" className={`w-2/3 max-w-lg h-6 ${skeletonClass}`} />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`p-8 border rounded-[2rem] h-72 flex flex-col justify-between ${cardClass}`}>
              <Skeleton variant="circular" width={56} height={56} className={`mb-4 ${skeletonClass}`} />
              <div className="space-y-4 w-full">
                <Skeleton variant="text" className={`w-3/4 h-8 ${skeletonClass}`} />
                <div className="space-y-2">
                  <Skeleton variant="text" className={`w-full h-4 ${skeletonClass}`} />
                  <Skeleton variant="text" className={`w-5/6 h-4 ${skeletonClass}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
