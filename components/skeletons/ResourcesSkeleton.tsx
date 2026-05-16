import React from 'react';
import Skeleton from '../Skeleton';

const ResourcesSkeleton: React.FC = () => (
  <div className="min-h-screen bg-brand-bg">
    {/* Hero */}
    <div className="border-b border-brand-border/60 px-4 pb-20 pt-32 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-5xl">
          <Skeleton variant="rectangular" width={120} height={24} className="mb-8 rounded-full" />
          <Skeleton variant="text" width="50%" height={80} className="mb-4" />
          <Skeleton variant="text" width="20%" height={80} className="mb-10" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="px-4 py-12 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="space-y-2 rounded-[2rem] border border-brand-border bg-brand-surface p-4">
              <Skeleton variant="rectangular" height={56} className="w-full rounded-xl" />
              <Skeleton variant="rectangular" height={56} className="w-full rounded-xl" />
              <Skeleton variant="rectangular" height={56} className="w-full rounded-xl" />
            </div>
          </div>

          {/* Main Panel */}
          <div className="w-full lg:col-span-3">
            <div className="flex h-[600px] flex-col gap-8 rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 md:p-12">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton variant="text" width={250} height={40} />
                  <Skeleton variant="text" width={180} height={20} />
                </div>
                <Skeleton variant="circular" width={48} height={48} />
              </div>

              <div className="grid flex-grow grid-cols-1 gap-6 md:grid-cols-2">
                <Skeleton variant="rectangular" className="h-full w-full rounded-2xl" />
                <Skeleton variant="rectangular" className="h-full w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ResourcesSkeleton;
