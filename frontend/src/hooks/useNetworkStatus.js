/**
 * useNetworkStatus.js - Network Connectivity Hook
 * 
 * Provides real-time network connectivity status and connection quality monitoring.
 * Helps improve error handling by distinguishing between network and API issues.
 * 
 * Features:
 * - Real-time online/offline status detection
 * - Connection quality estimation (slow/fast)
 * - Automatic retry suggestions based on network state
 * - Event-driven updates for immediate feedback
 * - Browser compatibility across modern browsers
 * 
 * Usage:
 * ```jsx
 * const { isOnline, connectionQuality, isSlowConnection } = useNetworkStatus()
 * 
 * if (!isOnline) {
 *   return <OfflineMessage />
 * }
 * 
 * if (isSlowConnection) {
 *   return <SlowConnectionWarning />
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionQuality, setConnectionQuality] = useState('unknown')
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [lastOnlineTime, setLastOnlineTime] = useState(Date.now())

  // Test connection quality by measuring a small request
  const testConnectionQuality = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectionQuality('offline')
      setIsSlowConnection(false)
      return
    }

    try {
      const startTime = Date.now()
      
      // Use a small image or API endpoint to test speed
      // Using a 1x1 pixel image with cache-busting
      const testUrl = `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7?t=${Date.now()}`
      
      await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Classify connection quality based on response time
      if (responseTime < 200) {
        setConnectionQuality('fast')
        setIsSlowConnection(false)
      } else if (responseTime < 1000) {
        setConnectionQuality('moderate')
        setIsSlowConnection(false)
      } else {
        setConnectionQuality('slow')
        setIsSlowConnection(true)
      }
    } catch (error) {
      // If test fails, assume slow connection rather than offline
      // since navigator.onLine might not be accurate
      setConnectionQuality('slow')
      setIsSlowConnection(true)
    }
  }, [])

  // Handle online status changes
  const handleOnline = useCallback(() => {
    setIsOnline(true)
    setLastOnlineTime(Date.now())
    // Test connection quality when coming back online
    setTimeout(testConnectionQuality, 100)
  }, [testConnectionQuality])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setConnectionQuality('offline')
    setIsSlowConnection(false)
  }, [])

  // Set up event listeners and periodic quality checks
  useEffect(() => {
    // Initial connection quality test
    testConnectionQuality()

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connection quality checks (every 30 seconds when online)
    const qualityCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        testConnectionQuality()
      }
    }, 30000)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(qualityCheckInterval)
    }
  }, [handleOnline, handleOffline, testConnectionQuality])

  // Additional connection info from Navigator API (if available)
  const getConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      
      return {
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null,
        saveData: connection?.saveData || false
      }
    }
    
    return {
      effectiveType: 'unknown',
      downlink: null,
      rtt: null,
      saveData: false
    }
  }, [])

  // Get user-friendly connection status
  const getConnectionStatus = useCallback(() => {
    if (!isOnline) {
      return {
        status: 'offline',
        message: 'No internet connection',
        canRetry: false,
        suggestedDelay: 0
      }
    }

    const connectionInfo = getConnectionInfo()
    
    switch (connectionQuality) {
      case 'fast':
        return {
          status: 'excellent',
          message: 'Excellent connection',
          canRetry: true,
          suggestedDelay: 0
        }
      case 'moderate':
        return {
          status: 'good',
          message: 'Good connection',
          canRetry: true,
          suggestedDelay: 1000
        }
      case 'slow':
        return {
          status: 'slow',
          message: 'Slow connection detected',
          canRetry: true,
          suggestedDelay: 3000
        }
      default:
        return {
          status: 'unknown',
          message: 'Connection status unknown',
          canRetry: true,
          suggestedDelay: 2000
        }
    }
  }, [isOnline, connectionQuality, getConnectionInfo])

  return {
    isOnline,
    connectionQuality,
    isSlowConnection,
    lastOnlineTime,
    connectionInfo: getConnectionInfo(),
    connectionStatus: getConnectionStatus(),
    testConnectionQuality
  }
}

export default useNetworkStatus