/**
 * ConfirmRideModal.jsx - Ride Confirmation Modal Component
 * 
 * A comprehensive modal component for confirming ride bookings in the Sawari platform.
 * Features accessibility support, focus management, form validation, and smooth animations.
 * Displays ride details, fare breakdown, and payment information before final confirmation.
 * 
 * Key Features:
 * - Modal overlay with portal rendering
 * - Focus trap and keyboard navigation
 * - Ride details display (pickup, drop, vehicle, ETA)
 * - Fare breakdown with PKR formatting
 * - Payment method display
 * - Form validation and error handling
 * - Loading states during submission
 * - Smooth animations with Framer Motion
 * - Responsive design for mobile and desktop
 * - Accessibility compliance (ARIA labels, focus management)
 * 
 * Modal Sections:
 * - Header with close button
 * - Ride summary (locations, vehicle, ETA)
 * - Fare breakdown details
 * - Payment method confirmation
 * - Action buttons (Cancel, Confirm)
 * 
 * Usage:
 * ```jsx
 * <ConfirmRideModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={handleRideConfirmation}
 *   pickup={pickupLocation}
 *   drop={dropLocation}
 *   selectedVehicle={vehicleType}
 *   fareBreakdown={fareDetails}
 *   paymentMethod={selectedPayment}
 *   estimatedETA="5-8 min"
 *   isValid={formIsValid}
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { formatPKRDisplay } from '../utils/currency'

/**
 * ConfirmRideModal Component
 * 
 * Modal for confirming ride bookings with comprehensive details and validation.
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onConfirm - Callback to confirm the ride booking
 * @param {Object} pickup - Pickup location details
 * @param {Object} drop - Drop-off location details
 * @param {Object} selectedVehicle - Selected vehicle type and details
 * @param {Object} fareBreakdown - Detailed fare calculation
 * @param {Object} paymentMethod - Selected payment method
 * @param {string} estimatedETA - Estimated time of arrival
 * @param {boolean} isValid - Whether the form data is valid
 */
const ConfirmRideModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  pickup,
  drop,
  selectedVehicle,
  fareBreakdown,
  paymentMethod,
  estimatedETA = '5-8 min',
  isValid = true
}) => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useRef(null)
  const confirmButtonRef = useRef(null)

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

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
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

  const handleConfirmRide = async () => {
    if (!isValid || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: 'Cash',
      easypaisa: 'Easypaisa',
      jazzcash: 'JazzCash',
      sadapay: 'SadaPay/NayaPay',
      card: 'Credit/Debit Card'
    }
    return methods[method] || method
  }

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
        aria-labelledby="confirm-ride-title"
        aria-describedby="confirm-ride-description"
      >
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />
        
        {/* Modal Content - Responsive Design */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="
            relative w-full max-w-md mx-auto
            md:max-w-lg lg:max-w-xl
            md:h-auto h-full md:rounded-2xl rounded-none
            bg-white/10 backdrop-blur-xl 
            border border-white/20 
            shadow-[0_8px_30px_rgba(0,0,0,0.35)]
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 id="confirm-ride-title" className="text-xl md:text-2xl font-bold text-white">
                Confirm Your Ride
              </h2>
              <button
                onClick={onClose}
                className="
                  p-3 rounded-full bg-white/10 hover:bg-white/20 
                  text-white/70 hover:text-white transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
                  min-w-[44px] min-h-[44px] flex items-center justify-center
                "
                aria-label="Close modal"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* ETA Badge */}
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Driver ETA: {estimatedETA}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6" id="confirm-ride-description">
            {/* Trip Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-3">Trip Details</h3>
              
              {/* Pickup Location */}
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/70 text-sm">Pickup</p>
                  <p className="text-white font-medium">{pickup?.label || 'Current Location'}</p>
                </div>
              </div>
              
              {/* Drop Location */}
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/70 text-sm">Destination</p>
                  <p className="text-white font-medium">{drop?.label || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            {selectedVehicle && (
              <section className="bg-white/5 rounded-xl p-4 border border-white/10" aria-labelledby="vehicle-heading">
                <h4 id="vehicle-heading" className="text-white/70 text-sm mb-2">Vehicle</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl" role="img" aria-label={`${selectedVehicle.name} vehicle icon`}>{selectedVehicle.icon}</span>
                  <div>
                    <p className="text-white font-medium">{selectedVehicle.name}</p>
                    <p className="text-white/60 text-sm">{selectedVehicle.capacity} • {selectedVehicle.eta}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Fare Breakdown */}
            {fareBreakdown && (
              <section className="bg-white/5 rounded-xl p-4 border border-white/10" aria-labelledby="fare-heading">
                <h4 id="fare-heading" className="text-white/70 text-sm mb-3">Fare Breakdown</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/70">Base Fare</dt>
                    <dd className="text-white">{formatPKRDisplay(fareBreakdown.baseFare)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/70">Distance ({fareBreakdown.distance?.toFixed(1)} km)</dt>
                    <dd className="text-white">{formatPKRDisplay(fareBreakdown.distanceCharge)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/70">Time ({fareBreakdown.duration} min)</dt>
                    <dd className="text-white">{formatPKRDisplay(fareBreakdown.timeCharge)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/70">Fuel Cost</dt>
                    <dd className="text-white">{formatPKRDisplay(fareBreakdown.fuelCost)}</dd>
                  </div>
                  <div className="border-t border-white/20 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <dt className="text-white">Total</dt>
                      <dd className="text-white text-lg" aria-label={`Total fare: ${formatPKRDisplay(fareBreakdown.total)}`}>{formatPKRDisplay(fareBreakdown.total)}</dd>
                    </div>
                  </div>
                </dl>
              </section>
            )}

            {/* Payment Method */}
            <section className="bg-white/5 rounded-xl p-4 border border-white/10" aria-labelledby="payment-heading">
              <h4 id="payment-heading" className="text-white/70 text-sm mb-2">Payment Method</h4>
              <p className="text-white font-medium" aria-label={`Selected payment method: ${getPaymentMethodLabel(paymentMethod)}`}>{getPaymentMethodLabel(paymentMethod)}</p>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="p-6 md:p-8 pt-0 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <button
              onClick={onClose}
              className="
                flex-1 py-4 px-6 bg-white/10 hover:bg-white/20 
                border border-white/20 rounded-xl text-white font-semibold
                transition-all duration-200 focus:outline-none focus:ring-2 
                focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent focus:bg-white/20
                min-h-[56px] flex items-center justify-center
              "
              aria-label="Edit ride details"
              type="button"
            >
              Edit
            </button>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirmRide}
              disabled={!isValid || isSubmitting}
              className="
                flex-1 py-4 px-6 bg-brand-primary hover:bg-brand-primary/90 
                text-white font-semibold rounded-xl
                transition-all duration-200 focus:outline-none focus:ring-2 
                focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center space-x-2 min-h-[56px]
              "
              aria-label="Confirm and request ride"
              type="button"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Requesting...</span>
                </>
              ) : (
                <span>Request Ride</span>
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <div className="px-6 md:px-8 pb-6 md:pb-8">
            <p className="text-white/50 text-xs text-center">
              By confirming, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default ConfirmRideModal