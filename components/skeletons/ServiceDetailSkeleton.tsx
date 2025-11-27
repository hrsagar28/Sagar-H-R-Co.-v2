import React from 'react';
import Skeleton from '../Skeleton';

const ServiceDetailSkeleton: React.FC = () => (
  <div className="pt-32 px-4 max-w-7xl mx-auto">
    <Skeleton variant="text" className="w-32 h-6 mb-4" />
    <Skeleton variant="text" className="w-24 h-4 mb-8" />
    <div className="space-y-4 mb-12">
      <Skeleton variant="rectangular" className="h-20 w-3/4" />
      <Skeleton variant="rectangular" className="h-20 w-1/2" />
    </div>
    <Skeleton variant="text" className="w-full max-w-2xl h-6 mb-4" />
    <Skeleton variant="text" className="w-full max-w-xl h-6" />
  </div>
);

export default ServiceDetailSkeleton;