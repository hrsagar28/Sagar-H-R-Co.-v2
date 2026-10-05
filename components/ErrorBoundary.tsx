import React, { ErrorInfo, ReactNode } from 'react';
import { CONTACT_INFO } from '../config/contact';
import { logger } from '../utils/logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error logged for monitoring services in production
    logger.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  /** A prefilled email with what went wrong, for the "email us about it" link. */
  private reportHref = () => {
    const subject = encodeURIComponent('Website error');
    const body = encodeURIComponent(
      `What were you doing when this happened?\n\n\n--- Technical details ---\nPage: ${window.location.href}\nError: ${
        this.state.error?.message || 'Unknown'
      }\nStack: ${this.state.errorInfo?.componentStack || 'Unavailable'}`.slice(0, 1500),
    );
    return `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError =
        this.state.error?.message.includes('Loading chunk') ||
        this.state.error?.message.includes('Failed to fetch dynamically imported module');

      // 2026 redesign: the dark top strip with the firm's name, then a plain
      // message on the page colour. Styles in index.css (.sx-crash, .sx-err),
      // because the app has failed and redesign.css may not have loaded.
      return (
        <div className="sx-crash">
          <div className="sx-crash-top">
            <a href="/">Sagar H R &amp; Co.</a>
          </div>
          <main className="sx-err">
            <div>
              <h1>{isChunkError ? 'The site has been updated' : 'Something went wrong'}</h1>
              <p>
                {isChunkError
                  ? 'A newer version of the site is available. Reload the page to carry on.'
                  : 'This page stopped working. Reloading it usually fixes the problem.'}
              </p>
              <button type="button" className="sx-btn" onClick={() => window.location.reload()}>
                Reload the page
              </button>
              <a className="sx-alt" href="/">
                Go to the home page
              </a>
              <p className="sx-small">
                {isChunkError ? (
                  <>
                    If it keeps happening, call{' '}
                    <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>.
                  </>
                ) : (
                  <>
                    If it keeps happening, call{' '}
                    <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a> or{' '}
                    <a href={this.reportHref()}>email us about it</a>.
                  </>
                )}
              </p>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
