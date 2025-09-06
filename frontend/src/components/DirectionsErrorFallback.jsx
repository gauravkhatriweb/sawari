/**
 * DirectionsErrorFallback.jsx - Enhanced Error Handling Component for Directions API
 * 
 * Provides comprehensive error handling and recovery options when directions API fails.
 * Includes user-friendly error messages, retry functionality, and alternative suggestions.
 * 
 * Features:
 * - Categorized error messages with specific guidance
 * - Retry functionality with exponential backoff indication
 * - Alternative suggestions (manual route entry, contact support)
 * - Accessibility support with proper ARIA labels
 * - Smooth animations and responsive design
 * - Integration with existing design system
 * 
 * Usage:
 * ```jsx
 * <DirectionsErrorFallback
 *   error={routeError}
 *   isLoading={isLoadingRoutes}
 *   onRetry={() => fetchDirections(pickup, drop)}
 *   onDismiss={() => setRouteError(null)}
 *   pickup={pickup}
 *   drop={drop}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  InformationCircleIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline'
import useNetworkStatus from '../hooks/useNetworkStatus'

// Error type categorization for better user guidance
const ERROR_TYPES = {
  NETWORK: 'network',
  NO_ROUTE: 'no_route',
  RATE_LIMIT: 'rate_limit',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  LOCATION_RESTRICTED: 'location_restricted',
  UNKNOWN: 'unknown'
}

// Categorize error based on error message
const categorizeError = (errorMessage) => {
  if (!errorMessage) return ERROR_TYPES.UNKNOWN
  
  const message = errorMessage.toLowerCase()
  
  if (message.includes('network') || message.includes('connection')) {
    return ERROR_TYPES.NETWORK
  } else if (message.includes('no route') || message.includes('route found')) {
    return ERROR_TYPES.NO_ROUTE
  } else if (message.includes('rate limit') || message.includes('too many')) {
    return ERROR_TYPES.RATE_LIMIT
  } else if (message.includes('service') && message.includes('restricted')) {
    return ERROR_TYPES.LOCATION_RESTRICTED
  } else if (message.includes('unavailable') || message.includes('api')) {
    return ERROR_TYPES.SERVICE_UNAVAILABLE
  }
  
  return ERROR_TYPES.UNKNOWN
}

// Get error-specific content
const getErrorContent = (errorType, pickup, drop) => {
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return {
        icon: ExclamationTriangleIcon,
        title: 'Connection Issue',
        message: 'Unable to connect to our routing service. Please check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Try switching between WiFi and mobile data',
          'Retry in a few moments'
        ],
        canRetry: true,
        severity: 'warning'
      }
    
    case ERROR_TYPES.NO_ROUTE:
      return {
        icon: MapPinIcon,
        title: 'No Route Available',
        message: 'We couldn\'t find a driving route between these locations.',
        suggestions: [
          'Try selecting locations closer to main roads',
          'Check if both locations are accessible by vehicle',
          'Consider alternative pickup or drop points'
        ],
        canRetry: true,
        severity: 'error'
      }
    
    case ERROR_TYPES.RATE_LIMIT:
      return {
        icon: InformationCircleIcon,
        title: 'Service Temporarily Busy',
        message: 'Our routing service is experiencing high demand. Please wait a moment.',
        suggestions: [
          'Wait 30-60 seconds before retrying',
          'The service will be available shortly',
          'Your request is important to us'
        ],
        canRetry: true,
        severity: 'info',
        retryDelay: 30000 // 30 seconds
      }
    
    case ERROR_TYPES.LOCATION_RESTRICTED:
      return {
        icon: ExclamationTriangleIcon,
        title: 'Service Area Restriction',
        message: 'Our service is currently available within Pakistan only.',
        suggestions: [
          'Ensure both locations are within Pakistan',
          'Check location accuracy on the map',
          'Contact support if you believe this is an error'
        ],
        canRetry: false,
        severity: 'warning'
      }
    
    case ERROR_TYPES.SERVICE_UNAVAILABLE:
      return {
        icon: ExclamationTriangleIcon,
        title: 'Service Temporarily Unavailable',
        message: 'Our routing service is temporarily unavailable. We\'re working to restore it.',
        suggestions: [
          'Try again in a few minutes',
          'Use estimated fare for now',
          'Contact support if the issue persists'
        ],
        canRetry: true,
        severity: 'error',
        retryDelay: 60000 // 1 minute
      }
    
    default:
      return {
        icon: ExclamationTriangleIcon,
        title: 'Route Calculation Issue',
        message: 'We encountered an issue calculating your route.',
        suggestions: [
          'Try selecting your locations again',
          'Ensure locations are valid addresses',
          'Contact support if the problem continues'
        ],
        canRetry: true,
        severity: 'error'
      }
  }
}

const DirectionsErrorFallback = ({
  error,
  isLoading = false,
  onRetry,
  onDismiss,
  pickup,
  drop,
  className = ''
}) => {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(0)
  
  const { isOnline, isSlowConnection, connectionStatus } = useNetworkStatus()

  const errorType = categorizeError(error)
  const errorContent = getErrorContent(errorType, pickup, drop)
  const { icon: IconComponent, title, message, suggestions, canRetry, severity, retryDelay = 0 } = errorContent
  
  // Override error content for network issues
  const getNetworkAwareContent = () => {
    if (!isOnline) {
      return {
        icon: SignalSlashIcon,
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        suggestions: [
          'Check your WiFi or mobile data connection',
          'Try switching between WiFi and mobile data',
          'Move to an area with better signal strength'
        ],
        canRetry: false,
        severity: 'error'
      }
    }
    
    if (isSlowConnection && errorType === ERROR_TYPES.NETWORK) {
      return {
        ...errorContent,
        icon: WifiIcon,
        title: 'Slow Connection Detected',
        message: 'Your connection is slow. Route calculation may take longer than usual.',
        suggestions: [
          'Wait for the request to complete (may take 10-30 seconds)',
          'Try moving to an area with better signal',
          'Switch to a faster internet connection if available'
        ],
        retryDelay: connectionStatus.suggestedDelay
      }
    }
    
    return errorContent
  }
  
  const finalContent = getNetworkAwareContent()
  const finalCanRetry = finalContent.canRetry && (isOnline || errorType !== ERROR_TYPES.NETWORK)

  // Handle retry with countdown for rate limiting
  const handleRetry = async () => {
    if (!finalCanRetry || isRetrying) return
    
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    const effectiveRetryDelay = finalContent.retryDelay || retryDelay
    
    if (effectiveRetryDelay > 0) {
      setRetryCountdown(Math.ceil(effectiveRetryDelay / 1000))
      const countdownInterval = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setTimeout(() => {
        clearInterval(countdownInterval)
        setRetryCountdown(0)
        if (onRetry) onRetry()
        setIsRetrying(false)
      }, effectiveRetryDelay)
    } else {
      if (onRetry) onRetry()
      setIsRetrying(false)
    }
  }

  // Reset retry count when error changes
  useEffect(() => {
    setRetryCount(0)
    setIsRetrying(false)
    setRetryCountdown(0)
  }, [error])

  if (!error) return null

  const getSeverityStyles = () => {
    switch (finalContent.severity) {
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          icon: 'text-yellow-400',
          title: 'text-yellow-300'
        }
      case 'info':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          icon: 'text-blue-400',
          title: 'text-blue-300'
        }
      case 'error':
      default:
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          icon: 'text-red-400',
          title: 'text-red-300'
        }
    }
  }

  const styles = getSeverityStyles()
  const FinalIconComponent = finalContent.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`bg-black/90 backdrop-blur-xl border ${styles.border} rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className={`${styles.bg} rounded-xl p-4 border ${styles.border}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FinalIconComponent className={`w-6 h-6 ${styles.icon} flex-shrink-0`} aria-hidden="true" />
              <div>
                <h3 className={`font-semibold ${styles.title} font-inter`}>
                  {finalContent.title}
                </h3>
                <p className="text-white/80 text-sm font-inter mt-1">
                  {finalContent.message}
                </p>
              </div>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Dismiss error"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Network Status Indicator */}
          {!isOnline && (
            <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <div className="flex items-center space-x-2 text-red-300">
                <SignalSlashIcon className="w-4 h-4" />
                <span className="text-sm font-inter font-medium">Offline</span>
              </div>
            </div>
          )}
          
          {isOnline && isSlowConnection && (
            <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <div className="flex items-center space-x-2 text-yellow-300">
                <WifiIcon className="w-4 h-4" />
                <span className="text-sm font-inter font-medium">
                  {connectionStatus.message}
                </span>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {finalContent.suggestions?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white font-medium text-sm mb-2 font-inter">Suggestions:</h4>
              <ul className="space-y-1">
                {finalContent.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-white/70 text-sm font-inter flex items-start">
                    <span className="text-white/40 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-xs text-white/50 font-inter">
              {retryCount > 0 && `Attempt ${retryCount + 1}`}
            </div>
            
            <div className="flex items-center space-x-3">
              {finalCanRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying || isLoading || retryCountdown > 0 || !isOnline}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] text-white rounded-xl hover:shadow-[0_4px_20px_rgba(77,166,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-inter text-sm"
                  aria-label={retryCountdown > 0 ? `Retry in ${retryCountdown} seconds` : 'Retry route calculation'}
                >
                  <ArrowPathIcon className={`w-4 h-4 ${(isRetrying || isLoading) ? 'animate-spin' : ''}`} />
                  <span>
                    {!isOnline ? 'Offline' :
                     retryCountdown > 0 ? `Retry (${retryCountdown}s)` : 
                     isRetrying || isLoading ? 'Retrying...' : 'Retry'}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => window.open('tel:+92-XXX-XXXXXXX', '_self')}
                className="flex items-center space-x-2 px-4 py-2 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-inter text-sm"
                aria-label="Contact support"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DirectionsErrorFallback