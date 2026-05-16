import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children?: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

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
        <div className="my-8 flex flex-col items-center justify-center rounded-2xl border border-brand-border bg-brand-bg/50 p-8 text-center">
          <AlertCircle className="mb-4 text-red-500" size={32} />
          <h3 className="mb-2 font-heading text-xl font-bold text-brand-dark">Unable to load content</h3>
          <p className="mb-6 max-w-md text-brand-stone">
            We encountered an unexpected error while loading this section.
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-full bg-brand-dark px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-brass"
          >
            <RefreshCw size={14} /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
