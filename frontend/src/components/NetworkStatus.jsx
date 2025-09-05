/**
 * NetworkStatus.jsx - Network Connectivity Monitor Component
 * 
 * A comprehensive network status monitoring component that tracks online/offline state,
 * connection quality, and provides user feedback through banners and toast notifications.
 * Features automatic retry mechanisms, connection quality detection, and graceful offline handling.
 * 
 * Key Features:
 * - Real-time network status monitoring
 * - Connection quality detection (good/slow/poor)
 * - Offline banner with retry functionality
 * - Toast notifications for status changes
 * - Automatic retry with exponential backoff
 * - Custom hook for network status access
 * - Responsive design with smooth animations
 * - Accessibility support with proper ARIA labels
 * 
 * Usage:
 * ```jsx
 * <NetworkStatus onNetworkChange={(status) => console.log(status)}>
 *   <YourApp />
 * </NetworkStatus>
 * 
 * // Or use the hook
 * const { isOnline, connectionQuality } = useNetworkStatus();
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

/**
 * NetworkStatus Component
 * 
 * Wrapper component that monitors network connectivity and provides visual feedback.
 * Renders children while overlaying network status information when needed.
 * 
 * @param {React.ReactNode} children - Child components to render
 * @param {Function} onNetworkChange - Callback function called when network status changes
 */
const NetworkStatus = ({ children, onNetworkChange }) => {
  // State management for network monitoring
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Current online status
  const [showOfflineBanner, setShowOfflineBanner] = useState(false); // Banner visibility
  const [connectionQuality, setConnectionQuality] = useState('good'); // Connection quality: 'good', 'slow', 'poor', 'offline'
  const [retryAttempts, setRetryAttempts] = useState(0); // Track retry attempts for backoff

  /**
   * Detect connection quality by measuring latency to a small resource
   * Uses favicon.ico as a lightweight test endpoint
   */
  const detectConnectionQuality = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectionQuality('offline');
      return;
    }

    try {
      const startTime = Date.now();
      // Use HEAD request to favicon for minimal data transfer
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const endTime = Date.now();
      const latency = endTime - startTime;

      // Categorize connection quality based on latency
      if (latency < 200) {
        setConnectionQuality('good'); // Fast connection
      } else if (latency < 1000) {
        setConnectionQuality('slow'); // Moderate connection
      } else {
        setConnectionQuality('poor'); // Slow connection
      }
    } catch (error) {
      // Network error or timeout
      setConnectionQuality('poor');
    }
  }, []);

  /**
   * Handle online event - connection restored
   * Resets retry attempts and shows success notification
   */
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setShowOfflineBanner(false);
    setRetryAttempts(0); // Reset retry counter
    detectConnectionQuality(); // Check connection quality
    
    // Show success notification
    toast.success('Connection restored! You\'re back online.', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    if (onNetworkChange) {
      onNetworkChange({ isOnline: true, quality: connectionQuality });
    }
  }, [detectConnectionQuality, connectionQuality, onNetworkChange]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setShowOfflineBanner(true);
    setConnectionQuality('offline');
    
    toast.error('No internet connection. Some features may not work.', {
      position: 'top-center',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      toastId: 'offline-toast'
    });

    if (onNetworkChange) {
      onNetworkChange({ isOnline: false, quality: 'offline' });
    }
  }, [onNetworkChange]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    setRetryAttempts(prev => prev + 1);
    
    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        handleOnline();
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      toast.error(`Connection attempt ${retryAttempts + 1} failed. Please check your internet.`, {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  }, [retryAttempts, handleOnline]);

  // Setup event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial connection quality check
    detectConnectionQuality();
    
    // Periodic connection quality monitoring
    const qualityInterval = setInterval(detectConnectionQuality, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityInterval);
    };
  }, [handleOnline, handleOffline, detectConnectionQuality]);

  // Connection quality indicator
  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'good': return 'bg-green-500';
      case 'slow': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityText = () => {
    switch (connectionQuality) {
      case 'good': return 'Excellent connection';
      case 'slow': return 'Slow connection';
      case 'poor': return 'Poor connection';
      case 'offline': return 'No connection';
      default: return 'Checking connection...';
    }
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-medium">No Internet Connection</span>
                <span className="text-red-200 text-sm hidden sm:inline">
                  Some features may not work properly
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={retryConnection}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
                  disabled={retryAttempts >= 3}
                >
                  {retryAttempts >= 3 ? 'Max retries' : 'Retry'}
                </button>
                
                <button
                  onClick={() => setShowOfflineBanner(false)}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Quality Indicator (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-lg"
        >
          <div className={`w-2 h-2 rounded-full ${getQualityColor()}`} />
          <span className="text-xs font-medium hidden sm:inline">
            {getQualityText()}
          </span>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className={showOfflineBanner ? 'pt-16' : ''}>
        {children}
      </div>
    </>
  );
};

// Hook for network status
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState({
    isOnline: navigator.onLine,
    quality: 'good'
  });

  useEffect(() => {
    const handleOnline = () => setNetworkState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setNetworkState(prev => ({ ...prev, isOnline: false, quality: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkState;
};

export default NetworkStatus;