import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CaptainBottomNav from '../../captain/components/CaptainBottomNav'
import GlassCard from '../../components/GlassCard'

const CaptainHelp = () => {
  const [activeSection, setActiveSection] = useState('faq')
  const [openFAQ, setOpenFAQ] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLostFoundModal, setShowLostFoundModal] = useState(false)
  const [lostFoundStep, setLostFoundStep] = useState(1)
  const [selectedRide, setSelectedRide] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [itemDetails, setItemDetails] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'support', time: '10:30 AM' }
  ])
  const [newMessage, setNewMessage] = useState('')
  const chatEndRef = useRef(null)

  // Dummy recent rides data
  const recentRides = [
    { id: 'RID001', date: '2024-01-15', pickup: 'Gulberg III', dropoff: 'DHA Phase 5' },
    { id: 'RID002', date: '2024-01-15', pickup: 'Model Town', dropoff: 'Liberty Market' },
    { id: 'RID003', date: '2024-01-14', pickup: 'Johar Town', dropoff: 'Mall Road' },
    { id: 'RID004', date: '2024-01-14', pickup: 'Cantt Station', dropoff: 'Fortress Stadium' },
    { id: 'RID005', date: '2024-01-13', pickup: 'Airport', dropoff: 'DHA Phase 6' }
  ]

  // Lost item options
  const lostItems = [
    { value: 'keys', label: 'Keys' },
    { value: 'wallet', label: 'Wallet/Purse' },
    { value: 'phone', label: 'Mobile Phone' },
    { value: 'bag', label: 'Bag/Backpack' },
    { value: 'other', label: 'Other' }
  ]

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: 'How do I go online and start accepting rides?',
      answer: 'Tap the "Go Online" toggle on your home screen. Make sure your location services are enabled and you have a stable internet connection. You\'ll start receiving ride requests once you\'re online.'
    },
    {
      id: 2,
      question: 'When and how do I get paid?',
      answer: 'Earnings are calculated weekly and transferred to your registered bank account every Tuesday. You can view your earnings breakdown in the Wallet section and download detailed reports.'
    },
    {
      id: 3,
      question: 'What should I do if a passenger cancels?',
      answer: 'If a passenger cancels after you\'ve started driving to the pickup location, you may be eligible for a cancellation fee. This will be automatically added to your earnings if applicable.'
    },
    {
      id: 4,
      question: 'How do I update my vehicle information?',
      answer: 'Go to your Profile page and tap "Edit Vehicle Details". You can update your car model, color, and license plate number. Changes may require verification before being approved.'
    },
    {
      id: 5,
      question: 'What if I have an accident during a ride?',
      answer: 'First, ensure everyone\'s safety and call emergency services if needed. Then contact Sawari support immediately through the app. We provide insurance coverage for active rides.'
    },
    {
      id: 6,
      question: 'How do I report a problem with a passenger?',
      answer: 'After completing the ride, you can rate the passenger and leave feedback. For serious issues, use the "Report Issue" button in your ride history or contact support directly.'
    }
  ]

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Handle FAQ toggle
  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  // Handle chat message send
  const sendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages([...chatMessages, userMessage])
      setNewMessage('')
      
      // Simulate support response
      setTimeout(() => {
        const supportResponse = {
          id: chatMessages.length + 2,
          text: 'Thank you for your message. Our support team will get back to you shortly.',
          sender: 'support',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setChatMessages(prev => [...prev, supportResponse])
      }, 1000)
    }
  }

  // Handle Lost & Found submission
  const handleLostFoundSubmit = () => {
    if (lostFoundStep === 1 && selectedRide) {
      setLostFoundStep(2)
    } else if (lostFoundStep === 2 && selectedItem && (selectedItem !== 'other' || itemDetails.trim())) {
      setShowLostFoundModal(false)
      setShowConfirmation(true)
      // Reset form
      setLostFoundStep(1)
      setSelectedRide('')
      setSelectedItem('')
      setItemDetails('')
    }
  }

  // Reset Lost & Found form
  const resetLostFoundForm = () => {
    setLostFoundStep(1)
    setSelectedRide('')
    setSelectedItem('')
    setItemDetails('')
    setShowLostFoundModal(false)
  }

  // Keyboard navigation for modals
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 font-['Poppins',sans-serif]">
          Help & Support
        </h1>

        {/* Section Navigation */}
        <GlassCard className="p-1 mb-6">
          <div className="flex space-x-1">
            {[
              { id: 'faq', label: 'FAQ', icon: '❓' },
              { id: 'contact', label: 'Contact', icon: '💬' },
              { id: 'lost-found', label: 'Lost & Found', icon: '🔍' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeSection === section.id
                    ? 'bg-theme-accent text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-white hover:bg-opacity-10'
                }`}
                aria-pressed={activeSection === section.id}
              >
                <span>{section.icon}</span>
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* FAQ Section */}
        {activeSection === 'faq' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {faqData.map((faq) => (
                <GlassCard key={faq.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    onKeyDown={(e) => handleKeyDown(e, () => toggleFAQ(faq.id))}
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-white hover:bg-opacity-5 transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-inset"
                    aria-expanded={openFAQ === faq.id}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span className="font-medium pr-4">{faq.question}</span>
                    <motion.svg
                      animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 text-theme-secondary flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openFAQ === faq.id && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-theme-secondary border-t border-theme-secondary border-opacity-20">
                          <div className="pt-4">{faq.answer}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact Section */}
        {activeSection === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <GlassCard className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">Live Chat Support</h3>
                  <p className="text-theme-secondary mb-4">
                    Get instant help from our support team
                  </p>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="bg-theme-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                  >
                    Start Chat
                  </button>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📞</div>
                  <h3 className="text-lg font-semibold mb-2">Emergency Support</h3>
                  <p className="text-theme-secondary mb-4">
                    24/7 emergency helpline for urgent issues
                  </p>
                  <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-theme-base">
                    Call Emergency
                  </button>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Lost & Found Section */}
        {activeSection === 'lost-found' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">Lost & Found</h3>
                <p className="text-theme-secondary mb-6">
                  Help passengers recover items left in your vehicle
                </p>
                <button
                  onClick={() => setShowLostFoundModal(true)}
                  className="bg-theme-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                >
                  Report Lost Item
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              className="bg-theme-base w-full max-w-md h-96 rounded-t-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="bg-theme-accent text-white p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Support Chat</h3>
                    <p className="text-sm opacity-90">Online now</p>
                  </div>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    aria-label="Close chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-theme-accent text-white'
                            : 'bg-theme-secondary bg-opacity-20 text-theme-primary'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-theme-secondary border-opacity-20">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 p-2 rounded-lg bg-theme-secondary bg-opacity-20 border border-transparent focus:border-theme-accent focus:outline-none transition-colors text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-theme-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lost & Found Modal */}
      <AnimatePresence>
        {showLostFoundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={resetLostFoundForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-base rounded-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    Lost & Found - Step {lostFoundStep} of 2
                  </h3>
                  <button
                    onClick={resetLostFoundForm}
                    className="text-theme-secondary hover:text-theme-primary transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base rounded-full p-1"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Step 1: Select Ride */}
                {lostFoundStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select the ride where item was lost:</label>
                      <select
                        value={selectedRide}
                        onChange={(e) => setSelectedRide(e.target.value)}
                        className="w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border border-transparent focus:border-theme-accent focus:outline-none transition-colors"
                        aria-required="true"
                      >
                        <option value="">Choose a recent ride...</option>
                        {recentRides.map((ride) => (
                          <option key={ride.id} value={ride.id}>
                            {ride.id} - {ride.date} ({ride.pickup} → {ride.dropoff})
                          </option>
                        ))}
                        <option value="unknown">Don't know the ride</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={resetLostFoundForm}
                        className="flex-1 py-3 px-4 rounded-lg border border-theme-secondary border-opacity-30 text-theme-secondary hover:bg-theme-secondary hover:bg-opacity-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleLostFoundSubmit}
                        disabled={!selectedRide}
                        className="flex-1 py-3 px-4 rounded-lg bg-theme-accent text-white font-medium hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Select Item */}
                {lostFoundStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">What item was lost?</label>
                      <select
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        className="w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border border-transparent focus:border-theme-accent focus:outline-none transition-colors"
                        aria-required="true"
                      >
                        <option value="">Select lost item...</option>
                        {lostItems.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedItem === 'other' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Please describe the item:</label>
                        <textarea
                          value={itemDetails}
                          onChange={(e) => setItemDetails(e.target.value)}
                          placeholder="Describe the lost item in detail..."
                          rows={3}
                          className="w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border border-transparent focus:border-theme-accent focus:outline-none transition-colors resize-none"
                          aria-required="true"
                        />
                      </div>
                    )}
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setLostFoundStep(1)}
                        className="flex-1 py-3 px-4 rounded-lg border border-theme-secondary border-opacity-30 text-theme-secondary hover:bg-theme-secondary hover:bg-opacity-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleLostFoundSubmit}
                        disabled={!selectedItem || (selectedItem === 'other' && !itemDetails.trim())}
                        className="flex-1 py-3 px-4 rounded-lg bg-theme-accent text-white font-medium hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-base rounded-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
                <p className="text-theme-secondary mb-6">
                  The passenger will be notified about their lost item. We'll help coordinate the return.
                </p>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full py-3 px-4 rounded-lg bg-theme-accent text-white font-medium hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-theme-base"
                >
                  Done
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

export default CaptainHelp