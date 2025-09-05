import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import Navbar from '../../components/Navbar'
import axios from 'axios'
import { formatPKRDisplay } from '../../utils/currency'

// Design tokens are now centralized in ThemeTokens.css and tailwind.config.js

const animations = {
  spring: { type: 'spring', damping: 25, stiffness: 200 },
  easeOut: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
  easeIn: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
  bounce: { type: 'spring', damping: 15, stiffness: 300 }
}

const PassengerHome = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, isInitialized } = useUser()
  
  // Authentication and profile states
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  
  // Dashboard UI states
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSafetyToolkit, setShowSafetyToolkit] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [promoBannerDismissed, setPromoBannerDismissed] = useState(false)
  const [showSawariPinkBanner, setShowSawariPinkBanner] = useState(true)
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState('cash')
  
  // Mock data
  const savedPlaces = [
    { id: 1, name: 'Home', address: 'DHA Phase 5, Lahore', type: 'home', icon: '🏠' },
    { id: 2, name: 'Work', address: 'Packages Mall, Lahore', type: 'work', icon: '🏢' },
    { id: 3, name: 'Gym', address: 'Fitness First, Gulberg', type: 'favorite', icon: '💪' }
  ]
  
  const recentTrips = [
    { id: 1, from: 'DHA Phase 5', to: 'Packages Mall', date: '2 hours ago', fare: 280 },
    { id: 2, from: 'Gulberg', to: 'Liberty Market', date: 'Yesterday', fare: 150 }
  ]
  
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: '💵', description: 'Pay with cash' },
    { id: 'easypaisa', name: 'Easypaisa', icon: '📱', description: 'Digital wallet' },
    { id: 'jazzcash', name: 'JazzCash', icon: '💳', description: 'Mobile payment' }
  ]
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'roman', name: 'Roman Urdu', flag: '🇵🇰' }
  ]
  
  // Redirect if not authenticated or not a passenger
  useEffect(() => {
    if (!isInitialized) return
    
    if (!isAuthenticated || !user || user.type !== 'passenger') {
      navigate('/passenger/login')
      return
    }
  }, [isAuthenticated, user, navigate, isInitialized])
  
  // Fetch passenger profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isInitialized || !isAuthenticated || !user || user.type !== 'passenger') return
      
      try {
        setLoading(true)
        setProfileError(null)
        
        const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
        let token = null
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            token = parsed?.token || null
          } catch (error) {
            // Ignore JSON parse errors
            console.warn('Failed to parse auth token:', error)
          }
        }
        
        const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
        
        const { data } = await axios.get(`${apiBase}/api/passengers/profile`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        
        if (data.success && data.passenger) {
          setProfile(data.passenger)
        } else {
          setProfileError('Failed to load profile data')
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        const message = err?.response?.data?.message || 'Failed to load profile'
        setProfileError(message)
        
        if (err?.response?.status === 401) {
          navigate('/passenger/login')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [isInitialized, isAuthenticated, user, navigate])
  
  // Handle Book a Ride navigation
  const handleBookRide = () => {
    navigate('/passenger/book')
  }
  
  // Handle quick actions
  const handleQuickAction = (action) => {
    switch (action) {
      case 'schedule':
        toast.info('Schedule ride feature coming soon!')
        break
      case 'parcel':
        toast.info('Parcel delivery feature coming soon!')
        break
      case 'saved-places':
        toast.info('Saved places management coming soon!')
        break
      case 'wallet':
        toast.info('Wallet feature coming soon!')
        break
      case 'history':
        toast.info('Ride history feature coming soon!')
        break
      case 'promotions':
        toast.info('Promotions feature coming soon!')
        break
      case 'sos':
        toast.error('Emergency SOS activated!')
        break
      case 'support':
        toast.info('Support chat coming soon!')
        break
      default:
        break
    }
  }
  
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-theme-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (profileError) {
    return (
      <div className="min-h-screen bg-theme-base flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-theme-primary mb-2">Unable to load dashboard</h2>
          <p className="text-theme-secondary mb-4">{profileError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-brand-primary text-theme-primary rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-theme-base text-theme-primary relative overflow-hidden">
      {/* Ambient Background Orbs - matching /about page */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-tertiary/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-brand-secondary/20 via-brand-accent/20 to-brand-primary/20 rounded-full blur-3xl opacity-25"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-brand-tertiary/15 via-brand-primary/15 to-brand-secondary/15 rounded-full blur-3xl opacity-20"></div>

      <Navbar />
      
      {/* Main Dashboard Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animations.easeOut}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-theme-primary mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Welcome back, {profile?.name || user?.name || 'Passenger'}! 👋
          </h1>
          <p className="text-theme-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>Tap Book to pick your pickup & drop locations.</p>
        </motion.div>
        
        {/* Promotional Banner */}
        {!promoBannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ ...animations.easeOut, delay: 0.1 }}
            className="mb-6"
          >
            <div className="rounded-2xl bg-gradient-brand-primary p-[3px] shadow-theme-xl">
              <div className="rounded-2xl bg-theme-surface/95 backdrop-blur-xl p-6 glass-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-4xl">🎉</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-theme-primary mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome bonus: 20% off next 3 rides!</h3>
                      <p className="text-sm text-theme-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>Valid until end of month • No minimum fare required</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPromoBannerDismissed(true)}
                    className="p-3 hover:bg-white/10 rounded-xl transition-colors text-theme-subtle hover:text-theme-secondary min-w-[48px] min-h-[48px] flex items-center justify-center"
                    aria-label="Dismiss banner"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Primary Book a Ride CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...animations.easeOut, delay: 0.2 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBookRide}
            className="w-full p-8 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-tertiary rounded-3xl text-theme-primary shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            aria-label="Book a ride - Navigate to booking page"
            role="button"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🚗</div>
              <h2 className="text-3xl font-bold mb-2">Book a Ride</h2>
              <p className="text-lg opacity-90">Get a ride in minutes</p>
            </div>
          </motion.button>
        </motion.div>
        
        {/* Sawari Pink Banner */}
        {showSawariPinkBanner && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...animations.easeOut, delay: 0.3 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-brand-secondary to-[#FF69B4] rounded-2xl p-6 text-theme-primary shadow-[0_8px_30px_rgba(0,0,0,0.25)]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">👩</span>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Sawari Pink</h3>
                    <p className="text-sm opacity-90">Women-only rides for your safety & comfort</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSawariPinkBanner(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...animations.easeOut, delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'schedule', icon: '📅', label: 'Schedule Ride' },
              { id: 'parcel', icon: '📦', label: 'Parcel Delivery' },
              { id: 'saved-places', icon: '📍', label: 'Saved Places' },
              { id: 'wallet', icon: '💰', label: 'Wallet' },
              { id: 'history', icon: '📜', label: 'Ride History' },
              { id: 'promotions', icon: '🎁', label: 'Promotions' }
            ].map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action.id)}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-md glass-border text-theme-primary transition-all duration-200 min-h-[100px] flex flex-col items-center justify-center text-center hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* Payment Badge & Safety Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...animations.easeOut, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-md glass-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          >
            <h4 className="text-lg font-semibold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Method</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{paymentMethods.find(m => m.id === currentPaymentMethod)?.icon}</span>
              </div>
              <div>
                <p className="font-medium text-theme-primary" style={{ fontFamily: 'Inter, sans-serif' }}>{paymentMethods.find(m => m.id === currentPaymentMethod)?.name}</p>
                <p className="text-sm text-theme-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>{paymentMethods.find(m => m.id === currentPaymentMethod)?.description}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Safety & Support */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...animations.easeOut, delay: 0.6 }}
            className="bg-white/5 backdrop-blur-md glass-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          >
            <h4 className="text-lg font-semibold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Safety & Support</h4>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction('sos')}
                className="flex-1 p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-xl text-center border border-red-500/20 backdrop-blur-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="text-2xl mb-1">🚨</div>
                <div className="text-sm font-medium">SOS</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction('support')}
                className="flex-1 p-4 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 text-brand-primary rounded-xl text-center border border-brand-primary/20 backdrop-blur-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="text-2xl mb-1">💬</div>
                <div className="text-sm font-medium">Support</div>
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Language Toggle & Recent Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...animations.easeOut, delay: 0.7 }}
            className="bg-white/5 backdrop-blur-md glass-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          >
            <h4 className="text-lg font-semibold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Language</h4>
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="w-full flex items-center justify-between p-4 bg-white/5 backdrop-blur-md glass-border rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{languages.find(l => l.code === currentLanguage)?.flag}</span>
                  <span className="font-medium text-theme-primary" style={{ fontFamily: 'Inter, sans-serif' }}>{languages.find(l => l.code === currentLanguage)?.name}</span>
                </div>
                <svg className="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {showLanguageSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md glass-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] z-10"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code)
                          setShowLanguageSelector(false)
                          toast.success(`Language changed to ${lang.name}`)
                        }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/10 transition-colors first:rounded-t-xl last:rounded-b-xl text-theme-primary"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Recent Trips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...animations.easeOut, delay: 0.8 }}
            className="bg-white/5 backdrop-blur-md glass-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          >
            <h4 className="text-lg font-semibold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Recent Trips</h4>
            {recentTrips.length > 0 ? (
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md glass-border rounded-xl hover:bg-white/10 transition-all duration-200">
                    <div className="flex-1">
                      <p className="font-medium text-theme-primary text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{trip.from} → {trip.to}</p>
                      <p className="text-xs text-theme-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>{trip.date}</p>
                    </div>
                    <p className="font-semibold text-theme-primary text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{formatPKRDisplay(trip.fare)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🚗</div>
                <p className="text-theme-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>No recent trips</p>
                <p className="text-sm text-theme-subtle" style={{ fontFamily: 'Inter, sans-serif' }}>Your ride history will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default PassengerHome