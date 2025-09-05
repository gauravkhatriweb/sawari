import React from 'react';
import { motion } from 'framer-motion';

/**
 * BookFlowErrorBoundary - Comprehensive error boundary for the booking flow
 * with glassmorphism styling and recovery mechanisms
 */

class BookFlowErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('BookFlow Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external error tracking (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          errorBoundary: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          section: 'booking-flow'
        }
      });
    }
  }

  handleRetry = () => {
    const { onRetry } = this.props;
    const newRetryCount = this.state.retryCount + 1;
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount
    });

    // Call custom retry handler if provided
    if (onRetry) {
      onRetry(newRetryCount);
    }
  };

  handleGoHome = () => {
    const { onGoHome } = this.props;
    
    if (onGoHome) {
      onGoHome();
    } else {
      // Default navigation to home
      window.location.href = '/passenger/home';
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, maxRetries = 3 } = this.props;
      const { error, retryCount } = this.state;
      
      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            retryCount={retryCount}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default error UI
      return (
        <ErrorFallbackUI
          error={error}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback UI component
const ErrorFallbackUI = ({ 
  error, 
  retryCount, 
  maxRetries, 
  onRetry, 
  onGoHome 
}) => {
  const canRetry = retryCount < maxRetries;
  
  // Determine error type and message
  const getErrorDetails = () => {
    if (error?.message?.includes('ChunkLoadError') || error?.message?.includes('Loading chunk')) {
      return {
        title: 'Update Required',
        message: 'A new version is available. Please refresh the page to continue.',
        icon: '🔄',
        action: 'refresh'
      };
    }
    
    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      return {
        title: 'Connection Issue',
        message: 'Please check your internet connection and try again.',
        icon: '📡',
        action: 'retry'
      };
    }
    
    if (error?.message?.includes('Location') || error?.message?.includes('GPS')) {
      return {
        title: 'Location Access',
        message: 'Unable to access your location. You can still book manually.',
        icon: '📍',
        action: 'continue'
      };
    }
    
    return {
      title: 'Something Went Wrong',
      message: 'We encountered an unexpected error. Our team has been notified.',
      icon: '⚠️',
      action: 'retry'
    };
  };

  const errorDetails = getErrorDetails();

  const handlePrimaryAction = () => {
    switch (errorDetails.action) {
      case 'refresh':
        window.location.reload();
        break;
      case 'retry':
        if (canRetry) onRetry();
        break;
      case 'continue':
        onGoHome();
        break;
      default:
        if (canRetry) onRetry();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-aqua/20 flex items-center justify-center p-4">
      <motion.div
        className="glass-card rounded-2xl p-8 text-center max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Error Icon */}
        <motion.div
          className="text-6xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {errorDetails.icon}
        </motion.div>

        {/* Error Title */}
        <motion.h2
          className="text-2xl font-bold text-theme-primary mb-4 font-poppins"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {errorDetails.title}
        </motion.h2>

        {/* Error Message */}
        <motion.p
          className="text-theme-secondary mb-6 font-inter leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {errorDetails.message}
        </motion.p>

        {/* Retry Count Indicator */}
        {retryCount > 0 && (
          <motion.div
            className="text-sm text-theme-subtle mb-4 font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Attempt {retryCount} of {maxRetries}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Primary Action Button */}
          <button
            onClick={handlePrimaryAction}
            disabled={!canRetry && errorDetails.action === 'retry'}
            className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-medium font-inter transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[120px]"
          >
            {errorDetails.action === 'refresh' && '🔄 Refresh Page'}
            {errorDetails.action === 'retry' && (canRetry ? '🔄 Try Again' : '❌ Max Retries')}
            {errorDetails.action === 'continue' && '🏠 Continue'}
          </button>

          {/* Secondary Action Button */}
          <button
            onClick={onGoHome}
            className="px-6 py-3 glass-bg glass-border text-theme-primary rounded-xl font-medium font-inter transition-all duration-300 hover:glass-hover-bg hover:scale-105 min-w-[120px]"
          >
            🏠 Go Home
          </button>
        </motion.div>

        {/* Technical Details (Development Mode) */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            className="mt-6 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <summary className="cursor-pointer text-sm text-theme-subtle hover:text-theme-secondary transition-colors font-inter">
              🔍 Technical Details
            </summary>
            <div className="mt-3 p-4 bg-theme-surface-elevated rounded-lg text-xs font-mono text-theme-secondary overflow-auto max-h-32">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              <div>
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
              </div>
            </div>
          </motion.details>
        )}
      </motion.div>
    </div>
  );
};

// Hook for using error boundary programmatically
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const reportError = React.useCallback((error, errorInfo = {}) => {
    console.error('Manual error report:', error, errorInfo);
    
    // Report to external service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        extra: errorInfo,
        tags: { section: 'booking-flow' }
      });
    }
    
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to trigger error boundary
  if (error) {
    throw error;
  }

  return { reportError, clearError };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <BookFlowErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </BookFlowErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default BookFlowErrorBoundary;
export { ErrorFallbackUI };