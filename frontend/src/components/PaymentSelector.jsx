/**
 * PaymentSelector.jsx - Payment Method Selection Component
 * 
 * A comprehensive payment method selector component for the Sawari ride-booking platform.
 * Supports multiple Pakistani payment methods including cash, mobile wallets, and cards.
 * Features phone number validation for mobile wallet payments and localStorage persistence.
 * 
 * Key Features:
 * - Multiple payment methods (Cash, Easypaisa, JazzCash, SadaPay/NayaPay, Cards)
 * - Pakistani phone number validation for mobile wallets
 * - localStorage persistence for user preferences
 * - Real-time validation with error feedback
 * - Responsive design with glassmorphism styling
 * - Accessibility support with proper ARIA labels
 * - Auto-formatting for phone numbers
 * 
 * Supported Payment Methods:
 * - Cash: Pay on delivery, no phone required
 * - Easypaisa: Mobile wallet, requires phone validation
 * - JazzCash: Mobile wallet, requires phone validation
 * - SadaPay/NayaPay: Digital wallets, requires phone validation
 * - Credit/Debit Cards: Mock implementation for demo
 * 
 * Usage:
 * ```jsx
 * <PaymentSelector
 *   value={selectedPaymentMethod}
 *   onChange={(methodId) => setPaymentMethod(methodId)}
 *   onValidationChange={(isValid) => setFormValid(isValid)}
 * />
 * ```
 */

import React, { useCallback, useState, useEffect } from 'react'

// Payment method configurations with Pakistani market focus
const methods = [
  { id: 'cash', label: 'Cash', icon: '💵', description: 'Pay with cash on delivery', requiresPhone: false },
  { id: 'easypaisa', label: 'Easypaisa', icon: '📱', description: 'Pay with Easypaisa mobile wallet', requiresPhone: true },
  { id: 'jazzcash', label: 'JazzCash', icon: '📲', description: 'Pay with JazzCash mobile wallet', requiresPhone: true },
  { id: 'sadapay', label: 'SadaPay/NayaPay', icon: '💳', description: 'Pay with SadaPay or NayaPay wallet', requiresPhone: true },
  { id: 'card', label: 'Credit/Debit', icon: '💳', description: 'Pay with credit or debit card (mock)', requiresPhone: false },
]

/**
 * PaymentSelector Component
 * 
 * Main component for selecting payment methods with validation and persistence.
 * 
 * @param {string} value - Currently selected payment method ID
 * @param {Function} onChange - Callback when payment method changes
 * @param {Function} onValidationChange - Callback when validation status changes
 */
