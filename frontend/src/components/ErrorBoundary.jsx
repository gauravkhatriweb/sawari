import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] text-white">
          <div className="max-w-lg mx-auto p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
            <h1 className="text-2xl font-bold mb-4 text-red-400">
              🚨 Component Error Detected
            </h1>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-red-300">Error:</h3>
                <p className="text-sm text-red-200 font-mono bg-red-900/30 p-2 rounded">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>
              
              {this.state.errorInfo && (
                <div>
                  <h3 className="font-semibold text-red-300">Stack Trace:</h3>
                  <pre className="text-xs text-red-200 font-mono bg-red-900/30 p-2 rounded overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Reload Page
                </button>
                <button 
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;