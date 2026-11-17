import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'अपेक्षित नसलेली त्रुटी आली.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bhagwa-canvas flex items-center justify-center p-4 font-noto">
          <div className="bg-white border-2 border-[#e9bd92] rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#5c1d05]">
              काही तांत्रिक अडचण आली आहे
            </h2>
            <p className="text-sm text-[#431407]">
              कृपया पान रिफ्रेश करून पुन्हा प्रयत्न करा.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bhagwa-texture-deep hover:brightness-95 text-white rounded-xl text-sm font-bold cursor-pointer border border-[#9a3412]"
            >
              <RefreshCw className="w-4 h-4" />
              पुन्हा लोड करा
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
