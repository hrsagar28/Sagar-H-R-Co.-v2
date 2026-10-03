import React from 'react';

/**
 * Suspense fallback for the redesigned pages: the dark header band with the
 * heading and intro as placeholder bars, so the page arrives without a jump.
 * Styled by redesign.css, which RedesignLayout has already loaded by the time
 * this can render.
 */
const RdPageSkeleton: React.FC = () => (
  <div className="rd-page" aria-busy="true">
    <div className="phead">
      <div className="hgrid pad">
        <div>
          <span className="skel-line skel-h1" />
          <span className="skel-line skel-p" />
          <span className="skel-line skel-p" />
        </div>
      </div>
    </div>
    <div className="skel-body">
      <p className="vh" role="status">
        Loading
      </p>
    </div>
  </div>
);

export default RdPageSkeleton;
