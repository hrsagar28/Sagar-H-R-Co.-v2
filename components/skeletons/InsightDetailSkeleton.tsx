import React from 'react';
import Skeleton from '../Skeleton';

const InsightDetailSkeleton: React.FC = () => (
  <div className="pt-32 px-4 max-w-4xl mx-auto">
    <div className="flex justify-center mb-10">
      <Skeleton variant="text" width={200} height={20} />
    </div>
    <div className="text-center mb-16">
       <div className="flex justify-center mb-6">
         <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
       </div>
       <div className="flex justify-center mb-8">
         <Skeleton variant="text" width="80%" height={60} />
       </div>
       <div className="flex justify-center gap-4">
         <Skeleton variant="text" width={100} />
         <Skeleton variant="text" width={100} />
         <Skeleton variant="text" width={100} />
       </div>
    </div>
    <div className="space-y-6">
      <Skeleton variant="rectangular" className="w-full h-40" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-2/3 h-4" />
    </div>
  </div>
);

export default InsightDetailSkeleton;