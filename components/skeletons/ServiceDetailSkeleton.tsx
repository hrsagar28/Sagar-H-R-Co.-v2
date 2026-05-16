import React from 'react';
import Skeleton from '../Skeleton';

const ServiceDetailSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 pt-32">
    <Skeleton variant="text" className="mb-4 h-6 w-32" />
    <Skeleton variant="text" className="mb-8 h-4 w-24" />
    <div className="mb-12 space-y-4">
      <Skeleton variant="rectangular" className="h-20 w-3/4" />
      <Skeleton variant="rectangular" className="h-20 w-1/2" />
    </div>
    <Skeleton variant="text" className="mb-4 h-6 w-full max-w-2xl" />
    <Skeleton variant="text" className="h-6 w-full max-w-xl" />
  </div>
);

export default ServiceDetailSkeleton;
