import React, { ErrorInfo, ReactNode } from 'react';
import { CONTACT_INFO } from '../config/contact';
import { logger } from '../utils/logger';

interface Props {
  children?: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches an error in one page (most often its code failing to download after
 * the site has been updated) and offers a reload, while the top bar and footer
 * stay in place. Styles in index.css (.sx-err).
 */
class RouteErrorBoundary extends React.Component<Props, RouteErrorBoundaryState> {
  public state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: Error): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Route Error:', error, errorInfo);
  }

  handleRetry = () => {
    // For route-level errors (often chunk loading failures),
    // a window reload is usually the safest way to recover.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="sx-err">
          <div>
            <h2>This page could not load</h2>
            <p>
              The site may have been updated since you opened it, or the connection dropped. Reloading the page usually
              fixes this.
            </p>
            <button type="button" className="sx-btn" onClick={this.handleRetry}>
              Reload the page
            </button>
            <p className="sx-small">
              If it keeps happening, call <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>{' '}
              or email <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
