import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, Home, Copy, Mail } from 'lucide-react';
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

  private handleCopyError = () => {
    const errorText = `Error: ${this.state.error?.message}\n\nStack: ${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorText);
    alert('Error details copied to clipboard');
  };

  private handleReportIssue = () => {
    try {
      const subject = encodeURIComponent(`Issue Report: ${this.state.error?.message?.slice(0, 50) || 'Website error'}`);
      const rawBody = `Please describe what you were doing when the error occurred:\n\n\n--- Technical Details ---\nError: ${this.state.error?.message || 'Unknown'}\nStack: ${this.state.errorInfo?.componentStack || 'Unavailable'}`;
      const body = encodeURIComponent(rawBody.slice(0, 1500));
      window.location.href = `mailto:mail@casagar.co.in?subject=${subject}&body=${body}`;
    } catch (e) {
      logger.warn('Failed to open mail client automatically', e);
      alert('Could not open mail client. Please email us at mail@casagar.co.in');
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError =
        this.state.error?.message.includes('Loading chunk') ||
        this.state.error?.message.includes('Failed to fetch dynamically imported module');

      return (
        <div className="flex min-h-screen items-center justify-center bg-brand-bg p-6">
          <div className="w-full max-w-xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500">
                <span className="font-heading text-4xl font-bold">!</span>
              </div>
            </div>

            <h1 className="mb-6 font-heading text-4xl font-bold text-brand-dark md:text-5xl">
              {isChunkError ? 'New Version Available' : 'Something went wrong.'}
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-brand-stone">
              {isChunkError
                ? 'A new version of the app has been released. Please refresh the page to load the latest content.'
                : 'We apologize for the inconvenience. Our team has been notified. Please try refreshing the page.'}
            </p>

            <div className="mx-auto flex max-w-sm flex-col gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-dark px-8 py-4 font-bold text-white shadow-lg transition-colors hover:bg-brand-moss"
              >
                <RefreshCcw size={18} /> {isChunkError ? 'Update Now' : 'Try Again'}
              </button>

              <a
                href="/"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-8 py-4 font-bold text-brand-dark transition-colors hover:bg-brand-bg"
              >
                <Home size={18} /> Return Home
              </a>

              {!isChunkError && (
                <div className="mt-4 flex justify-center gap-4">
                  <button
                    onClick={this.handleCopyError}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-stone hover:text-brand-dark"
                  >
                    <Copy size={14} /> Copy Error
                  </button>
                  <button
                    onClick={this.handleReportIssue}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-stone hover:text-brand-dark"
                  >
                    <Mail size={14} /> Report Issue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