const PaymentSelector = ({ value, onChange, onValidationChange }) => {
  // State management
  const [phoneNumber, setPhoneNumber] = useState('') // Phone number for mobile wallets
  const [phoneError, setPhoneError] = useState('') // Phone validation error message
  const [isValid, setIsValid] = useState(true) // Overall validation status

  /**
   * Load saved payment preferences from localStorage on component mount
   * Restores both payment method and phone number if available
   */
  useEffect(() => {
    const savedPayment = localStorage.getItem('sawari_preferred_payment')
    const savedPhone = localStorage.getItem('sawari_payment_phone')
    
    // Restore saved payment method if no current value
    if (savedPayment && !value) {
      onChange?.(savedPayment)
    }
    
    // Restore saved phone number
    if (savedPhone) {
      setPhoneNumber(savedPhone)
    }
  }, [])

  /**
   * Validate Pakistani phone number format
   * Supports multiple formats: +92XXXXXXXXXX, 03XXXXXXXXX, 92XXXXXXXXXX
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if phone number is valid
   */
  const validatePhoneNumber = (phone) => {
    // Pakistani mobile number patterns (all major networks)
    const pkPhoneRegex = /^(\+92|92|0)?3[0-9]{9}$/
    return pkPhoneRegex.test(phone.replace(/\s+/g, ''))
  }

  /**
   * Handle phone number input with real-time validation
   * Updates error state and saves to localStorage
   * @param {Event} e - Input change event
   */
  const handlePhoneChange = (e) => {
    const phone = e.target.value
    setPhoneNumber(phone)
    
    // Validate phone number and set error message
    if (phone && !validatePhoneNumber(phone)) {
      setPhoneError('Please enter a valid Pakistani mobile number (e.g., 03XXXXXXXXX)')
    } else {
      setPhoneError('')
    }
  }

  /**
   * Monitor validation status and notify parent component
   * Checks if phone number is required and valid for selected payment method
   */
  useEffect(() => {
    const selectedMethod = methods.find(m => m.id === value)
    const needsPhone = selectedMethod?.requiresPhone
    const phoneValid = !needsPhone || (phoneNumber && validatePhoneNumber(phoneNumber))
    
    setIsValid(phoneValid)
    onValidationChange?.(phoneValid)
  }, [value, phoneNumber, onValidationChange])

  // Save preferences to localStorage
  const handlePaymentChange = (methodId) => {
    onChange?.(methodId)
    localStorage.setItem('sawari_preferred_payment', methodId)
    
    if (phoneNumber && validatePhoneNumber(phoneNumber)) {
      localStorage.setItem('sawari_payment_phone', phoneNumber)
    }
  }
  // Keyboard navigation handler
  const handleKeyDown = useCallback((e, methodId, index) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = index > 0 ? index - 1 : methods.length - 1
        const prevButton = document.getElementById(`payment-${methods[prevIndex].id}`)
        if (prevButton) {
          prevButton.focus()
          handlePaymentChange(methods[prevIndex].id)
        }
        break
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = index < methods.length - 1 ? index + 1 : 0
        const nextButton = document.getElementById(`payment-${methods[nextIndex].id}`)
        if (nextButton) {
          nextButton.focus()
          handlePaymentChange(methods[nextIndex].id)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        handlePaymentChange(methodId)
        break
    }
  }, [])

  return (
    <div className="rounded-lg bg-black/80 backdrop-blur-xl border border-white/20 p-3 shadow-2xl">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white font-inter" id="payment-heading">Payment Method</h4>
      </div>
      <div 
        className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3"
        role="radiogroup"
        aria-labelledby="payment-heading"
        aria-describedby="payment-instructions"
      >
        <div id="payment-instructions" className="sr-only">
          Use arrow keys to navigate between payment methods. Press Enter or Space to select.
        </div>
        {methods.map((m, index) => (
          <button
            key={m.id}
            id={`payment-${m.id}`}
            onClick={() => handlePaymentChange(m.id)}
            onKeyDown={(e) => handleKeyDown(e, m.id, index)}
            className={`
              rounded-lg border py-3 px-3 text-sm min-h-[72px] min-w-[44px]
              focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-transparent
              transition-all duration-200 flex flex-col items-center justify-center
              ${value === m.id 
                ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/10 shadow-lg' 
                : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:shadow-md'
              }
            `}
            role="radio"
            aria-checked={value === m.id}
            aria-label={`${m.label} - ${m.description}`}
            aria-describedby={`payment-desc-${m.id}`}
            tabIndex={value === m.id ? 0 : -1}
            type="button"
          >
            <div className="text-lg" aria-hidden="true">{m.icon}</div>
            <div className="mt-1 font-medium text-xs text-white font-inter">{m.label}</div>
            <div id={`payment-desc-${m.id}`} className="sr-only">{m.description}</div>
            {value === m.id && (
              <div className="sr-only">Selected</div>
            )}
          </button>
        ))}
      </div>
      
      {/* Phone number input for wallet options */}
      {value && methods.find(m => m.id === value)?.requiresPhone && (
        <div className="mt-4 space-y-2">
          <label htmlFor="payment-phone" className="block text-sm font-medium text-white/80 font-inter">
            Mobile Number
          </label>
          <input
            id="payment-phone"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="03XXXXXXXXX"
            className={`
              w-full px-4 py-3 border rounded-lg text-base min-h-[48px] bg-white/10 text-white placeholder-white/50 font-inter
              focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-transparent focus:border-brand-primary
              transition-colors duration-200
              ${phoneError ? 'border-red-400 bg-red-500/10' : 'border-white/20'}
            `}
            aria-describedby={phoneError ? 'phone-error' : 'phone-help'}
            aria-required="true"
            aria-invalid={phoneError ? 'true' : 'false'}
            autoComplete="tel"
          />
          {phoneError && (
            <p id="phone-error" className="text-xs text-red-400 font-inter" role="alert">
              {phoneError}
            </p>
          )}
          <p id="phone-help" className="text-xs text-white/60 font-inter">
            Required for {methods.find(m => m.id === value)?.label} payments
          </p>
        </div>
      )}
    </div>
  )
}

export default PaymentSelector