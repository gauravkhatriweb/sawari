import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'

const PassengerHome = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUser()
  const [currentLocation, setCurrentLocation] = useState('Getting location...')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3) // Mock notification count
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Search & Destination states
  const [destination, setDestination] = useState('')
  const [destinationError, setDestinationError] = useState('')
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [isDestinationFocused, setIsDestinationFocused] = useState(false)
  
  // Ride selection states
  const [selectedRideType, setSelectedRideType] = useState(null)
  
  // Promotional banner states
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  
  // Bottom navigation states
  const [activeTab, setActiveTab] = useState('home')



  // Mock getting current location
  useEffect(() => {
    // Simulate location detection
    const timer = setTimeout(() => {
      setCurrentLocation('📍 Current Location')
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Promotional banner rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % promotionalBanners.length)
    }, 4000) // Change banner every 4 seconds
    return () => clearInterval(interval)
  }, [])

  // Mock profile data from user context
  useEffect(() => {
    if (user && user.type === 'passenger') {
      setProfile({
        firstname: user.firstname || user.firstName || 'User',
        email: user.email || 'user@example.com',
        isVerified: user.isAccountVerified || user.isVerified || false
      })
    }
  }, [user])

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'Driver on the way',
      message: 'Your driver will arrive in 5 minutes',
      time: '2 min ago',
      type: 'ride',
      icon: '🚗'
    },
    {
      id: 2,
      title: 'Special Offer',
      message: '20% off your next 3 rides',
      time: '1 hour ago',
      type: 'offer',
      icon: '🎉'
    },
    {
      id: 3,
      title: 'Trip completed',
      message: 'Rate your recent trip experience',
      time: '3 hours ago',
      type: 'trip',
      icon: '⭐'
    }
  ]

  // Mock recent destinations and saved places
  const savedPlaces = [
    { id: 1, name: 'Home', address: 'Model Town, Lahore', icon: '🏠', type: 'saved' },
    { id: 2, name: 'Work', address: 'DHA Phase 5, Lahore', icon: '🏢', type: 'saved' },
    { id: 3, name: 'Gym', address: 'Gulberg III, Lahore', icon: '💪', type: 'saved' },
  ]
  
  const recentDestinations = [
    { id: 4, name: 'Emporium Mall', address: 'Johar Town, Lahore', icon: '🛍️', type: 'recent' },
    { id: 5, name: 'Liberty Market', address: 'Gulberg III, Lahore', icon: '🛒', type: 'recent' },
    { id: 6, name: 'Fortress Stadium', address: 'Cantt, Lahore', icon: '🏟️', type: 'recent' },
    { id: 7, name: 'Packages Mall', address: 'Walton Road, Lahore', icon: '🏪', type: 'recent' },
  ]

  // Promotional banners data
  const promotionalBanners = [
    {
      id: 1,
      title: '20% off first 3 rides 🎉',
      description: 'New user special offer',
      gradient: 'linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 100%)',
      icon: '🎉'
    },
    {
      id: 2,
      title: 'Free delivery on orders 📦',
      description: 'Limited time offer',
      gradient: 'linear-gradient(135deg, #7CE7E1 0%, #FFD65C 100%)',
      icon: '📦'
    },
    {
      id: 3,
      title: 'Premium rides at standard rates 🚙',
      description: 'Weekend special',
      gradient: 'linear-gradient(135deg, #EFBFFF 0%, #4DA6FF 100%)',
      icon: '🚙'
    }
  ]

  // Ride types configuration
  const rideTypes = [
    {
      id: 'standard',
      name: 'Standard Ride',
      icon: '🚗',
      description: 'Budget-friendly option for daily commutes',
      eta: '5-8 min',
      price: 'PKR 150',
      rating: '4.8',
      gradient: 'linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 50%, #FFD65C 100%)'
    },
    {
      id: 'premium',
      name: 'Premium Ride',
      icon: '🚙',
      description: 'SUV & luxury vehicles for comfort',
      eta: '6-10 min',
      price: 'PKR 280',
      rating: '4.9',
      gradient: 'linear-gradient(135deg, #EFBFFF 0%, #7CE7E1 50%, #4DA6FF 100%)'
    },
    {
      id: 'bike',
      name: 'Bike Ride',
      icon: '🛵',
      description: 'Cheap & fast for quick trips',
      eta: '3-5 min',
      price: 'PKR 80',
      rating: '4.7',
      gradient: 'linear-gradient(135deg, #7CE7E1 0%, #FFD65C 50%, #4DA6FF 100%)'
    },
    {
      id: 'delivery',
      name: 'Delivery',
      icon: '📦',
      description: 'Send parcels & documents safely',
      eta: '15-30 min',
      price: 'PKR 120',
      rating: '4.6',
      gradient: 'linear-gradient(135deg, #FFD65C 0%, #4DA6FF 50%, #EFBFFF 100%)'
    }
  ]

  // Bottom navigation configuration
  const bottomNavTabs = [
    {
      id: 'home',
      name: 'Home',
      icon: '🏠',
      path: '/passenger/home'
    },
    {
      id: 'trips',
      name: 'Trips',
      icon: '📜',
      path: '/passenger/trips'
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: '💳',
      path: '/passenger/wallet'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: '👤',
      path: '/passenger/profile'
    }
  ]

  // Validation functions
  const validateDestination = (value) => {
    setDestinationError('')
    
    if (!value.trim()) {
      setDestinationError('Please enter destination')
      return false
    }
    
    // Check for invalid characters (allow letters, numbers, spaces, common punctuation)
    const invalidChars = /[^a-zA-Z0-9\s\-.,#()]/
    if (invalidChars.test(value)) {
      setDestinationError('Invalid characters in destination')
      return false
    }
    
    if (value.trim().length < 2) {
      setDestinationError('Destination must be at least 2 characters')
      return false
    }
    
    return true
  }

  const handleDestinationChange = (e) => {
    const value = e.target.value
    setDestination(value)
    
    // Show dropdown when typing
    if (value.length > 0) {
      setShowDestinationDropdown(true)
    } else {
      setShowDestinationDropdown(false)
    }
    
    // Clear error when user starts typing
    if (destinationError) {
      setDestinationError('')
    }
  }

  const handleDestinationBlur = () => {
    setIsDestinationFocused(false)
    // Validate on blur
    if (destination.trim()) {
      validateDestination(destination)
    }
    // Delay hiding dropdown to allow clicks
    setTimeout(() => {
      setShowDestinationDropdown(false)
    }, 200)
  }

  const handleDestinationFocus = () => {
    setIsDestinationFocused(true)
    if (destination.length > 0) {
      setShowDestinationDropdown(true)
    }
  }

  const selectDestination = (place) => {
    setDestination(place.name)
    setShowDestinationDropdown(false)
    setDestinationError('')
    toast.success(`Destination set to ${place.name}`)
  }

  const handleSearch = () => {
    if (validateDestination(destination)) {
      toast.success(`Searching for rides to ${destination}`)
      // Here would be the actual search logic
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/passenger/login')
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Logout failed')
    }
  }

  const handleLocationSelect = (location) => {
    setCurrentLocation(location.name)
    setLocationDropdownOpen(false)
    toast.success(`Location set to ${location.name}`)
  }

  const markNotificationAsRead = (notificationId) => {
    setNotificationCount(prev => Math.max(0, prev - 1))
  }

  // Ride selection handler
  const handleRideSelection = (rideType) => {
    setSelectedRideType(rideType)
    toast.success(`${rideType.name} selected`)
  }

  // CTA validation and handler
  const handleConfirmRide = () => {
    // Validate destination
    if (!destination.trim()) {
      toast.error('Please enter destination')
      return
    }
    
    // Validate ride type selection
    if (!selectedRideType) {
      toast.error('Please select a ride option')
      return
    }
    
    // If both validations pass
    toast.success(`Confirming ${selectedRideType.name} to ${destination}`)
    // Here would be the actual ride booking logic
  }

  // Check if CTA should be disabled
  const isCTADisabled = !destination.trim() || !!destinationError

  // Bottom navigation handler
  const handleBottomNavigation = (tab) => {
    setActiveTab(tab.id)
    if (tab.path !== '/passenger/home') {
      // For other tabs, show coming soon toast for now
      toast.info(`${tab.name} section coming soon!`)
      // In a real app, you would navigate: navigate(tab.path)
    }
  }

  if (!isAuthenticated || !user || user.type !== 'passenger') {
    return null
  }

  return (
    <div className='min-h-screen bg-[#1A1A1A] text-white overflow-x-hidden'>
      {/* Top Navigation Header */}
      <header className='sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-white/10'>
        <div className='mx-auto max-w-screen-xl px-4 sm:px-6 py-3 sm:py-4'>
          <div className='flex items-center justify-between'>
            
            {/* Left: Location Selector */}
            <div className='relative flex-shrink-0'>
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className='flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs sm:text-sm'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <span className='text-[#4DA6FF]'>📍</span>
                <span className='font-medium hidden sm:inline'>{currentLocation}</span>
                <span className='font-medium sm:hidden'>📍</span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {/* Location Dropdown */}
              <AnimatePresence>
                {locationDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className='absolute top-12 left-0 w-72 sm:w-80 bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden'
                  >
                    <div className='p-4 border-b border-white/10'>
                      <h3 className='font-semibold text-white mb-2 text-sm sm:text-base' style={{ fontFamily: 'Inter, system-ui' }}>Select Location</h3>
                      <div className='relative'>
                        <input
                          type='text'
                          placeholder='Search for a location...'
                          className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent text-sm'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        />
                        <svg className='absolute right-3 top-2.5 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                      </div>
                    </div>
                    <div className='p-2 max-h-64 overflow-y-auto'>
                      <div className='mb-2'>
                        <p className='text-xs text-gray-400 px-2 py-1' style={{ fontFamily: 'Inter, system-ui' }}>Recent Locations</p>
                      </div>
                      {recentDestinations.slice(0, 4).map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleLocationSelect(location)}
                          className='w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left'
                        >
                          <span className='text-lg'>{location.icon}</span>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-white truncate' style={{ fontFamily: 'Inter, system-ui' }}>{location.name}</p>
                            <p className='text-xs text-gray-400 truncate' style={{ fontFamily: 'Inter, system-ui' }}>{location.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Center: Logo/Brand */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center'>
                <span className='text-white font-bold text-xs sm:text-sm'>S</span>
              </div>
              <span className='font-bold text-sm sm:text-lg hidden sm:inline' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Sawari</span>
            </div>

            {/* Right: Notifications & Profile */}
            <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
              
              {/* Notifications Bell */}
              <div className='relative'>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className='relative p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors'
                >
                  <svg className='w-4 h-4 sm:w-5 sm:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                  </svg>
                  {notificationCount > 0 && (
                    <span className='absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className='absolute top-12 right-0 w-72 sm:w-80 bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden'
                    >
                      <div className='p-4 border-b border-white/10'>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-semibold text-white text-sm sm:text-base' style={{ fontFamily: 'Inter, system-ui' }}>Notifications</h3>
                          <button className='text-xs text-[#4DA6FF] hover:text-[#EFBFFF] transition-colors' style={{ fontFamily: 'Inter, system-ui' }}>
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      <div className='max-h-64 overflow-y-auto'>
                        {notifications.map((notification) => (
                          <div key={notification.id} className='p-3 sm:p-4 border-b border-white/5 hover:bg-white/5 transition-colors'>
                            <div className='flex items-start gap-3'>
                              <span className='text-base sm:text-lg flex-shrink-0'>{notification.icon}</span>
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between mb-1'>
                                  <p className='text-xs sm:text-sm font-medium text-white truncate' style={{ fontFamily: 'Inter, system-ui' }}>
                                    {notification.title}
                                  </p>
                                  <span className='text-xs text-gray-400 flex-shrink-0 ml-2' style={{ fontFamily: 'Inter, system-ui' }}>
                                    {notification.time}
                                  </span>
                                </div>
                                <p className='text-xs text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className='p-3 text-center border-t border-white/10'>
                        <button className='text-xs text-[#4DA6FF] hover:text-[#EFBFFF] transition-colors' style={{ fontFamily: 'Inter, system-ui' }}>
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Icon */}
              <div className='relative'>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#4DA6FF] flex items-center justify-center font-bold text-white shadow-lg hover:shadow-xl transition-shadow text-xs sm:text-sm'
                >
                  {profile?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className='absolute top-12 right-0 w-56 sm:w-64 bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden'
                    >
                      {/* User info header */}
                      <div className='px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#4DA6FF]/10 via-[#EFBFFF]/10 to-[#7CE7E1]/10'>
                        <p className='text-sm font-semibold truncate' style={{ fontFamily: 'Inter, system-ui' }}>
                          {profile?.firstname || 'User'}
                        </p>
                        <p className='text-xs text-gray-300 truncate' style={{ fontFamily: 'Inter, system-ui' }}>
                          {profile?.email || 'user@example.com'}
                        </p>
                        {!profile?.isVerified && (
                          <div className='mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300'>
                            <span className='text-xs'>⚠️</span>
                            <span className='text-xs font-medium'>Unverified</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Menu items */}
                      <div className='py-2'>
                        <Link 
                          to='/passenger/profile' 
                          onClick={() => setProfileDropdownOpen(false)}
                          className='w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#4DA6FF] flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                          </svg>
                          <span className='truncate'>Account Settings</span>
                        </Link>
                        
                        <button 
                          className='w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#4DA6FF] flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                          </svg>
                          <span className='truncate'>Payment Methods</span>
                        </button>
                        
                        <button 
                          className='w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#4DA6FF] flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                          <span className='truncate'>Trip History</span>
                        </button>
                        
                        <button 
                          className='w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#4DA6FF] flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' />
                          </svg>
                          <span className='truncate'>Help & Support</span>
                        </button>
                        
                        <hr className='my-2 border-white/10' />
                        
                        <button 
                          onClick={handleLogout}
                          className='w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-400'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                          </svg>
                          <span className='truncate'>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Background gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-20' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-15' />

      {/* Main Content */}
      <main className='relative z-10 mx-auto max-w-screen-xl px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-28'>
        {loading ? (
          <div className='flex items-center justify-center h-64 sm:h-96'>
            <div className='flex items-center gap-3'>
              <svg className='w-6 h-6 animate-spin text-[#4DA6FF]' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              <span className='text-sm sm:text-lg font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Loading your home screen...</span>
            </div>
          </div>
        ) : (
          <div className='space-y-6 sm:space-y-8'>
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-center'
            >
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Welcome back, {profile?.firstname || 'User'}! 👋
              </h1>
              <p className='text-sm sm:text-base text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                Where would you like to go today?
              </p>
            </motion.div>

            {/* Search & Destination Input Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className='rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'
            >
              <div className='space-y-4'>
                {/* Destination Search */}
                <div className='relative'>
                  <label htmlFor='destination' className='block text-sm font-medium mb-2 text-white' style={{ fontFamily: 'Inter, system-ui' }}>
                    Where are you going?
                  </label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' stroke='currentColor'/>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' stroke='currentColor'/>
                      </svg>
                    </span>
                    <input
                      id='destination'
                      type='text'
                      value={destination}
                      onChange={handleDestinationChange}
                      onFocus={handleDestinationFocus}
                      onBlur={handleDestinationBlur}
                      placeholder='Enter your destination...'
                      className={`w-full rounded-xl border pl-10 pr-4 py-3 sm:py-4 text-sm sm:text-base placeholder-gray-500 focus:outline-none transition-colors ${
                        destinationError 
                          ? 'border-red-500 bg-red-500/10 text-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                          : 'border-white/10 bg-[#111111] text-white focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent'
                      }`}
                      style={{ fontFamily: 'Inter, system-ui' }}
                    />
                    {destination && (
                      <button
                        onClick={() => {
                          setDestination('')
                          setDestinationError('')
                          setShowDestinationDropdown(false)
                        }}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Error Message */}
                  {destinationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 flex items-center gap-2 text-red-400'
                    >
                      <svg className='w-4 h-4 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <span className='text-xs sm:text-sm' style={{ fontFamily: 'Inter, system-ui' }}>{destinationError}</span>
                    </motion.div>
                  )}

                  {/* Auto-suggest Dropdown */}
                  <AnimatePresence>
                    {showDestinationDropdown && (destination.length > 0 || isDestinationFocused) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className='absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50'
                      >
                        {/* Saved Places */}
                        {savedPlaces.length > 0 && (
                          <div className='p-2 border-b border-white/10'>
                            <p className='text-xs text-gray-400 px-2 py-1 mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Saved Places</p>
                            {savedPlaces.map((place) => (
                              <button
                                key={place.id}
                                onClick={() => selectDestination(place)}
                                className='w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left'
                              >
                                <span className='text-lg flex-shrink-0'>{place.icon}</span>
                                <div className='flex-1 min-w-0'>
                                  <p className='text-sm font-medium text-white truncate' style={{ fontFamily: 'Inter, system-ui' }}>{place.name}</p>
                                  <p className='text-xs text-gray-400 truncate' style={{ fontFamily: 'Inter, system-ui' }}>{place.address}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Recent Destinations */}
                        {recentDestinations.length > 0 && (
                          <div className='p-2'>
                            <p className='text-xs text-gray-400 px-2 py-1 mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Recent Destinations</p>
                            {recentDestinations.filter(place => 
                              destination === '' || place.name.toLowerCase().includes(destination.toLowerCase()) || place.address.toLowerCase().includes(destination.toLowerCase())
                            ).slice(0, 4).map((place) => (
                              <button
                                key={place.id}
                                onClick={() => selectDestination(place)}
                                className='w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left'
                              >
                                <span className='text-lg flex-shrink-0'>{place.icon}</span>
                                <div className='flex-1 min-w-0'>
                                  <p className='text-sm font-medium text-white truncate' style={{ fontFamily: 'Inter, system-ui' }}>{place.name}</p>
                                  <p className='text-xs text-gray-400 truncate' style={{ fontFamily: 'Inter, system-ui' }}>{place.address}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* No results */}
                        {destination.length > 0 && savedPlaces.length === 0 && recentDestinations.filter(place => 
                          place.name.toLowerCase().includes(destination.toLowerCase()) || place.address.toLowerCase().includes(destination.toLowerCase())
                        ).length === 0 && (
                          <div className='p-4 text-center'>
                            <p className='text-sm text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>No matches found</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={!destination.trim() || !!destinationError}
                  className={`w-full inline-flex items-center justify-center rounded-xl px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                    !destination.trim() || !!destinationError 
                      ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                      : 'bg-[#4DA6FF] hover:brightness-110'
                  }`}
                  style={{ fontFamily: 'Inter, system-ui' }}
                >
                  <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                  Find Rides
                </button>
              </div>
            </motion.div>

            {/* Ride Category Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className='space-y-4'
            >
              <h2 className='text-lg sm:text-xl font-semibold text-white px-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Choose Your Ride
              </h2>
              
              {/* Horizontal Scrollable Carousel */}
              <div className='relative'>
                <div className='flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-2 snap-x snap-mandatory'>
                  {rideTypes.map((rideType, index) => (
                    <motion.div
                      key={rideType.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRideSelection(rideType)}
                      className={`flex-shrink-0 w-64 sm:w-72 p-4 sm:p-6 rounded-2xl cursor-pointer snap-start transition-all duration-200 ${
                        selectedRideType?.id === rideType.id 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1A1A1A] shadow-lg' 
                          : ''
                      }`}
                      style={{
                        background: rideType.gradient
                      }}
                    >
                      <div className='bg-black/20 backdrop-blur-sm rounded-xl p-4 h-full'>
                        <div className='flex items-center justify-between mb-3'>
                          <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center'>
                            <span className='text-2xl sm:text-3xl'>{rideType.icon}</span>
                          </div>
                          <div className='text-right'>
                            <p className='text-xs sm:text-sm text-white/80' style={{ fontFamily: 'Inter, system-ui' }}>ETA</p>
                            <p className='text-sm sm:text-base font-bold text-white' style={{ fontFamily: 'Inter, system-ui' }}>{rideType.eta}</p>
                          </div>
                        </div>
                        <h3 className='text-lg sm:text-xl font-bold text-white mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                          {rideType.name}
                        </h3>
                        <p className='text-xs sm:text-sm text-white/80 mb-3' style={{ fontFamily: 'Inter, system-ui' }}>
                          {rideType.description}
                        </p>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1'>
                            <span className='text-yellow-300 text-sm'>⭐</span>
                            <span className='text-xs sm:text-sm text-white/90' style={{ fontFamily: 'Inter, system-ui' }}>{rideType.rating}</span>
                          </div>
                          <div className='text-right'>
                            <p className='text-xs text-white/80' style={{ fontFamily: 'Inter, system-ui' }}>From</p>
                            <p className='text-lg sm:text-xl font-bold text-white' style={{ fontFamily: 'Inter, system-ui' }}>{rideType.price}</p>
                          </div>
                        </div>
                        
                        {/* Selection indicator */}
                        {selectedRideType?.id === rideType.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className='absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center'
                          >
                            <svg className='w-4 h-4 text-[#4DA6FF]' fill='currentColor' viewBox='0 0 24 24'>
                              <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Scroll Indicator */}
                <div className='flex justify-center mt-3'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-[#4DA6FF]'></div>
                    <div className='w-2 h-2 rounded-full bg-white/30'></div>
                    <div className='w-2 h-2 rounded-full bg-white/30'></div>
                    <div className='w-2 h-2 rounded-full bg-white/30'></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Promotional Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'
            >
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentPromoIndex}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className='p-6 sm:p-8'
                  style={{
                    background: promotionalBanners[currentPromoIndex].gradient
                  }}
                >
                  <div className='relative z-10'>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-2'>
                      <span className='text-2xl sm:text-3xl lg:text-4xl flex-shrink-0'>{promotionalBanners[currentPromoIndex].icon}</span>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 leading-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                          {promotionalBanners[currentPromoIndex].title}
                        </h3>
                        <p className='text-sm sm:text-base text-white/90' style={{ fontFamily: 'Inter, system-ui' }}>
                          {promotionalBanners[currentPromoIndex].description}
                        </p>
                      </div>
                      <button className='w-full sm:w-auto px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg text-white font-medium text-sm border border-white/20 flex-shrink-0' style={{ fontFamily: 'Inter, system-ui' }}>
                        Claim Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Background animation elements */}
                  <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse' />
                  <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse' style={{ animationDelay: '1s' }} />
                </motion.div>
              </AnimatePresence>
              
              {/* Banner indicators */}
              <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2'>
                {promotionalBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPromoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPromoIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
            >
              <button className='p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left group'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#4DA6FF]/20 flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <span className='text-xl sm:text-2xl'>🚗</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-white mb-1 text-sm sm:text-base' style={{ fontFamily: 'Inter, system-ui' }}>Book a Ride</h3>
                    <p className='text-xs sm:text-sm text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>Quick and affordable transportation</p>
                  </div>
                </div>
              </button>

              <button className='p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left group'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EFBFFF]/20 flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <span className='text-xl sm:text-2xl'>📅</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-white mb-1 text-sm sm:text-base' style={{ fontFamily: 'Inter, system-ui' }}>Schedule Ride</h3>
                    <p className='text-xs sm:text-sm text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>Plan your trip in advance</p>
                  </div>
                </div>
              </button>

              <button className='p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left group sm:col-span-2 lg:col-span-1'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#7CE7E1]/20 flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <span className='text-xl sm:text-2xl'>🎁</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-white mb-1 text-sm sm:text-base' style={{ fontFamily: 'Inter, system-ui' }}>Special Offers</h3>
                    <p className='text-xs sm:text-sm text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>Save more on every ride</p>
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Recent Trips or Additional Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className='rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6'
            >
              <h2 className='text-lg sm:text-xl font-semibold mb-4 text-white' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Recent Activity
              </h2>
              <div className='text-center py-6 sm:py-8'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center'>
                  <svg className='w-6 h-6 sm:w-8 sm:h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <p className='text-gray-400 mb-4 text-sm sm:text-base' style={{ fontFamily: 'Inter, system-ui' }}>
                  No recent trips yet
                </p>
                <button className='px-4 sm:px-6 py-2 sm:py-3 bg-[#4DA6FF] text-white rounded-lg hover:bg-[#4DA6FF]/90 transition-colors text-sm sm:text-base' style={{ fontFamily: 'Inter, system-ui' }}>
                  Take your first ride
                </button>
              </div>
            </motion.div>
            
            {/* Bottom CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className='mt-6'
            >
              <div className='rounded-2xl border border-white/10 bg-[#1A1A1A]/95 backdrop-blur-md p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
                {/* Selected ride and destination summary */}
                <div className='mb-4'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3'>
                    <div className='flex items-center gap-3 min-w-0 flex-1'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#4DA6FF]/20 flex items-center justify-center flex-shrink-0'>
                        <span className='text-base sm:text-lg'>{selectedRideType?.icon || '🚗'}</span>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm sm:text-base font-medium text-white truncate' style={{ fontFamily: 'Inter, system-ui' }}>
                          {selectedRideType ? selectedRideType.name : 'Select a ride type'}
                        </p>
                        <p className='text-xs sm:text-sm text-gray-400 truncate' style={{ fontFamily: 'Inter, system-ui' }}>
                          {destination.trim() ? `To: ${destination}` : 'Enter destination above'}
                        </p>
                      </div>
                    </div>
                    {selectedRideType && (
                      <div className='text-left sm:text-right flex-shrink-0'>
                        <p className='text-base sm:text-lg font-bold text-white' style={{ fontFamily: 'Inter, system-ui' }}>
                          {selectedRideType.price}
                        </p>
                        <p className='text-xs sm:text-sm text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>
                          ETA: {selectedRideType.eta}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Validation indicators */}
                  <div className='flex items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm'>
                    <div className={`flex items-center gap-2 ${
                      destination.trim() && !destinationError ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        destination.trim() && !destinationError ? 'bg-green-400' : 'bg-gray-500'
                      }`} />
                      <span style={{ fontFamily: 'Inter, system-ui' }}>Destination</span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      selectedRideType ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedRideType ? 'bg-green-400' : 'bg-gray-500'
                      }`} />
                      <span style={{ fontFamily: 'Inter, system-ui' }}>Ride Type</span>
                    </div>
                  </div>
                </div>
                
                {/* Primary CTA Button */}
                <motion.button
                  onClick={handleConfirmRide}
                  disabled={isCTADisabled || !selectedRideType}
                  whileHover={!isCTADisabled && selectedRideType ? { scale: 1.02 } : {}}
                  whileTap={!isCTADisabled && selectedRideType ? { scale: 0.98 } : {}}
                  className={`w-full inline-flex items-center justify-center rounded-xl px-6 py-4 text-base sm:text-lg font-bold shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-white/10 transition-all duration-200 ${
                    isCTADisabled || !selectedRideType
                      ? 'bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] text-white hover:shadow-[0_12px_40px_rgb(77,166,255,0.3)] hover:brightness-110'
                  }`}
                  style={{ fontFamily: 'Inter, system-ui' }}
                >
                  {isCTADisabled || !selectedRideType ? (
                    <>
                      <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' />
                      </svg>
                      Complete Selection
                    </>
                  ) : (
                    <>
                      <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                      </svg>
                      Confirm Ride
                    </>
                  )}
                </motion.button>
                
                {/* Help text */}
                <p className='text-center text-xs text-gray-400 mt-3' style={{ fontFamily: 'Inter, system-ui' }}>
                  {isCTADisabled 
                    ? 'Enter a destination above to continue'
                    : !selectedRideType 
                    ? 'Select a ride type from the options above'
                    : 'Review your selection and confirm to book'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Tabs */}
      <nav className='fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md border-t border-white/10'>
        <div className='mx-auto max-w-screen-xl px-4 sm:px-6'>
          <div className='flex items-center justify-around py-2 sm:py-3'>
            {bottomNavTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleBottomNavigation(tab)}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 sm:px-2 transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'text-[#4DA6FF]' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                {/* Icon with background for active state */}
                <div className={`relative mb-1 transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'transform scale-110' 
                    : ''
                }`}>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId='activeTabBackground'
                      className='absolute inset-0 -m-2 bg-[#4DA6FF]/20 rounded-full'
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 text-lg sm:text-xl transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'filter drop-shadow-sm' 
                      : ''
                  }`}>
                    {tab.icon}
                  </span>
                </div>
                
                {/* Label */}
                <span className={`text-xs sm:text-sm font-medium truncate max-w-full transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'text-[#4DA6FF] font-semibold' 
                    : 'text-gray-400'
                }`}>
                  {tab.name}
                </span>
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId='activeTabIndicator'
                    className='absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-[#4DA6FF] rounded-full'
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default PassengerHome