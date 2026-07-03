import React from 'react';
import Skeleton from '../Skeleton';

// UX-2: the Contact page renders in the near-black `editorial` zone with a
// 12-column 4/8 split (see pages/Contact.tsx). The old skeleton was light with
// a 2-column layout, so users saw a light flash that snapped to dark and a
// layout jump. This mirrors the real zone + grid so the transition is seamless.
const ContactSkeleton: React.FC = () => (
  <div data-zone="editorial" className="zone-bg min-h-screen">
    <div className="mx-auto max-w-7xl px-4 pt-32 md:px-6">
      <div className="mb-12">
        <Skeleton variant="text" width={140} height={16} className="mb-4" />
        <Skeleton variant="text" width={320} height={56} className="mb-4" />
        <Skeleton variant="text" width={220} height={16} />
      </div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <Skeleton variant="rectangular" className="h-[520px] w-full rounded-[2.5rem] lg:col-span-4" />
        <Skeleton variant="rectangular" className="h-[520px] w-full rounded-[2.5rem] lg:col-span-8" />
      </div>
    </div>
  </div>
);

export default ContactSkeleton;
