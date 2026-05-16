import React from 'react';
import Skeleton from './Skeleton';

interface PageLoaderProps {
  tone?: 'paper' | 'ink';
}

const PageLoader: React.FC<PageLoaderProps> = ({ tone = 'paper' }) => {
  const isInk = tone === 'ink';
  const surfaceClass = isInk ? 'bg-brand-black text-white' : 'bg-brand-bg text-brand-dark';
  const skeletonClass = isInk ? 'bg-white/10' : '';
  const cardClass = isInk ? 'border-white/10 bg-white/5' : 'border-brand-border bg-brand-surface/50';

  return (
    <div className={`min-h-screen w-full ${surfaceClass}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 p-4 pt-24 md:p-8 md:pt-32">
        {/* Hero Section Skeleton */}
        <div className="max-w-4xl animate-fade-in-up space-y-6">
          <Skeleton variant="text" width={120} className={`mb-6 ${skeletonClass}`} />
          <div className="space-y-3">
            <Skeleton variant="rectangular" className={`h-16 w-3/4 md:h-24 md:w-2/3 ${skeletonClass}`} />
            <Skeleton variant="rectangular" className={`h-16 w-1/2 md:h-24 md:w-1/3 ${skeletonClass}`} />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton variant="text" className={`h-6 w-full max-w-xl ${skeletonClass}`} />
            <Skeleton variant="text" className={`h-6 w-2/3 max-w-lg ${skeletonClass}`} />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex h-72 flex-col justify-between rounded-[2rem] border p-8 ${cardClass}`}>
              <Skeleton variant="circular" width={56} height={56} className={`mb-4 ${skeletonClass}`} />
              <div className="w-full space-y-4">
                <Skeleton variant="text" className={`h-8 w-3/4 ${skeletonClass}`} />
                <div className="space-y-2">
                  <Skeleton variant="text" className={`h-4 w-full ${skeletonClass}`} />
                  <Skeleton variant="text" className={`h-4 w-5/6 ${skeletonClass}`} />
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
