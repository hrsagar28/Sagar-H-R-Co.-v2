import React from 'react';

interface PageLoaderProps {
  tone?: 'paper' | 'ink';
}

/**
 * Shown for a moment while a page's code loads: the dark top strip of the
 * new design, then the page colour with two faint lines where the title and
 * introduction will appear. 'ink' is for pages that open on a dark band.
 * Styles in index.css (.sx-loader), since redesign.css may not be loaded yet.
 */
const PageLoader: React.FC<PageLoaderProps> = ({ tone = 'paper' }) => (
  <div className={`sx-loader ${tone === 'ink' ? 'ink' : ''}`} aria-busy="true">
    <span className="h" />
    <span className="p" />
    <p className="sr-only" role="status">
      Loading
    </p>
  </div>
);

export default PageLoader;
