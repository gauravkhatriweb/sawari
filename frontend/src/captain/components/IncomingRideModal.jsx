import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const IncomingRideModal = ({ 
  isOpen, 
  onAccept, 
  onReject, 
  rideData,
  countdownDuration = 15 // seconds
}) => {
  const [countdown, setCountdown] = useState(countdownDuration)
  const [isVibrating, setIsVibrating] = useState(false)
  const modalRef = useRef(null)
  const acceptButtonRef = useRef(null)
  const rejectButtonRef = useRef(null)
  const intervalRef = useRef(null)

  // Focus trap elements
  const focusableElements = useRef([])
  const firstFocusableElement = useRef(null)
  const lastFocusableElement = useRef(null)

  // Start countdown and vibration effect when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownDuration)
      setIsVibrating(true)
      
      // Simulate vibration effect
      const vibrationTimeout = setTimeout(() => {
        setIsVibrating(false)
      }, 2000)

      // Start countdown timer
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onReject() // Auto-reject when countdown reaches 0
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        clearTimeout(vibrationTimeout)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [isOpen, countdownDuration, onReject])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Get all focusable elements
      focusableElements.current = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.current.length > 0) {
        firstFocusableElement.current = focusableElements.current[0]
        lastFocusableElement.current = focusableElements.current[focusableElements.current.length - 1]
        
        // Focus first element (accept button)
        acceptButtonRef.current?.focus()
      }
    }
  }, [isOpen])

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          onAccept()
          break
        case 'Escape':
          e.preventDefault()
          onReject()
          break
        case 'Tab':
          // Focus trap
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement.current) {
              e.preventDefault()
              lastFocusableElement.current?.focus()
            }
          } else {
            if (document.activeElement === lastFocusableElement.current) {
              e.preventDefault()
              firstFocusableElement.current?.focus()
            }
          }
          break
        default:
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onAccept, onReject])

  if (!isOpen || !rideData) return null

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="incoming-ride-title"
        aria-describedby="incoming-ride-description"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            x: isVibrating ? [0, -2, 2, -2, 2, 0] : 0
          }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.3,
            x: { duration: 0.1, repeat: isVibrating ? 10 : 0 }
          }}
          className={`
            relative w-full max-w-md mx-4 bg-white/10 backdrop-blur-xl 
            border border-white/20 rounded-2xl overflow-hidden
            md:max-w-lg lg:max-w-xl
            ${isVibrating ? 'animate-pulse' : ''}
          `}
        >
          {/* Header with countdown */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 text-center">
            <h2 id="incoming-ride-title" className="text-xl font-bold text-white mb-2">
              Incoming Ride Request
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isVibrating ? 'bg-red-400 animate-ping' : 'bg-green-400'}`} />
              <span className="text-white/90 text-sm">
                {isVibrating ? 'New Request' : 'Waiting for response'}
              </span>
            </div>
            
            {/* Countdown Timer */}
            <div className="mt-3">
              <div className={`text-3xl font-bold ${
                countdown <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}>
                {countdown}s
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    countdown <= 5 ? 'bg-red-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${(countdown / countdownDuration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="p-6 space-y-4" id="incoming-ride-description">
            {/* Passenger Details */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {rideData.passenger.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{rideData.passenger.name}</h3>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white/80 text-sm">{rideData.passenger.rating}</span>
                  <span className="text-white/60 text-sm">({rideData.passenger.totalRides} rides)</span>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-3">
              {/* Pickup */}
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/80 text-sm">Pickup</p>
                  <p className="text-white font-medium">{rideData.pickup.address}</p>
                  <p className="text-white/60 text-xs">{typeof rideData.pickup.eta === 'object' ? JSON.stringify(rideData.pickup.eta) : rideData.pickup.eta} away</p>
                </div>
              </div>
              
              {/* Dropoff */}
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/80 text-sm">Drop-off</p>
                  <p className="text-white font-medium">{rideData.dropoff.address}</p>
                  <p className="text-white/60 text-xs">{rideData.tripDistance} • {rideData.tripDuration}</p>
                </div>
              </div>
            </div>

            {/* Fare */}
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-white/80 text-sm">Estimated Fare</p>
              <p className="text-white font-bold text-2xl">PKR {rideData.fare}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-0 flex space-x-3">
            <button
              ref={rejectButtonRef}
              onClick={onReject}
              className="
                flex-1 py-4 px-6 bg-red-500/20 hover:bg-red-500/30 
                border border-red-400/30 rounded-xl text-red-400 font-semibold
                transition-all duration-200 focus:outline-none focus:ring-2 
                focus:ring-red-400/50 focus:bg-red-500/30
              "
              aria-label="Reject ride request"
            >
              Decline
            </button>
            <button
              ref={acceptButtonRef}
              onClick={onAccept}
              className="
                flex-1 py-4 px-6 bg-green-500/20 hover:bg-green-500/30 
                border border-green-400/30 rounded-xl text-green-400 font-semibold
                transition-all duration-200 focus:outline-none focus:ring-2 
                focus:ring-green-400/50 focus:bg-green-500/30
              "
              aria-label="Accept ride request"
            >
              Accept
            </button>
          </div>

          {/* Keyboard Hints */}
          <div className="px-6 pb-4 text-center">
            <p className="text-white/50 text-xs">
              Press Enter to Accept • Esc to Decline
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  // Render modal in portal for proper z-index handling
  return createPortal(modalContent, document.body)
}

export default IncomingRideModal