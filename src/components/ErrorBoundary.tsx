
import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-2xl font-semibold text-red-900">Something went wrong</h2>
            <p className="mt-3 text-sm text-red-700">We couldn't load this section. Please refresh or try again later.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
