import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import CaptainBottomNav from '../../captain/components/CaptainBottomNav'
import GlassCard from '../../components/GlassCard'
import { formatPKRDisplay } from '../../utils/currency'

const CaptainEarnings = () => {
  const [activeTab, setActiveTab] = useState('today')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [paymentDetails, setPaymentDetails] = useState({
    easypaisa: { phoneNumber: '', accountName: '' },
    jazzcash: { phoneNumber: '', accountName: '' },
    bank: { accountNumber: '', bankName: '', accountTitle: '', iban: '' }
  })
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Dummy earnings data
  const earningsData = {
    today: { total: 2850, rides: 8, avgFare: 356 },
    week: { total: 18750, rides: 45, avgFare: 417 },
    month: { total: 75200, rides: 180, avgFare: 418 }
  }

  // Dummy recent rides data
  const recentRides = [
    { id: 1, date: '2024-01-15', time: '14:30', from: 'Gulberg', to: 'DHA Phase 5', fare: 450, status: 'completed' },
    { id: 2, date: '2024-01-15', time: '13:15', from: 'Model Town', to: 'Liberty Market', fare: 320, status: 'completed' },
    { id: 3, date: '2024-01-15', time: '12:00', from: 'Johar Town', to: 'Mall Road', fare: 280, status: 'completed' },
    { id: 4, date: '2024-01-15', time: '11:30', from: 'Cantt', to: 'Fortress Stadium', fare: 380, status: 'completed' },
    { id: 5, date: '2024-01-14', time: '19:45', from: 'Emporium Mall', to: 'Packages Mall', fare: 420, status: 'completed' },
    { id: 6, date: '2024-01-14', time: '18:20', from: 'University of Punjab', to: 'Anarkali', fare: 350, status: 'completed' },
    { id: 7, date: '2024-01-14', time: '17:00', from: 'Ferozepur Road', to: 'MM Alam Road', fare: 390, status: 'completed' },
    { id: 8, date: '2024-01-14', time: '16:15', from: 'Thokar Niaz Baig', to: 'Kalma Chowk', fare: 310, status: 'completed' }
  ]

  const currentEarnings = earningsData[activeTab]
  const availableBalance = 12450 // Dummy available balance

  // Validation functions
  const validateForm = () => {
    const errors = {}
    
    if (!selectedPaymentMethod) {
      errors.paymentMethod = 'Please select a payment method'
    }
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      errors.withdrawAmount = 'Please enter a valid amount'
    } else if (parseFloat(withdrawAmount) > availableBalance) {
      errors.withdrawAmount = 'Amount exceeds available balance'
    } else if (parseFloat(withdrawAmount) < 100) {
      errors.withdrawAmount = `Minimum withdrawal amount is ${formatPKRDisplay(100)}`
    }

    const details = paymentDetails[selectedPaymentMethod]
    if (selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'jazzcash') {
      if (!details.phoneNumber) {
        errors.phoneNumber = 'Phone number is required'
      } else if (!/^03\d{9}$/.test(details.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid phone number (03XXXXXXXXX)'
      }
      if (!details.accountName) {
        errors.accountName = 'Account name is required'
      }
    } else if (selectedPaymentMethod === 'bank') {
      if (!details.accountNumber) {
        errors.accountNumber = 'Account number is required'
      }
      if (!details.bankName) {
        errors.bankName = 'Bank name is required'
      }
      if (!details.accountTitle) {
        errors.accountTitle = 'Account title is required'
      }
      if (!details.iban) {
        errors.iban = 'IBAN is required'
      } else if (!/^PK\d{2}[A-Z]{4}\d{16}$/.test(details.iban)) {
        errors.iban = 'Please enter a valid IBAN (PK followed by 2 digits, 4 letters, and 16 digits)'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleWithdraw = async () => {
    if (!validateForm()) return

    setIsWithdrawing(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsWithdrawing(false)
      setShowWithdrawModal(false)
      toast.success(`Withdrawal request of ${formatPKRDisplay(parseFloat(withdrawAmount))} submitted successfully!`)
      
      // Reset form
      setWithdrawAmount('')
      setSelectedPaymentMethod('')
      setPaymentDetails({
        easypaisa: { phoneNumber: '', accountName: '' },
        jazzcash: { phoneNumber: '', accountName: '' },
        bank: { accountNumber: '', bankName: '', accountTitle: '', iban: '' }
      })
      setFormErrors({})
    }, 2000)
  }

  const handlePaymentDetailsChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [selectedPaymentMethod]: {
        ...prev[selectedPaymentMethod],
        [field]: value
      }
    }))
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const downloadCSVReport = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Time', 'From', 'To', 'Fare (PKR)', 'Status'],
      ...recentRides.map(ride => [
        ride.date,
        ride.time,
        ride.from,
        ride.to,
        ride.fare,
        ride.status
      ])
    ].map(row => row.join(',')).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `earnings-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Report downloaded successfully!')
  }

  const isWithdrawDisabled = !selectedPaymentMethod || !withdrawAmount || parseFloat(withdrawAmount) <= 0

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-['Poppins',sans-serif]">
            Earnings
          </h1>
          <button
            onClick={downloadCSVReport}
            className="bg-theme-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>

        {/* Available Balance */}
        <GlassCard className="p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-3xl font-bold mb-2">{formatPKRDisplay(availableBalance)}</h2>
            <p className="text-theme-secondary mb-4">Available Balance</p>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="bg-theme-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200"
            >
              Withdraw Funds
            </button>
          </div>
        </GlassCard>

        {/* Earnings Tabs */}
        <GlassCard className="p-6 mb-6">
          <div className="flex space-x-1 mb-6 bg-theme-secondary bg-opacity-20 rounded-lg p-1">
            {['today', 'week', 'month'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-theme-accent text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-accent mb-1">
                {formatPKRDisplay(currentEarnings.total)}
              </div>
              <div className="text-sm text-theme-secondary">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-accent mb-1">
                {currentEarnings.rides}
              </div>
              <div className="text-sm text-theme-secondary">Completed Rides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-accent mb-1">
                {formatPKRDisplay(currentEarnings.avgFare)}
              </div>
              <div className="text-sm text-theme-secondary">Average Fare</div>
            </div>
          </div>
        </GlassCard>

        {/* Recent Rides */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Rides</h3>
          <div className="space-y-3">
            {recentRides.map((ride) => (
              <div key={ride.id} className="flex justify-between items-center p-3 bg-theme-secondary bg-opacity-10 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{ride.from} → {ride.to}</div>
                  <div className="text-sm text-theme-secondary">
                    {ride.date} at {ride.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-theme-accent">{formatPKRDisplay(ride.fare)}</div>
                  <div className="text-xs text-green-500 capitalize">{ride.status}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-base rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="withdraw-modal-title"
              aria-describedby="withdraw-modal-description"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="withdraw-modal-title" className="text-xl font-bold">Withdraw Funds</h2>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-theme-secondary hover:text-theme-primary transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p id="withdraw-modal-description" className="text-theme-secondary mb-6">
                Available Balance: {formatPKRDisplay(availableBalance)}
              </p>

              {/* Withdraw Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Withdraw Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value)
                    if (formErrors.withdrawAmount) {
                      setFormErrors(prev => ({ ...prev, withdrawAmount: '' }))
                    }
                  }}
                  placeholder="Enter amount"
                  className={`w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border ${
                    formErrors.withdrawAmount ? 'border-red-500' : 'border-transparent'
                  } focus:border-theme-accent focus:outline-none transition-colors`}
                />
                {formErrors.withdrawAmount && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.withdrawAmount}</p>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Payment Method</label>
                <div className="space-y-3">
                  {[
                    { id: 'easypaisa', name: 'Easypaisa', icon: '📱' },
                    { id: 'jazzcash', name: 'JazzCash', icon: '💳' },
                    { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
                  ].map((method) => (
                    <label key={method.id} className="flex items-center p-3 rounded-lg border border-theme-secondary border-opacity-30 cursor-pointer hover:bg-theme-secondary hover:bg-opacity-10 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => {
                          setSelectedPaymentMethod(e.target.value)
                          if (formErrors.paymentMethod) {
                            setFormErrors(prev => ({ ...prev, paymentMethod: '' }))
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="text-xl mr-3">{method.icon}</span>
                      <span className="font-medium">{method.name}</span>
                    </label>
                  ))}
                </div>
                {formErrors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.paymentMethod}</p>
                )}
              </div>

              {/* Payment Details Forms */}
              {selectedPaymentMethod && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Payment Details</h3>
                  
                  {(selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'jazzcash') && (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number (03XXXXXXXXX)"
                          value={paymentDetails[selectedPaymentMethod].phoneNumber}
                          onChange={(e) => handlePaymentDetailsChange('phoneNumber', e.target.value)}
                          className={`w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border ${
                            formErrors.phoneNumber ? 'border-red-500' : 'border-transparent'
                          } focus:border-theme-accent focus:outline-none transition-colors`}
                        />
                        {formErrors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Account Name"
                          value={paymentDetails[selectedPaymentMethod].accountName}
                          onChange={(e) => handlePaymentDetailsChange('accountName', e.target.value)}
                          className={`w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border ${
                            formErrors.accountName ? 'border-red-500' : 'border-transparent'
                          } focus:border-theme-accent focus:outline-none transition-colors`}
                        />
                        {formErrors.accountName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.accountName}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={paymentDetails.bank.accountNumber}
                          onChange={(e) => handlePaymentDetailsChange('accountNumber', e.target.value)}
                          className={`w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border ${
                            formErrors.accountNumber ? 'border-red-500' : 'border-transparent'
                          } focus:border-theme-accent focus:outline-none transition-colors`}
                        />
                        {formErrors.accountNumber && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.accountNumber}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={paymentDetails.bank.bankName}
                          onChange={(e) => handlePaymentDetailsChange('bankName', e.target.value)}
                          className={`w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border ${
                            formErrors.bankName ? 'border-red-500' : 'border-transparent'
                          } focus:border-theme-accent focus:outline-none transition-colors`}
                        />
                        {formErrors.bankName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.bankName}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Account Title"
                          value={paymentDetails.bank.accountTitle}
                          onChange={(e) => handlePaymentDetailsChange('accountTitle', e.target.value)}
                          className={`w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border ${
                            formErrors.accountTitle ? 'border-red-500' : 'border-transparent'
                          } focus:border-theme-accent focus:outline-none transition-colors`}
                        />
                        {formErrors.accountTitle && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.accountTitle}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="IBAN (PK followed by 22 characters)"
                          value={paymentDetails.bank.iban}
                          onChange={(e) => handlePaymentDetailsChange('iban', e.target.value.toUpperCase())}
                          className={`w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border ${
                            formErrors.iban ? 'border-red-500' : 'border-transparent'
                          } focus:border-theme-accent focus:outline-none transition-colors`}
                        />
                        {formErrors.iban && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.iban}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 px-4 rounded-lg border border-theme-secondary border-opacity-30 text-theme-secondary hover:text-theme-primary hover:border-opacity-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawDisabled || isWithdrawing}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    isWithdrawDisabled
                      ? 'bg-theme-secondary bg-opacity-30 text-theme-secondary cursor-not-allowed'
                      : 'bg-theme-accent text-white hover:bg-opacity-90'
                  }`}
                >
                  {isWithdrawing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CaptainBottomNav />
    </div>
  )
}

export default CaptainEarnings