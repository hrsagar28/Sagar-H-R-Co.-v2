import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class RouteErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Route Error:", error, errorInfo);
  }

  handleRetry = () => {
    // For route-level errors (often chunk loading failures), 
    // a window reload is usually the safest way to recover.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-brand-bg/50 rounded-2xl border border-brand-border my-8">
          <AlertCircle className="text-red-500 mb-4" size={32} />
          <h3 className="text-xl font-heading font-bold text-brand-dark mb-2">
            Unable to load content
          </h3>
          <p className="text-brand-stone mb-6 max-w-md">
            We encountered an unexpected error while loading this section.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2 bg-brand-dark text-white rounded-full font-bold text-sm flex items-center gap-2 hover:bg-brand-moss transition-colors"
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