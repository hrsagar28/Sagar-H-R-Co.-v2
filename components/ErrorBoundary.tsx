
import React, { Component, ErrorInfo, ReactNode } from 'react';
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

class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error logged for monitoring services in production
    logger.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopyError = () => {
    const errorText = `Error: ${this.state.error?.message}\n\nStack: ${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorText);
    // Simple alert feedback since we can't use hooks here easily without wrapping
    alert('Error details copied to clipboard');
  };

  private handleReportIssue = () => {
    try {
      const subject = encodeURIComponent(`Issue Report: ${this.state.error?.message?.slice(0, 50)}`);
      const body = encodeURIComponent(`Please describe what you were doing when the error occurred:\n\n\n--- Technical Details ---\nError: ${this.state.error?.message}\nStack: ${this.state.errorInfo?.componentStack}`);
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

      const isChunkError = this.state.error?.message.includes('Loading chunk') || 
                           this.state.error?.message.includes('Failed to fetch dynamically imported module');

      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
          <div className="max-w-xl w-full text-center">
             <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-100">
                   <span className="text-4xl font-heading font-bold">!</span>
                </div>
             </div>
             
             <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-6">
               {isChunkError ? 'New Version Available' : 'Something went wrong.'}
             </h1>
             
             <p className="text-brand-stone text-lg mb-10 leading-relaxed">
               {isChunkError 
                 ? 'A new version of the app has been released. Please refresh the page to load the latest content.'
                 : 'We apologize for the inconvenience. Our team has been notified. Please try refreshing the page.'
               }
             </p>

             <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-8 py-4 bg-brand-dark text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-brand-moss transition-colors shadow-lg w-full"
                >
                  <RefreshCcw size={18} /> {isChunkError ? 'Update Now' : 'Try Again'}
                </button>
                
                <a 
                  href="/" 
                  className="px-8 py-4 bg-white border border-brand-border text-brand-dark rounded-full font-bold flex items-center justify-center gap-2 hover:bg-brand-bg transition-colors w-full"
                >
                  <Home size={18} /> Return Home
                </a>

                {!isChunkError && (
                  <div className="flex gap-4 mt-4 justify-center">
                    <button 
                      onClick={this.handleCopyError}
                      className="text-brand-stone hover:text-brand-dark text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      <Copy size={14} /> Copy Error
                    </button>
                    <button 
                      onClick={this.handleReportIssue}
                      className="text-brand-stone hover:text-brand-dark text-sm font-bold uppercase tracking-wider flex items-center gap-2"
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
