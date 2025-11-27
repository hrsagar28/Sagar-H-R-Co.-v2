import React from 'react';
import Skeleton from '../Skeleton';

const ContactSkeleton: React.FC = () => (
  <div className="pt-32 px-4 max-w-7xl mx-auto">
    <div className="mb-12">
      <Skeleton variant="text" width={100} height={20} className="mb-4" />
      <Skeleton variant="text" width={300} height={60} className="mb-4" />
      <Skeleton variant="text" width={200} height={20} />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <Skeleton variant="rectangular" className="h-[600px] w-full rounded-[3rem]" />
      <Skeleton variant="rectangular" className="h-[600px] w-full rounded-[3rem]" />
    </div>
  </div>
);

export default ContactSkeleton;