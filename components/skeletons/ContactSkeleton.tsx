import React from 'react';
import Skeleton from '../Skeleton';

const ContactSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 pt-32">
    <div className="mb-12">
      <Skeleton variant="text" width={100} height={20} className="mb-4" />
      <Skeleton variant="text" width={300} height={60} className="mb-4" />
      <Skeleton variant="text" width={200} height={20} />
    </div>
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <Skeleton variant="rectangular" className="h-[600px] w-full rounded-[3rem]" />
      <Skeleton variant="rectangular" className="h-[600px] w-full rounded-[3rem]" />
    </div>
  </div>
);

export default ContactSkeleton;
