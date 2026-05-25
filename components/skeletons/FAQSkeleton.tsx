import React from 'react';
import Skeleton from '../Skeleton';

/**
 * Loading skeleton for the FAQ route. FQ-10: mirrors the real page layout —
 * `max-w-6xl` body, the mobile/tablet category-nav bar, and the desktop
 * sidebar + content grid — so the lazy chunk resolving doesn't shift layout.
 */
const FAQSkeleton: React.FC = () => (
  <div className="min-h-screen bg-brand-bg">
    {/* Hero — matches HeroBasic spacing */}
    <div className="px-4 pb-20 pt-32 md:px-6 md:pt-48">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-5xl">
          <Skeleton variant="rectangular" width={90} height={28} className="mb-8 rounded-full" />
          <Skeleton variant="text" width="55%" height={88} className="mb-4" />
          <Skeleton variant="text" width="32%" height={88} className="mb-10" />
          <Skeleton variant="text" width="70%" height={24} />
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="px-4 py-20 md:px-6">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Category nav — mobile / tablet only */}
        <Skeleton variant="rectangular" height={128} className="mb-12 w-full rounded-3xl lg:hidden" />

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block">
            <Skeleton variant="text" width={120} height={16} className="mb-5" />
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} variant="rectangular" height={46} className="w-full rounded-2xl" />
              ))}
            </div>
          </aside>

          {/* Question groups */}
          <div className="space-y-16">
            {[1, 2, 3].map((group) => (
              <div key={group}>
                <Skeleton variant="text" width={220} height={32} className="mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} variant="rectangular" height={92} className="w-full rounded-3xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FAQSkeleton;
