import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import Navbar from '../../components/Navbar'
import LiveMap from '../../components/LiveMap'
import EnhancedSearchBar from '../../components/EnhancedSearchBar'
import useCurrentLocation from '../../customHooks/useCurrentLocation'
import useUserLocationFetcher from '../../customHooks/UserLocationFetcher'
import { useReverseGeocode } from '../../customHooks/useReverseGeocode'
import axios from 'axios'

// Enhanced Design System Tokens
const designTokens = {
  colors: {
    primary: '#4DA6FF',
    secondary: '#EFBFFF', 
    accent: '#FFD65C',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    textPrimary: '#0A0A0A',
    textSecondary: '#374151',
    textInverse: '#FFFFFF',
    surface: 'rgba(255, 255, 255, 0.95)',
    surfaceElevated: 'rgba(255, 255, 255, 0.98)',
    overlay: 'rgba(0, 0, 0, 0.4)'
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 8px 24px rgba(0, 0, 0, 0.12)',
    lg: '0 16px 32px rgba(0, 0, 0, 0.16)',
    xl: '0 24px 48px rgba(0, 0, 0, 0.20)'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  }
}

// Enhanced animation variants
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
  
  // Enhanced location and map states with proper wiring
  const { coords, loading: locationLoading, error: locationError, getCurrentPosition, retry: retryLocation, permission } = useCurrentLocation()
  const locationFetcher = useUserLocationFetcher()
  const { address: reverseGeocodedAddress, loading: geocodeLoading, error: geocodeError } = useReverseGeocode(coords, true)
  
  const [pickupLocation, setPickupLocation] = useState(null)
  const [pickupAddress, setPickupAddress] = useState('')
  const [isPickupConfirmed, setIsPickupConfirmed] = useState(false)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [destinationAddress, setDestinationAddress] = useState('')
  const [mapKey, setMapKey] = useState(0)
  const [showLocationError, setShowLocationError] = useState(false)
  const [manualPickupEntry, setManualPickupEntry] = useState(false)
  const [isPickupInputFocused, setIsPickupInputFocused] = useState(false)
  const [isDestinationInputFocused, setIsDestinationInputFocused] = useState(false)
  
  // Enhanced UI states
  const [bottomSheetHeight, setBottomSheetHeight] = useState('collapsed') // 'collapsed', 'half', 'full'
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [isDraggingPin, setIsDraggingPin] = useState(false)
  
  // UI states
  const [showRideOptions, setShowRideOptions] = useState(false)
  const [selectedRideType, setSelectedRideType] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSafetyToolkit, setShowSafetyToolkit] = useState(false)
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [promoBannerDismissed, setPromoBannerDismissed] = useState(false)
  
  // Ride booking states
  const [isBookingRide, setIsBookingRide] = useState(false)
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState('cash')
  
  // Mock data states
  const [savedPlaces, setSavedPlaces] = useState([
    { id: 1, name: 'Home', address: 'DHA Phase 5, Lahore', type: 'home', icon: '🏠' },
    { id: 2, name: 'Work', address: 'Packages Mall, Lahore', type: 'work', icon: '🏢' },
    { id: 3, name: 'Gym', address: 'Fitness First, Gulberg', type: 'favorite', icon: '💪' }
  ])
  
  // Ride options with pricing
  const rideOptions = [
    {
      id: 'economy',
      name: 'Economy',
      icon: '🚗',
      description: 'Affordable rides',
      eta: '3-5 min',
      basePrice: 150,
      pricePerKm: 25,
      color: '#4DA6FF'
    },
    {
      id: 'comfort',
      name: 'Comfort',
      icon: '🚙',
      description: 'Premium vehicles',
      eta: '4-6 min',
      basePrice: 200,
      pricePerKm: 35,
      color: '#EFBFFF'
    },
    {
      id: 'xl',
      name: 'XL',
      icon: '🚐',
      description: 'Extra space, 6 seats',
      eta: '5-8 min',
      basePrice: 300,
      pricePerKm: 45,
      color: '#7CE7E1'
    },
    {
      id: 'bike',
      name: 'Bike',
      icon: '🏍️',
      description: 'Quick & economical',
      eta: '2-4 min',
      basePrice: 80,
      pricePerKm: 15,
      color: '#FFD65C'
    }
  ]
  
  // Payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: '💵', description: 'Pay with cash' },
    { id: 'card', name: 'Credit Card', icon: '💳', description: '**** **** **** 1234' },
    { id: 'wallet', name: 'Sawari Wallet', icon: '💰', description: 'PKR 1,250 available' }
  ]
  
  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'Welcome bonus!',
      message: 'Get 20% off your next 3 rides',
      time: '2 hours ago',
      type: 'promotion',
      icon: '🎉'
    },
    {
      id: 2,
      title: 'Rate your last ride',
      message: 'How was your trip with Captain Ahmed?',
      time: '1 day ago',
      type: 'feedback',
      icon: '⭐'
    },
    {
      id: 3,
      title: 'Safety update',
      message: 'New safety features now available',
      time: '2 days ago',
      type: 'safety',
      icon: '🛡️'
    }
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
          } catch (_) {}
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
  }, [isAuthenticated, user, navigate, isInitialized])
  
  // Initialize location on component mount with enhanced error handling
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Check permission state first
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
          if (permissionStatus.state === 'denied') {
            setShowLocationError(true)
            setManualPickupEntry(true)
            return
          }
        }
        
        await getCurrentPosition()
      } catch (error) {
        console.warn('Failed to get current position:', error)
        setShowLocationError(true)
        // Don't immediately show manual entry, give user option to retry
      }
    }
    
    initializeLocation()
  }, [])
  
  // Enhanced pickup location and address management with proper debouncing
  useEffect(() => {
    if (coords && !isPickupConfirmed && !manualPickupEntry && !isPickupInputFocused) {
      const newPickupLocation = {
        lat: coords.latitude,
        lon: coords.longitude,
        label: reverseGeocodedAddress || 'Current Location',
        type: 'current'
      }
      
      setPickupLocation(newPickupLocation)
      setMapKey(prev => prev + 1) // Force map re-render
    }
  }, [coords, isPickupConfirmed, manualPickupEntry, isPickupInputFocused, reverseGeocodedAddress])
  
  // Enhanced pickup address management with proper state wiring
  useEffect(() => {
    // Only auto-fill if user hasn't manually entered anything and input is not focused
    if (reverseGeocodedAddress && !isPickupConfirmed && !manualPickupEntry && !isPickupInputFocused) {
      // Only update if current address is empty or was auto-generated
      if (!pickupAddress || pickupAddress === 'Current Location' || pickupAddress.includes('Unable to fetch')) {
        setPickupAddress(reverseGeocodedAddress)
      }
    } else if (geocodeError && coords && !isPickupConfirmed && !manualPickupEntry && !pickupAddress) {
      setPickupAddress('Unable to fetch address, please enter manually')
    }
  }, [reverseGeocodedAddress, geocodeError, coords, isPickupConfirmed, manualPickupEntry, isPickupInputFocused, pickupAddress])
  
  // Enhanced destination selection with better UX
  const handleDestinationSelect = useCallback((location) => {
    setDestinationLocation(location)
    setDestinationAddress(location.label || '')
    setShowRideOptions(true)
    setBottomSheetHeight('full')
    setMapKey(prev => prev + 1)
    
    // Haptic feedback
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([30, 30, 30])
    }
    
    toast.success('Destination set! Choose your ride \ud83d\ude97', {
      position: 'bottom-center',
      autoClose: 2000
    })
  }, [])
  
  // Enhanced pickup location handling with better UX
  const handlePickupLocationSelect = useCallback((location) => {
    setPickupLocation(location)
    setPickupAddress(location.label || '')
    setManualPickupEntry(true)
    setIsPickupConfirmed(false)
    setMapKey(prev => prev + 1)
    
    // Haptic feedback on mobile
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50)
    }
  }, [])
  
  // Handle pickup address input changes
  const handlePickupAddressChange = useCallback((address) => {
    setPickupAddress(address)
    setManualPickupEntry(true)
    
    // If user clears the field, reset to auto-detection
    if (!address.trim()) {
      setManualPickupEntry(false)
      setIsPickupConfirmed(false)
    }
  }, [])
  
  // Handle destination address input changes
  const handleDestinationAddressChange = useCallback((address) => {
    setDestinationAddress(address)
  }, [])
  
  // Enhanced pickup confirmation with better validation
  const handlePickupConfirmation = useCallback(() => {
    if (!pickupLocation) {
      toast.error('Please select a pickup location', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })
      return
    }
    
    if (!pickupAddress || pickupAddress.includes('Unable to fetch')) {
      toast.error('Please enter a valid pickup address', {
        position: 'bottom-center',
        autoClose: 3000
      })
      return
    }
    
    setIsPickupConfirmed(true)
    setBottomSheetHeight('half') // Expand bottom sheet for destination input
    
    // Haptic feedback
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([50, 50, 50])
    }
    
    toast.success('Pickup location confirmed! 📍', {
      position: 'bottom-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
  }, [pickupLocation, pickupAddress])
  
  // Enhanced location permission retry with better UX
  const handleLocationRetry = useCallback(async () => {
    setShowLocationError(false)
    setManualPickupEntry(false)
    setIsPickupConfirmed(false)
    
    try {
      await getCurrentPosition()
      toast.success('Location access enabled! 🎯', {
        position: 'bottom-center',
        autoClose: 2000
      })
    } catch (error) {
      setShowLocationError(true)
      toast.error('Please enable location access or enter manually', {
        position: 'bottom-center',
        autoClose: 4000
      })
    }
  }, [getCurrentPosition])
  
  // Handle saved place selection
  const handleSavedPlaceSelect = (place) => {
    const location = {
      lat: place.lat || (31.5204 + Math.random() * 0.1),
      lon: place.lon || (74.3587 + Math.random() * 0.1),
      label: place.address,
      type: 'saved'
    }
    handleDestinationSelect(location)
  }
  
  // Handle ride booking
  const handleBookRide = async () => {
    if (!selectedRideType || !pickupLocation || !destinationLocation) {
      toast.error('Please select pickup and destination locations')
      return
    }
    
    setIsBookingRide(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Ride booked successfully! Looking for nearby drivers...')
      setShowRideOptions(false)
      setSelectedRideType(null)
      
      // In a real app, navigate to ride tracking page
      setTimeout(() => {
        toast.info('Driver found! Ahmed is on the way (3 min ETA)')
      }, 3000)
      
    } catch (error) {
      toast.error('Failed to book ride. Please try again.')
    } finally {
      setIsBookingRide(false)
    }
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#1A1A1A] text-white'>
        <Navbar />
        <div className='flex items-center justify-center min-h-[calc(100vh-56px)]'>
          <div className='flex items-center gap-3'>
            <svg className='w-6 h-6 animate-spin text-[#4DA6FF]' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
            <span className='text-lg font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Loading...</span>
          </div>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (profileError) {
    return (
      <div className='min-h-screen bg-[#1A1A1A] text-white'>
        <Navbar />
        <div className='flex items-center justify-center min-h-[calc(100vh-56px)]'>
          <div className='text-center max-w-md mx-auto px-6'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center'>
              <svg className='w-8 h-8 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <h2 className='text-xl font-semibold mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Unable to Load</h2>
            <p className='text-gray-300 mb-6' style={{ fontFamily: 'Inter, system-ui' }}>{profileError}</p>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-[#4DA6FF] text-white rounded-lg font-medium hover:bg-[#4DA6FF]/90 transition-colors'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const firstName = profile?.firstname || profile?.firstName || user?.firstname || user?.firstName || 'User'
  
  return (
    <div className='min-h-screen bg-[#1A1A1A] text-white relative overflow-hidden'>
      <Navbar />
      
      {/* Enhanced Background gradient orbs with better positioning */}
      <div className='pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-[#4DA6FF]/20 via-[#EFBFFF]/15 to-[#FFD65C]/10 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-32 -right-32 h-[120vh] w-96 rounded-full bg-gradient-to-tr from-[#7CE7E1]/15 via-[#4DA6FF]/20 to-[#EFBFFF]/10 blur-3xl' />
      <div className='pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[80vh] w-[80vw] rounded-full bg-gradient-to-r from-[#4DA6FF]/5 to-[#EFBFFF]/5 blur-3xl' />
      
      {/* Enhanced Header Section with better spacing and typography */}
      <div className='relative z-10 px-6 py-6 border-b border-white/10 backdrop-blur-xl bg-white/5'>
        <div className='max-w-screen-xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animations.easeOut}
            className='flex items-center justify-between'
          >
            {/* Enhanced Greeting and Profile */}
            <div className='flex items-center gap-6'>
              <div className='relative'>
                <div className='w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center text-2xl font-bold text-white shadow-xl border-2 border-white/40 backdrop-blur-sm'>
                  {profile?.profilePic ? (
                    <img 
                      src={`http://localhost:3000${profile.profilePic}`} 
                      alt='Profile' 
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] ${profile?.profilePic ? 'hidden' : 'flex'}`}>
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                </div>
                {/* Online status indicator */}
                <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg'></div>
              </div>
              
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  Hey {firstName}! 👋
                </h1>
                <p className='text-lg text-gray-600 mt-1 font-medium' style={{ fontFamily: 'Inter, system-ui' }}>
                  Where would you like to go today?
                </p>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className='flex items-center gap-4'>
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className='relative w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg border border-gray-200/50'
                aria-label='Notifications'
              >
                <span className='text-2xl'>🔔</span>
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={animations.bounce}
                    className='absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg border-2 border-white'
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </button>
              
              {/* Profile Menu */}
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg border border-gray-200/50'
                aria-label='Menu'
              >
                <span className='text-2xl text-gray-700'>☰</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced Promotional Banner */}
      {!promoBannerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ ...animations.easeOut, delay: 0.1 }}
          className='mx-6 mt-4 relative z-10'
        >
          <div className='max-w-screen-xl mx-auto'>
            <div className='rounded-2xl bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] p-[3px] shadow-xl'>
              <div className='rounded-2xl bg-white/98 backdrop-blur-xl p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4 flex-1'>
                    <span className='text-4xl'>🎉</span>
                    <div className='flex-1'>
                      <h3 className='text-lg font-bold text-gray-900 mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Welcome bonus: 20% off next 3 rides!</h3>
                      <p className='text-sm text-gray-600' style={{ fontFamily: 'Inter, system-ui' }}>Valid until end of month • No minimum fare required</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPromoBannerDismissed(true)}
                    className='p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700 min-w-[48px] min-h-[48px] flex items-center justify-center'
                    aria-label='Dismiss banner'
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Main Content Area */}
      <div className='flex-1 relative'>
        {/* Enhanced Map Container with improved overlay design */}
        <div className='relative h-[calc(100vh-180px)] min-h-[600px]'>
          <LiveMap
            key={mapKey}
            pickup={pickupLocation}
            drop={destinationLocation}
            className='w-full h-full rounded-none'
          />
          
          {/* Enhanced Location Error Overlay */}
          {(locationError || showLocationError) && !coords && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={animations.easeOut}
              className='absolute top-6 left-6 right-6 z-[500]'
            >
              <div className='bg-white/95 border-2 border-red-200 rounded-2xl p-6 backdrop-blur-xl shadow-xl'>
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 bg-red-100 rounded-full flex items-center justify-center'>
                    <span className='text-red-600 text-3xl'>⚠️</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-lg font-bold text-red-900' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Location access needed</p>
                    <p className='text-sm text-red-700 mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                      {locationError || 'Enable location to detect your pickup automatically'}
                    </p>
                  </div>
                  <button
                    onClick={handleLocationRetry}
                    className='px-6 py-3 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors font-semibold min-w-[80px] min-h-[48px] shadow-lg'
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Enhanced Geocoding Loading Overlay */}
          {geocodeLoading && coords && !reverseGeocodedAddress && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={animations.easeOut}
              className='absolute top-6 left-6 right-6 z-[500]'
            >
              <div className='bg-white/95 border-2 border-blue-200 rounded-2xl p-6 backdrop-blur-xl shadow-xl'>
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center'>
                    <svg className='w-7 h-7 animate-spin text-blue-600' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <span className='text-lg font-bold text-blue-900' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Getting your address...</span>
                    <p className='text-sm text-blue-700 mt-1' style={{ fontFamily: 'Inter, system-ui' }}>Please wait a moment</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Enhanced Safety and Utility Buttons */}
          <div className='absolute top-6 right-6 flex flex-col gap-3 z-[500]'>
            {/* Safety Toolkit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSafetyToolkit(true)}
              className='w-16 h-16 bg-red-600/95 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all duration-300 shadow-xl border-2 border-red-500/30'
              title='Safety Toolkit'
              aria-label='Safety Toolkit'
            >
              <span className='text-2xl'>🛡️</span>
            </motion.button>
            
            {/* Re-center Map Button */}
            {pickupLocation && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMapKey(prev => prev + 1)}
                className='w-16 h-16 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-xl border-2 border-gray-200/50'
                title='Re-center map'
                aria-label='Re-center map'
              >
                <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Enhanced Search Container with Proper Address Wiring */}
        <div className='absolute bottom-0 left-0 right-0 z-[600] p-6 pb-8'>
          <div className='max-w-screen-xl mx-auto space-y-4'>
            {/* Enhanced Pickup Location Bar with Proper State Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...animations.easeOut, delay: 0.2 }}
              className='w-full'
            >
              <div className='flex items-center gap-4 p-2 bg-white/98 backdrop-blur-xl rounded-2xl border-2 border-gray-200/60 shadow-xl'>
                <div className='w-5 h-5 rounded-full bg-green-500 shadow-lg ml-2'></div>
                <div className='flex-1 min-w-0'>
                  <EnhancedSearchBar
                    mode='pickup'
                    placeholder={geocodeLoading ? 'Getting your location...' : coords && !reverseGeocodedAddress ? 'Fetching address...' : 'Enter pickup location'}
                    onLocationSelect={handlePickupLocationSelect}
                    value={pickupAddress}
                    onChange={handlePickupAddressChange}
                    onFocus={() => setIsPickupInputFocused(true)}
                    onBlur={() => setIsPickupInputFocused(false)}
                    className='text-lg'
                    showCurrentLocationButton={!coords}
                    onRequestCurrentLocation={handleLocationRetry}
                    disabled={geocodeLoading}
                  />
                </div>
                {pickupLocation && !isPickupConfirmed && pickupAddress && !pickupAddress.includes('Unable to fetch') && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePickupConfirmation}
                    className='px-6 py-4 bg-green-600 text-white rounded-xl text-base hover:bg-green-700 transition-colors font-semibold min-w-[100px] min-h-[56px] shadow-lg mr-2'
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    Confirm
                  </motion.button>
                )}
                {isPickupConfirmed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={animations.bounce}
                    className='flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl border border-green-200 mr-2'
                  >
                    <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M5 13l4 4L19 7' />
                    </svg>
                    <span className='text-base text-green-800 font-bold' style={{ fontFamily: 'Inter, system-ui' }}>Confirmed</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Enhanced Destination Search Bar */}
            {isPickupConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...animations.easeOut, delay: 0.3 }}
                className='w-full'
              >
                <div className='flex items-center gap-4 p-2 bg-white/98 backdrop-blur-xl rounded-2xl border-2 border-gray-200/60 shadow-xl'>
                  <div className='w-5 h-5 rounded-full bg-red-500 shadow-lg ml-2'></div>
                  <div className='flex-1'>
                    <EnhancedSearchBar
                      mode='drop'
                      placeholder='Where are you going?'
                      onLocationSelect={handleDestinationSelect}
                      value={destinationAddress}
                      onChange={handleDestinationAddressChange}
                      onFocus={() => setIsDestinationInputFocused(true)}
                      onBlur={() => setIsDestinationInputFocused(false)}
                      className='text-lg'
                      autoFocus={true}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Enhanced Quick Shortcuts with Better UX */}
            {isPickupConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...animations.easeOut, delay: 0.4 }}
                className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {savedPlaces.map((place, index) => (
                  <motion.button
                    key={place.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...animations.easeOut, delay: 0.5 + index * 0.1 }}
                    onClick={() => handleSavedPlaceSelect(place)}
                    className='flex items-center gap-3 px-6 py-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/60 hover:bg-white hover:shadow-lg transition-all duration-300 whitespace-nowrap min-h-[56px]'
                  >
                    <span className='text-2xl'>{place.icon}</span>
                    <span className='text-lg font-semibold text-gray-800' style={{ fontFamily: 'Inter, system-ui' }}>{place.name}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
            
            {/* Enhanced Location Permission Prompt */}
            {!coords && !manualPickupEntry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...animations.easeOut, delay: 0.2 }}
                className='w-full'
              >
                <div className='bg-white/98 backdrop-blur-xl rounded-2xl p-8 border-2 border-blue-200/60 shadow-xl'>
                  <div className='flex items-center gap-6 mb-6'>
                    <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-4xl'>📍</span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-xl font-bold text-gray-900 mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Enable location for faster pickup</h3>
                      <p className='text-base text-gray-600' style={{ fontFamily: 'Inter, system-ui' }}>We'll detect your location automatically to make booking easier</p>
                    </div>
                  </div>
                  <div className='flex gap-4'>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLocationRetry}
                      className='flex-1 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors min-h-[56px] shadow-lg'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    >
                      Enable Location
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setManualPickupEntry(true)}
                      className='flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors min-h-[56px] shadow-lg'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    >
                      Enter Manually
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Ride Options Bottom Sheet */}
      <AnimatePresence>
        {showRideOptions && destinationLocation && (
          <>
            {/* Enhanced Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[700]'
              onClick={() => setShowRideOptions(false)}
            />
            
            {/* Enhanced Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={animations.spring}
              className='fixed bottom-0 left-0 right-0 z-[800] bg-white/98 backdrop-blur-xl border-t-2 border-gray-200/60 rounded-t-3xl max-h-[80vh] overflow-y-auto shadow-2xl'
            >
              <div className='p-6'>
                {/* Handle */}
                <div className='w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-6'></div>
                
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-3xl font-bold text-gray-900' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Choose your ride</h3>
                  <button
                    onClick={() => setShowRideOptions(false)}
                    className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 min-h-[48px]'
                    aria-label='Close'
                  >
                    ✕
                  </button>
                </div>
                
                {/* Enhanced Route Summary */}
                <div className='mb-8 p-6 bg-gray-50/80 rounded-2xl border border-gray-200/60'>
                  <div className='space-y-5'>
                    <div className='flex items-center gap-4'>
                      <div className='w-5 h-5 rounded-full bg-green-500 shadow-lg'></div>
                      <span className='text-lg text-gray-900 font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                        {pickupLocation?.label || pickupAddress || 'Current location'}
                      </span>
                    </div>
                    <div className='flex items-center gap-4 ml-2'>
                      <div className='w-1 h-8 bg-gray-300 rounded-full'></div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='w-5 h-5 rounded-full bg-red-500 shadow-lg'></div>
                      <span className='text-lg text-gray-900 font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                        {destinationLocation?.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Ride Options */}
                <div className='space-y-4 mb-8'>
                  {rideOptions.map((option) => {
                    const estimatedPrice = option.basePrice + (option.pricePerKm * 5) // Rough distance estimate
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRideType(option)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 ${
                          selectedRideType?.id === option.id
                            ? 'border-[#4DA6FF] bg-[#4DA6FF]/5 shadow-lg'
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-5'>
                            <div className='w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg' style={{ backgroundColor: option.color + '30' }}>
                              {option.icon}
                            </div>
                            <div className='text-left'>
                              <h4 className='text-xl font-bold text-gray-900 mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{option.name}</h4>
                              <p className='text-base text-gray-600 mb-1' style={{ fontFamily: 'Inter, system-ui' }}>{option.description}</p>
                              <p className='text-sm text-gray-500' style={{ fontFamily: 'Inter, system-ui' }}>ETA: {option.eta}</p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-2xl font-bold text-gray-900' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>PKR {estimatedPrice}</p>
                            <p className='text-sm text-gray-500' style={{ fontFamily: 'Inter, system-ui' }}>Estimated</p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
                
                {/* Enhanced Payment Method */}
                <div className='mb-8'>
                  <button
                    onClick={() => setShowPaymentSelector(true)}
                    className='w-full flex items-center justify-between p-5 bg-gray-50/80 rounded-2xl border border-gray-200/60 hover:bg-gray-100/80 transition-colors'
                  >
                    <div className='flex items-center gap-4'>
                      <span className='text-3xl'>{paymentMethods.find(m => m.id === currentPaymentMethod)?.icon}</span>
                      <div className='text-left'>
                        <p className='text-lg font-semibold text-gray-900' style={{ fontFamily: 'Inter, system-ui' }}>
                          {paymentMethods.find(m => m.id === currentPaymentMethod)?.name}
                        </p>
                        <p className='text-base text-gray-600' style={{ fontFamily: 'Inter, system-ui' }}>
                          {paymentMethods.find(m => m.id === currentPaymentMethod)?.description}
                        </p>
                      </div>
                    </div>
                    <svg className='w-6 h-6 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                    </svg>
                  </button>
                </div>
                
                {/* Enhanced Confirm Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookRide}
                  disabled={!selectedRideType || isBookingRide}
                  className='w-full py-5 bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] rounded-2xl font-bold text-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl min-h-[64px]'
                  style={{ fontFamily: 'Poppins, Inter, system-ui' }}
                >
                  {isBookingRide ? (
                    <div className='flex items-center justify-center gap-3'>
                      <svg className='w-6 h-6 animate-spin' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      <span>Booking your ride...</span>
                    </div>
                  ) : (
                    `Confirm ${selectedRideType?.name || 'Ride'}`
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Profile Menu Modal */}
      <AnimatePresence>
        {showProfileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[700]'
              onClick={() => setShowProfileMenu(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className='fixed top-20 right-4 w-72 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[800]'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6'>
                <div className='space-y-4'>
                  <Link
                    to='/passenger/profile'
                    className='flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors'
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <span className='text-xl'>👤</span>
                    <span className='font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Profile</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      toast.info('Ride history coming soon')
                    }}
                    className='w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left'
                  >
                    <span className='text-xl'>📜</span>
                    <span className='font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Ride History</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      setShowPaymentSelector(true)
                    }}
                    className='w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left'
                  >
                    <span className='text-xl'>💰</span>
                    <span className='font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Wallet</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      setShowSafetyToolkit(true)
                    }}
                    className='w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left'
                  >
                    <span className='text-xl'>🛡️</span>
                    <span className='font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Safety</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      toast.info('Settings coming soon')
                    }}
                    className='w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left'
                  >
                    <span className='text-xl'>⚙️</span>
                    <span className='font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Settings</span>
                  </button>
                  
                  <div className='border-t border-white/10 pt-4'>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        toast.info('Support coming soon')
                      }}
                      className='w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left'
                    >
                      <span className='text-xl'>🆘</span>
                      <span className='font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Help & Support</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[700]'
              onClick={() => setShowNotifications(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className='fixed top-20 right-4 w-80 max-w-[calc(100vw-2rem)] bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[800] max-h-[70vh] overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Notifications</h3>
                  <button
                    onClick={() => {
                      setNotificationCount(0)
                      setShowNotifications(false)
                    }}
                    className='text-sm text-[#4DA6FF] hover:text-[#4DA6FF]/80 transition-colors'
                  >
                    Clear All
                  </button>
                </div>
                
                <div className='space-y-3'>
                  {notifications.map((notification) => (
                    <div key={notification.id} className='flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors'>
                      <span className='text-xl'>{notification.icon}</span>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-sm' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{notification.title}</h4>
                        <p className='text-gray-300 text-xs mt-1' style={{ fontFamily: 'Inter, system-ui' }}>{notification.message}</p>
                        <p className='text-gray-500 text-xs mt-1' style={{ fontFamily: 'Inter, system-ui' }}>{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Payment Method Selector */}
      <AnimatePresence>
        {showPaymentSelector && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[700]'
              onClick={() => setShowPaymentSelector(false)}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='fixed bottom-0 left-0 right-0 z-[800] bg-[#1A1A1A]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl'
            >
              <div className='p-6'>
                <div className='w-12 h-1 bg-white/20 rounded-full mx-auto mb-6'></div>
                
                <h3 className='text-xl font-bold mb-6' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Payment Method</h3>
                
                <div className='space-y-3 mb-6'>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setCurrentPaymentMethod(method.id)
                        setShowPaymentSelector(false)
                        toast.success(`Payment method changed to ${method.name}`)
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        currentPaymentMethod === method.id
                          ? 'border-[#4DA6FF] bg-[#4DA6FF]/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className='text-2xl'>{method.icon}</span>
                      <div className='flex-1 text-left'>
                        <h4 className='font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{method.name}</h4>
                        <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>{method.description}</p>
                      </div>
                      {currentPaymentMethod === method.id && (
                        <svg className='w-5 h-5 text-[#4DA6FF]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowPaymentSelector(false)}
                  className='w-full py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors'
                  style={{ fontFamily: 'Inter, system-ui' }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Safety Toolkit Modal */}
      <AnimatePresence>
        {showSafetyToolkit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[700]'
              onClick={() => setShowSafetyToolkit(false)}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='fixed bottom-0 left-0 right-0 z-[800] bg-[#1A1A1A]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl'
            >
              <div className='p-6'>
                <div className='w-12 h-1 bg-white/20 rounded-full mx-auto mb-6'></div>
                
                <div className='flex items-center gap-3 mb-6'>
                  <span className='text-2xl'>🛡️</span>
                  <h3 className='text-xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Safety Toolkit</h3>
                </div>
                
                <div className='space-y-4 mb-6'>
                  <button
                    onClick={() => {
                      toast.success('Trip shared with emergency contacts')
                      setShowSafetyToolkit(false)
                    }}
                    className='w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left'
                  >
                    <div className='w-12 h-12 bg-[#4DA6FF]/20 rounded-xl flex items-center justify-center'>
                      <span className='text-xl'>📍</span>
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Share Trip</h4>
                      <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>Share your location with trusted contacts</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = 'tel:15'
                      setShowSafetyToolkit(false)
                    }}
                    className='w-full flex items-center gap-4 p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-left border border-red-500/20'
                  >
                    <div className='w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center'>
                      <span className='text-xl'>🚨</span>
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-semibold text-red-300' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Emergency Call</h4>
                      <p className='text-sm text-red-400' style={{ fontFamily: 'Inter, system-ui' }}>Call emergency services (15)</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      toast.info('Panic button activated - help is on the way')
                      setShowSafetyToolkit(false)
                    }}
                    className='w-full flex items-center gap-4 p-4 bg-yellow-500/10 rounded-xl hover:bg-yellow-500/20 transition-colors text-left border border-yellow-500/20'
                  >
                    <div className='w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center'>
                      <span className='text-xl'>⚠️</span>
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-semibold text-yellow-300' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Panic Button</h4>
                      <p className='text-sm text-yellow-400' style={{ fontFamily: 'Inter, system-ui' }}>Alert emergency contacts immediately</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      toast.info('Support chat coming soon')
                      setShowSafetyToolkit(false)
                    }}
                    className='w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left'
                  >
                    <div className='w-12 h-12 bg-[#EFBFFF]/20 rounded-xl flex items-center justify-center'>
                      <span className='text-xl'>💬</span>
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Chat Support</h4>
                      <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>Get help from our support team</p>
                    </div>
                  </button>
                </div>
                
                <button
                  onClick={() => setShowSafetyToolkit(false)}
                  className='w-full py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors'
                  style={{ fontFamily: 'Inter, system-ui' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PassengerHome