/**
 * DirectionsLoadingFallback.jsx - Enhanced Loading State for Directions API
 * 
 * Provides a comprehensive loading experience while fetching route directions.
 * Includes progress indicators, estimated time, and contextual information.
 * 
 * Features:
 * - Animated loading indicators with route-specific messaging
 * - Progress estimation based on typical API response times
 * - Contextual information about what's being calculated
 * - Smooth animations and responsive design
 * - Integration with existing design system
 * - Accessibility support with proper ARIA labels
 * 
 * Usage:
 * ```jsx
 * <DirectionsLoadingFallback
 *   isLoading={isLoadingRoutes}
 *   pickup={pickup}
 *   drop={drop}
 *   className="mt-4"
 * />
 * ```
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPinIcon, 
  ArrowPathIcon,
  ClockIcon,
  MapIcon
} from '@heroicons/react/24/outline'

const DirectionsLoadingFallback = ({
  isLoading = false,
  pickup,
  drop,
  className = ''
}) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  
  const loadingSteps = [
    { label: 'Analyzing locations', duration: 800 },
    { label: 'Finding optimal routes', duration: 1200 },
    { label: 'Calculating distances', duration: 600 },
    { label: 'Preparing route options', duration: 400 }
  ]

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setCurrentStep(0)
      return
    }

    let totalDuration = 0
    let currentDuration = 0
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 2, 95) // Cap at 95% until actual completion
        
        // Update current step based on progress
        let stepIndex = 0
        let accumulatedDuration = 0
        
        for (let i = 0; i < loadingSteps.length; i++) {
          accumulatedDuration += loadingSteps[i].duration
          if (newProgress < (accumulatedDuration / 3000) * 100) {
            stepIndex = i
            break
          }
          stepIndex = i + 1
        }
        
        setCurrentStep(Math.min(stepIndex, loadingSteps.length - 1))
        return newProgress
      })
    }, 50)

    return () => clearInterval(progressInterval)
  }, [isLoading])

  if (!isLoading) return null

  const getLocationName = (location) => {
    if (!location) return 'Unknown'
    return location.display_name?.split(',')[0] || location.name || 'Selected location'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`bg-black/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ${className}`}
        role="status"
        aria-live="polite"
        aria-label="Loading route directions"
      >
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <ArrowPathIcon className="w-6 h-6 text-blue-400 animate-spin" aria-hidden="true" />
              <motion.div
                className="absolute inset-0 border-2 border-blue-400/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-blue-300 font-inter">
                Finding Best Routes
              </h3>
              <p className="text-white/80 text-sm font-inter">
                Calculating optimal paths between your locations
              </p>
            </div>
          </div>

          {/* Route Information */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-green-400" />
                <span className="text-white/90 font-inter">
                  {getLocationName(pickup)}
                </span>
              </div>
              <ArrowPathIcon className="w-4 h-4 text-white/40 animate-pulse" />
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-red-400" />
                <span className="text-white/90 font-inter">
                  {getLocationName(drop)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-white/70 mb-2">
              <span className="font-inter">{loadingSteps[currentStep]?.label}</span>
              <span className="font-inter">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-2">
            {loadingSteps.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <motion.div
                  key={index}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-blue-500/20 border border-blue-500/30' : 
                    isCompleted ? 'bg-green-500/10 border border-green-500/20' : 
                    'bg-white/5 border border-white/10'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-blue-400 animate-pulse' :
                    isCompleted ? 'bg-green-400' :
                    'bg-white/30'
                  }`} />
                  <span className={`text-sm font-inter ${
                    isActive ? 'text-blue-300' :
                    isCompleted ? 'text-green-300' :
                    'text-white/60'
                  }`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="ml-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowPathIcon className="w-3 h-3 text-blue-400" />
                    </motion.div>
                  )}
                  {isCompleted && (
                    <motion.div
                      className="ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
            <div className="flex items-center space-x-2 text-xs text-white/50">
              <ClockIcon className="w-3 h-3" />
              <span className="font-inter">Estimated: 2-5 seconds</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/50">
              <MapIcon className="w-3 h-3" />
              <span className="font-inter">Multiple routes</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DirectionsLoadingFallback