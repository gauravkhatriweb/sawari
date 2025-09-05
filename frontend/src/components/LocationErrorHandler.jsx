/**
 * LocationErrorHandler.jsx - Location Services Error Management Component
 * 
 * A comprehensive error handling component for location-based operations.
 * Provides intelligent error categorization, user-friendly messages, and retry mechanisms.
 * Handles various location service errors including permissions, network issues, and rate limits.
 * 
 * Key Features:
 * - Intelligent error categorization and messaging
 * - Automatic retry mechanisms with exponential backoff
 * - User-friendly error displays with icons and actions
 * - Rate limiting protection
 * - Network connectivity handling
 * - Permission request management
 * - Toast notifications for quick feedback
 * - Smooth animations with Framer Motion
 * - Accessibility support
 * 
 * Error Types Handled:
 * - Rate Limit: API quota exceeded
 * - Network: Connection issues
 * - Permission: Location access denied
 * - Timeout: Request timeout
 * - Service: Location service unavailable
 * - Generic: Fallback for unknown errors
 * 
 * Usage:
 * ```jsx
 * <LocationErrorHandler onRetry={handleLocationRetry}>
 *   <LocationComponent />
 * </LocationErrorHandler>
 * ```
 * 
 * Hook Usage:
 * ```jsx
 * const { handleError, clearError } = useLocationErrorHandler();
 * ```
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

/**
 * LocationErrorHandler Component
 * 
 * Wraps location-dependent components with comprehensive error handling.
 * 
 * @param {React.ReactNode} children - Child components to wrap
 * @param {Function} onRetry - Callback function for retry attempts
 */
const LocationErrorHandler = ({ children, onRetry }) => {
  // Component state
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  /**
   * Categorizes and provides detailed information for different error types
   * 
   * @param {Error|string} error - The error to categorize
   * @returns {Object} Error information with type, message, and retry options
   */
  const getErrorInfo = useCallback((error) => {
    const errorMessage = error?.message || error || '';
    
    // Rate limiting error
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return {
        type: 'rate_limit',
        title: 'Too Many Requests',
        message: 'We\'re searching too quickly. Please wait a moment and try again.',
        icon: '⏱️',
        retryDelay: 3000,
        canRetry: true,
        severity: 'warning'
      };
    }
    
    // Network connectivity error
    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return {
        type: 'network',
        title: 'Connection Issue',
        message: 'Unable to connect to location services. Please check your internet connection.',
        icon: '📡',
        retryDelay: 1000,
        canRetry: true,
        severity: 'error'
      };
    }
    
    // Permission denied error
    if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
      return {
        type: 'permission',
        title: 'Location Access Denied',
        message: 'Please enable location access in your browser settings to use this feature.',
        icon: '📍',
        retryDelay: 0,
        canRetry: true,
        severity: 'warning'
      };
    }
    
    // Timeout error
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      return {
        type: 'timeout',
        title: 'Request Timeout',
        message: 'Location search is taking too long. Please try again.',
        icon: '⏰',
        retryDelay: 1000,
        canRetry: true,
        severity: 'warning'
      };
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('No results')) {
      return {
        type: 'no_results',
        title: 'No Locations Found',
        message: 'We couldn\'t find any locations matching your search. Try a different search term.',
        icon: '🔍',
        retryDelay: 0,
        canRetry: false,
        severity: 'info'
      };
    }
    
    // Generic error
    return {
      type: 'generic',
      title: 'Location Service Error',
      message: 'Something went wrong with location services. Please try again.',
      icon: '⚠️',
      retryDelay: 1000,
      canRetry: true,
      severity: 'error'
    };
  }, []);

  // Handle retry with exponential backoff
  const handleRetry = useCallback(async () => {
    const errorInfo = getErrorInfo(error);
    
    if (!errorInfo.canRetry || retryCount >= 3) {
      toast.error('Maximum retry attempts reached. Please refresh the page.', {
        position: 'top-center',
        autoClose: 5000,
      });
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Apply delay based on error type and retry count
    const delay = errorInfo.retryDelay * Math.pow(2, retryCount); // Exponential backoff
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      if (onRetry) {
        await onRetry();
      }
      
      // Clear error if retry succeeds
      setError(null);
      setRetryCount(0);
      
      toast.success('Location service restored!', {
        position: 'top-center',
        autoClose: 2000,
      });
    } catch (retryError) {
      setError(retryError);
      
      toast.error(`Retry ${retryCount + 1} failed. ${getErrorInfo(retryError).message}`, {
        position: 'top-center',
        autoClose: 4000,
      });
    } finally {
      setIsRetrying(false);
    }
  }, [error, retryCount, onRetry, getErrorInfo]);

  // Error reporting function
  const reportError = useCallback((errorData) => {
    setError(errorData);
    
    const errorInfo = getErrorInfo(errorData);
    
    // Show appropriate toast based on severity
    const toastOptions = {
      position: 'top-center',
      autoClose: errorInfo.severity === 'error' ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (errorInfo.severity) {
      case 'error':
        toast.error(errorInfo.message, toastOptions);
        break;
      case 'warning':
        toast.warn(errorInfo.message, toastOptions);
        break;
      case 'info':
        toast.info(errorInfo.message, toastOptions);
        break;
      default:
        toast(errorInfo.message, toastOptions);
    }
  }, [getErrorInfo]);

  // Provide error handler to children
  const errorHandler = {
    reportError,
    clearError: () => {
      setError(null);
      setRetryCount(0);
    },
    isRetrying,
    retryCount
  };

  const errorInfo = error ? getErrorInfo(error) : null;

  return (
    <>
      {/* Error Overlay */}
      <AnimatePresence>
        {error && errorInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setError(null)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Error Icon and Title */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{errorInfo.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {errorInfo.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {errorInfo.message}
                </p>
              </div>

              {/* Retry Information */}
              {retryCount > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 text-center">
                    Retry attempt: {retryCount}/3
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setError(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Dismiss
                </button>
                
                {errorInfo.canRetry && retryCount < 3 && (
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {isRetrying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Retrying...
                      </>
                    ) : (
                      'Try Again'
                    )}
                  </button>
                )}
              </div>

              {/* Additional Help for Permission Errors */}
              {errorInfo.type === 'permission' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>How to enable location:</strong><br />
                    1. Click the location icon in your browser's address bar<br />
                    2. Select "Allow" for location access<br />
                    3. Refresh the page and try again
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render children with error handler */}
      {React.isValidElement(children) && typeof children.type === 'string' 
        ? children  // Don't pass props to DOM elements
        : React.cloneElement(children, { errorHandler })}
    </>
  );
};

// Hook for using location error handling
export const useLocationErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const reportError = useCallback((errorData) => {
    setError(errorData);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (retryFn) => {
    if (!retryFn) return;
    
    setIsRetrying(true);
    try {
      await retryFn();
      setError(null);
    } catch (retryError) {
      setError(retryError);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  return {
    error,
    isRetrying,
    reportError,
    clearError,
    retry
  };
};

export default LocationErrorHandler;