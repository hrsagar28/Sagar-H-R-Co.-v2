import type React from 'react';
import type { NavigateFunction } from 'react-router-dom';

/**
 * FQ-09: an FAQ answer renders from an HTML string, so its internal links are
 * plain <a> tags that would otherwise reload the whole document. Put this on
 * the answer's wrapper: same-origin paths go through the router; modified
 * clicks, new-tab links, external URLs, mailto:/tel: and in-page hash jumps
 * keep the browser's behaviour. Used by the FAQ page and the home page.
 */
export const routeAnswerClick = (event: React.MouseEvent<HTMLElement>, navigate: NavigateFunction) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const anchor = (event.target as HTMLElement).closest('a');
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return;
  }
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.hash)) {
    return;
  }
  event.preventDefault();
  navigate(`${url.pathname}${url.search}${url.hash}`);
};
