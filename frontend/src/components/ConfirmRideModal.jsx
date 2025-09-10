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
import { createRide } from '../services/rideApi.js'

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
  vehicle,
  fare,
  payment,
  estimatedETA = '5-8 min',
  isValid = true
}) => {
  // Map props to expected names for backward compatibility
  const selectedVehicle = vehicle
  const fareBreakdown = fare
  const paymentMethod = payment
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
      // Prepare ride data for API
      const rideData = {
        pickupLocation: {
          address: pickup || 'Current Location',
          coordinates: [0, 0], // Default coordinates if not provided
          city: 'Hyderabad' // Extract from address or set default
        },
        dropLocation: {
          address: drop || 'Not specified',
          coordinates: [0, 0], // Default coordinates if not provided
          city: 'Hyderabad' // Extract from address or set default
        },
        fare: fareBreakdown?.breakdown?.total || 0,
        distance: fareBreakdown?.details?.distanceKm || 0, // Distance in kilometers
        duration: fareBreakdown?.details?.durationMin || 15, // Duration in minutes
        paymentMethod: paymentMethod?.toLowerCase() || 'cash',
        vehicleType: selectedVehicle?.name?.toLowerCase() || 'bike',
        notes: `ETA: ${estimatedETA}`
      };
      
      console.log('Creating ride with data:', rideData);
      
      // Save ride to MongoDB via API
      const savedRide = await createRide(rideData);
      
      console.log('Ride saved successfully:', savedRide);
      
      // Call the onConfirm callback to show success modal with saved ride data
      await onConfirm({
        ...savedRide,
        pickup,
        drop,
        selectedVehicle,
        fareBreakdown,
        paymentMethod,
        estimatedETA,
        rideId: savedRide._id || savedRide.id
      });
      
    } catch (error) {
      console.error('Error confirming ride:', error);
      
      // Show error message to user
      alert(`Failed to confirm ride: ${error.message}. Please try again.`);
      
      // Optionally, you could show a toast notification instead of alert
      // or set an error state to display in the UI
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

  // Enhanced distance formatting function
  const formatDistance = (distanceKm) => {
    if (!distanceKm || distanceKm === 0) return '0 m'
    
    if (distanceKm < 0.1) {
      // Less than 100m, show in meters
      const meters = Math.round(distanceKm * 1000)
      return `${meters} m`
    } else if (distanceKm < 1) {
      // Less than 1km, show in meters with 50m precision
      const meters = Math.round(distanceKm * 1000 / 50) * 50
      return `${meters} m`
    } else if (distanceKm < 10) {
      // Less than 10km, show with 1 decimal place
      return `${distanceKm.toFixed(1)} km`
    } else {
      // 10km or more, show as whole numbers
      return `${Math.round(distanceKm)} km`
    }
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
            relative w-full max-w-sm mx-auto
            sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl
            max-h-[95vh] md:max-h-[90vh] lg:max-h-[85vh]
            md:h-auto h-full md:rounded-2xl rounded-none
            bg-white/10 backdrop-blur-xl 
            border border-white/20 
            shadow-[0_8px_30px_rgba(0,0,0,0.35)]
            overflow-hidden flex flex-col
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 p-4 sm:p-6 md:p-8 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 id="confirm-ride-title" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Confirm Your Ride
              </h2>
              <button
                onClick={onClose}
                className="
                  p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 
                  text-white/70 hover:text-white transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
                  min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center
                "
                aria-label="Close modal"
                type="button"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* ETA Badge */}
            <div className="mt-3 sm:mt-4 inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              <span className="text-green-400 text-xs sm:text-sm font-medium"><span className="font-bold">Driver ETA:</span> {estimatedETA}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 flex-1 overflow-y-auto" id="confirm-ride-description">
            {/* Trip Details */}
            <section className="space-y-3 sm:space-y-4" aria-labelledby="trip-details-heading">
              <h3 id="trip-details-heading" className="text-white/70 text-sm font-bold mb-2 sm:mb-3">Trip Details:</h3>
              
              {/* Pickup Location */}
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-xs sm:text-sm font-bold">Pickup Location:</p>
                  <p className="text-white font-medium text-sm sm:text-base break-words">{pickup || 'Current Location'}</p>
                </div>
              </div>
              
              {/* Destination */}
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-xs sm:text-sm font-bold">Destination:</p>
                  <p className="text-white font-medium text-sm sm:text-base break-words">{drop || 'Not specified'}</p>
                </div>
              </div>
            </section>

            {/* Vehicle Selection */}
            {selectedVehicle && (
              <section className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10" aria-labelledby="vehicle-heading">
                <h4 id="vehicle-heading" className="text-white/70 text-xs sm:text-sm font-bold mb-2 sm:mb-3">Selected Vehicle:</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0" role="img" aria-label={`${selectedVehicle.name} vehicle icon`}>{selectedVehicle.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base">{selectedVehicle.name}</p>
                    <p className="text-white/60 text-xs sm:text-sm">{selectedVehicle.capacity} • {selectedVehicle.eta}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Enhanced Distance Information */}
            <section className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10" aria-labelledby="distance-heading">
              <h4 id="distance-heading" className="text-white/70 text-xs sm:text-sm font-bold mb-2">Distance:</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-white font-medium text-sm sm:text-base">
                     {formatDistance(fare?.details?.distanceKm || 0)}
                   </p>
                </div>
                <span className="text-white/50 text-xs">Estimated</span>
              </div>
            </section>

            {/* Total Fare */}
            <section className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10" aria-labelledby="total-fare-heading">
              <h4 id="total-fare-heading" className="text-white/70 text-xs sm:text-sm font-bold mb-2">Total Amount:</h4>
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-lg sm:text-xl" aria-label={`Total fare: ${formatPKRDisplay(fare?.breakdown?.total || 0)}`}>{formatPKRDisplay(fare?.breakdown?.total || 0)}</p>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-green-400 text-xs font-medium">PKR</span>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10" aria-labelledby="payment-heading">
              <h4 id="payment-heading" className="text-white/70 text-xs sm:text-sm mb-2 font-bold">Payment Method:</h4>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-white font-medium text-sm sm:text-base" aria-label={`Selected payment method: ${paymentMethod ? getPaymentMethodLabel(paymentMethod) : 'Not selected'}`}>{paymentMethod ? getPaymentMethodLabel(paymentMethod) : 'Not selected'}</p>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="p-4 sm:p-6 md:p-8 pt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 md:space-x-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="
                flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-white/10 hover:bg-white/20 
                border border-white/20 rounded-xl text-white font-semibold
                transition-all duration-200 focus:outline-none focus:ring-2 
                focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent focus:bg-white/20
                min-h-[48px] sm:min-h-[56px] flex items-center justify-center
                text-sm sm:text-base
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
                flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-brand-primary to-brand-secondary
                hover:from-brand-primary/90 hover:to-brand-secondary/90
                disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-transparent
                min-h-[48px] sm:min-h-[56px] flex items-center justify-center space-x-2
                shadow-[0_4px_20px_rgba(77,166,255,0.3)] hover:shadow-[0_6px_25px_rgba(77,166,255,0.4)]
                disabled:shadow-none text-sm sm:text-base
              "
              aria-label={isSubmitting ? 'Requesting ride...' : 'Request ride'}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm sm:text-base">Requesting...</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">Request Ride</span>
              )}
            </button>
          </div>

          {/* Terms and Conditions */}
          <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 flex-shrink-0">
            <p className="text-white/50 text-xs text-center leading-relaxed">
              By confirming, you agree to our{' '}
              <button className="underline hover:text-white/70 transition-colors focus:outline-none focus:text-white/70" onClick={() => {}}>Terms of Service</button>
              {' '}and{' '}
              <button className="underline hover:text-white/70 transition-colors focus:outline-none focus:text-white/70" onClick={() => {}}>Privacy Policy</button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default ConfirmRideModal