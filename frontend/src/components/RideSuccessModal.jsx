/**
 * RideSuccessModal.jsx - Ride Booking Success Modal Component
 * 
 * A celebratory modal component that displays ride booking confirmation and driver details.
 * Shows after successful ride booking with driver information, ETA, and tracking options.
 * Features accessibility support, focus management, and smooth animations.
 * 
 * Key Features:
 * - Success confirmation with ride ID
 * - Driver details display (name, rating, vehicle, photo)
 * - Real-time ETA and location updates
 * - Contact options (call driver, message)
 * - Ride tracking and management buttons
 * - Modal overlay with portal rendering
 * - Focus trap and keyboard navigation
 * - Smooth animations with Framer Motion
 * - Responsive design for mobile and desktop
 * - Accessibility compliance (ARIA labels, focus management)
 * 
 * Driver Information Displayed:
 * - Driver name and photo
 * - Star rating
 * - Vehicle details (model, plate number)
 * - Contact information
 * - Current location and ETA
 * 
 * Usage:
 * ```jsx
 * <RideSuccessModal
 *   isOpen={showSuccessModal}
 *   onClose={() => setShowSuccessModal(false)}
 *   rideId="SW123ABC"
 * />
 * ```
 */

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// Mock driver data for demonstration
// In production, this would come from the booking API response
const mockDriver = {
  name: 'Ahmed Khan',
  rating: 4.8,
  vehicle: 'Toyota Corolla',
  plateNumber: 'ABC-123',
  phone: '+92 300 1234567',
  photo: '👨‍💼', // Using emoji as placeholder
  eta: '3-5 minutes',
  location: 'Approaching pickup point'
}

/**
 * RideSuccessModal Component
 * 
 * Modal for displaying ride booking success with driver details and tracking options.
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 * @param {string} rideId - Unique ride identifier for tracking
 */
const RideSuccessModal = ({ 
  isOpen, 
  onClose,
  rideId = 'SW' + Math.random().toString(36).substr(2, 6).toUpperCase()
}) => {
  // Refs for focus management
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)

  /**
   * Focus management and accessibility setup
   * Implements focus trap to keep keyboard navigation within modal
   * Focuses first interactive element when modal opens
   */
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const modal = modalRef.current
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Focus first interactive element
      if (firstElement) {
        firstElement.focus()
      }

      /**
       * Handle Tab key navigation for focus trap
       * Prevents focus from leaving the modal
       */
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab: move to last element if at first
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            // Tab: move to first element if at last
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      modal.addEventListener('keydown', handleTabKey)
      return () => modal.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen])

  // Auto-close after 10 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
        case 'Enter':
          e.preventDefault()
          onClose()
          break
        default:
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        aria-describedby="success-description"
      >
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeOut",
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
          className="
            relative w-full max-w-sm mx-auto
            bg-white/10 backdrop-blur-xl 
            border border-white/20 
            rounded-2xl
            shadow-[0_8px_30px_rgba(0,0,0,0.35)]
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-400/30"
            >
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h2 id="success-title" className="text-xl font-bold text-white mb-2">
              Ride Confirmed! 🎉
            </h2>
            <p className="text-white/80 text-sm">
              Your driver is on the way
            </p>
            
            {/* Ride ID */}
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20">
              <span className="text-white/70 text-xs">Ride ID: </span>
              <span className="text-white text-xs font-mono ml-1">{rideId}</span>
            </div>
          </div>

          {/* Driver Info */}
          <div className="p-6" id="success-description">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="mr-2">🚗</span>
                Your Driver
              </h3>
              
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-2xl border border-white/20">
                  {mockDriver.photo}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{mockDriver.name}</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-white/70 text-sm">{mockDriver.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Vehicle</span>
                  <span className="text-white">{mockDriver.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Plate</span>
                  <span className="text-white font-mono">{mockDriver.plateNumber}</span>
                </div>
              </div>
            </div>

            {/* ETA Info */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-400/20 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-semibold">Estimated Arrival</p>
                  <p className="text-white text-lg font-bold">{mockDriver.eta}</p>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mb-1" />
                  <p className="text-blue-400/80 text-xs">{mockDriver.location}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.open(`tel:${mockDriver.phone}`)}
                className="
                  w-full py-3 px-4 bg-green-500/20 hover:bg-green-500/30 
                  border border-green-400/30 rounded-xl text-green-400 font-semibold
                  transition-all duration-200 focus:outline-none focus:ring-2 
                  focus:ring-green-400/50 focus:bg-green-500/30
                  flex items-center justify-center space-x-2
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call Driver</span>
              </button>
              
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="
                  w-full py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 
                  text-white font-semibold rounded-xl
                  transition-all duration-200 focus:outline-none focus:ring-2 
                  focus:ring-brand-primary/50 focus:ring-offset-2
                "
              >
                Got It
              </button>
            </div>
          </div>

          {/* Auto-close indicator */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
              <p className="text-white/50 text-xs">Auto-closes in 10 seconds</p>
              <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default RideSuccessModal