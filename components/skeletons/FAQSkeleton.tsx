import React from 'react';
import Skeleton from '../Skeleton';

const FAQSkeleton: React.FC = () => (
  <div className="bg-brand-bg min-h-screen">
    {/* Hero */}
    <div className="pt-32 pb-20 px-4 md:px-6 border-b border-brand-border/60">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-5xl">
          <Skeleton variant="rectangular" width={100} height={24} className="rounded-full mb-8" />
          <Skeleton variant="text" width="60%" height={80} className="mb-4" />
          <Skeleton variant="text" width="30%" height={80} className="mb-10" />
          <Skeleton variant="text" width="80%" height={24} />
        </div>
      </div>
    </div>

    <div className="py-20 px-4 md:px-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {[1, 2, 3].map((group) => (
          <div key={group} className="mb-16">
            <Skeleton variant="text" width={200} height={32} className="mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Skeleton 
                  key={item} 
                  variant="rectangular" 
                  height={80} 
                  className="w-full rounded-3xl" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FAQSkeleton;