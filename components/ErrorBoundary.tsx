import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error logged for monitoring services in production
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
          <div className="max-w-xl w-full text-center">
             <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-100">
                   <span className="text-4xl font-heading font-bold">!</span>
                </div>
             </div>
             <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-6">
               Something went wrong.
             </h1>
             <p className="text-brand-stone text-lg mb-10 leading-relaxed">
               We apologize for the inconvenience. Our team has been notified. Please try refreshing the page.
             </p>
             <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-8 py-4 bg-brand-dark text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-brand-moss transition-colors shadow-lg"
                >
                  <RefreshCcw size={18} /> Try Again
                </button>
                <a 
                  href="/" 
                  className="px-8 py-4 bg-white border border-brand-border text-brand-dark rounded-full font-bold flex items-center justify-center gap-2 hover:bg-brand-bg transition-colors"
                >
                  <Home size={18} /> Return Home
                </a>
             </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;