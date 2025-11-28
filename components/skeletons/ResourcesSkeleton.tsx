import React from 'react';
import Skeleton from '../Skeleton';

const ResourcesSkeleton: React.FC = () => (
  <div className="bg-brand-bg min-h-screen">
    {/* Hero */}
    <div className="pt-32 pb-20 px-4 md:px-6 border-b border-brand-border/60">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-5xl">
          <Skeleton variant="rectangular" width={120} height={24} className="rounded-full mb-8" />
          <Skeleton variant="text" width="50%" height={80} className="mb-4" />
          <Skeleton variant="text" width="20%" height={80} className="mb-10" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="p-4 bg-brand-surface rounded-[2rem] border border-brand-border space-y-2">
              <Skeleton variant="rectangular" height={56} className="w-full rounded-xl" />
              <Skeleton variant="rectangular" height={56} className="w-full rounded-xl" />
              <Skeleton variant="rectangular" height={56} className="w-full rounded-xl" />
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3 w-full">
            <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border h-[600px] flex flex-col gap-8">
               <div className="flex justify-between items-center">
                 <div className="space-y-2">
                   <Skeleton variant="text" width={250} height={40} />
                   <Skeleton variant="text" width={180} height={20} />
                 </div>
                 <Skeleton variant="circular" width={48} height={48} />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
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