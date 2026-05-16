import React from 'react';
import Skeleton from '../Skeleton';

const InsightDetailSkeleton: React.FC = () => (
  <div className="mx-auto max-w-4xl px-4 pt-32">
    <div className="mb-10 flex justify-center">
      <Skeleton variant="text" width={200} height={20} />
    </div>
    <div className="mb-16 text-center">
      <div className="mb-6 flex justify-center">
        <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
      </div>
      <div className="mb-8 flex justify-center">
        <Skeleton variant="text" width="80%" height={60} />
      </div>
      <div className="flex justify-center gap-4">
        <Skeleton variant="text" width={100} />
        <Skeleton variant="text" width={100} />
        <Skeleton variant="text" width={100} />
      </div>
    </div>
    <div className="space-y-6">
      <Skeleton variant="rectangular" className="h-40 w-full" />
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>
  </div>
);

export default InsightDetailSkeleton;
