/**
 * ErrorBoundary.jsx - React Error Boundary Component
 * 
 * A React error boundary that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * Features glassmorphism design consistent with the app's theme and provides user-friendly
 * error recovery options.
 * 
 * Key Features:
 * - Catches and handles React component errors
 * - Displays user-friendly fallback UI with glassmorphism styling
 * - Provides retry and navigation options
 * - Logs errors for debugging purposes
 * - Responsive design with smooth animations
 * - Consistent with app's design system
 * 
 * Usage:
 * ```jsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * ErrorBoundary Component
 * 
 * React class component that implements error boundary functionality.
 * Catches errors during rendering, in lifecycle methods, and in constructors
 * of the whole tree below them.
 */
class ErrorBoundary extends React.Component {
  /**
   * Constructor - Initialize error boundary state
   * @param {Object} props - Component props
   */
  constructor(props) {
    super(props);
    // Initialize state to track error status and details
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Static method called when an error is thrown during rendering
   * Updates state to trigger fallback UI rendering
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state object
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  /**
   * Lifecycle method called when an error is caught
   * Logs error details and updates state with error information
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Object with componentStack key containing information about component stack
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Store error details in state for potential display or reporting
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  /**
   * Handle retry action - Reset error boundary state
   * Allows users to attempt to recover from the error
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  /**
   * Handle navigation to home page
   * Provides escape route when retry doesn't work
   */
  handleGoHome = () => {
    window.location.href = '/passenger';
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with glassmorphism styling
      return (
        <div className="min-h-screen bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-aqua/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card rounded-2xl p-8 text-center"
          >
            {/* Error Icon */}
            <div className="text-6xl mb-6">⚠️</div>
            
            {/* Error Title */}
            <h1 className="text-2xl font-bold text-theme-primary mb-4 font-poppins">
              Something went wrong
            </h1>
            
            {/* Error Message */}
            <p className="text-theme-secondary mb-6 font-inter">
              We encountered an unexpected error while loading the booking page. 
              Don't worry, your data is safe.
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 px-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium font-inter"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full py-3 px-6 glass-border text-theme-primary rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm font-inter"
              >
                Go to Home
              </button>
            </div>
            
            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-theme-subtle cursor-pointer hover:text-theme-secondary transition-colors">
                  Error Details (Dev Only)
                </summary>
                <div className="mt-2 p-3 bg-black/20 rounded-lg text-xs text-theme-subtle font-mono overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;