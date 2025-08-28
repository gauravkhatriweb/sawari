import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import CaptainNavbar from '../../components/CaptainNavbar'
import axios from 'axios'

const CaptainHome = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUser()
  
  // States for captain status and features
  const [isOnline, setIsOnline] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasActiveRide, setHasActiveRide] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [notificationCount, setNotificationCount] = useState(2)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPromoDetails, setShowPromoDetails] = useState(false)
  const [promoBannerDismissed, setPromoBannerDismissed] = useState(false)
  const [profileError, setProfileError] = useState(null)

  // Real captain profile data
  const [captainProfile, setCaptainProfile] = useState({
    firstname: '',
    lastname: '',
    rating: 5.0,
    profilePic: null,
    totalRides: 0,
    yearsActive: 0,
    vehicleType: 'car',
    vehicleMake: '',
    vehicleColor: '',
    numberPlate: ''
  })

  // Mock earnings data
  const [earnings, setEarnings] = useState({
    today: 2850,
    thisWeek: [1200, 1850, 2100, 1950, 2300, 2850, 2200],
    weeklyTarget: 15000,
    totalRidesThisWeek: 23,
    todayRides: 8
  })

  // Mock active ride data
  const [activeRide, setActiveRide] = useState(null)

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'New ride request nearby',
      message: 'Passenger waiting 0.5 km away',
      time: '2 min ago',
      type: 'ride',
      icon: '🚗'
    },
    {
      id: 2,
      title: 'Bonus opportunity',
      message: 'Complete 2 more rides for PKR 500 bonus',
      time: '1 hour ago',
      type: 'bonus',
      icon: '💰'
    }
  ]

  // Fetch real captain profile data
  const fetchCaptainProfile = async () => {
    try {
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          token = parsed?.token || null
        } catch (_) {}
      }

      if (!token) {
        setProfileError('Authentication required')
        navigate('/captain/login')
        return
      }

      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const { data } = await axios.get(`${apiBase}/api/captain/profile`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      if (data.success && data.captain) {
        const captain = data.captain
        setCaptainProfile({
          firstname: captain.firstname || '',
          lastname: captain.lastname || '',
          rating: captain.rating || 5.0,
          profilePic: captain.profilePic || null,
          totalRides: captain.totalRides || 0,
          yearsActive: captain.yearsActive || 0,
          vehicleType: captain.vehicle?.type || 'car',
          vehicleMake: `${captain.vehicle?.make || ''} ${captain.vehicle?.model || ''}`.trim(),
          vehicleColor: captain.vehicle?.color || '',
          numberPlate: captain.vehicle?.numberPlate || ''
        })
        
        // Set online status based on captain's status from database
        setIsOnline(captain.status === 'active')
      } else {
        setProfileError('Failed to load profile data')
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
      const message = err?.response?.data?.message || 'Failed to load profile'
      setProfileError(message)
      
      if (err?.response?.status === 401) {
        navigate('/captain/login')
      }
    }
  }

  // Redirect if not authenticated captain
  useEffect(() => {
    if (!isAuthenticated || !user || user.type !== 'captain') {
      navigate('/captain/login')
      return
    }
    
    // Set basic captain profile from user context
    if (user) {
      setCaptainProfile(prev => ({
        ...prev,
        firstname: user.firstname || user.firstName || 'Captain',
        lastname: user.lastname || user.lastName || '',
        profilePic: user.profilePic || null
      }))
    }

    // Fetch complete profile data
    fetchCaptainProfile()

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, navigate])

  // Mock active ride data when online
  useEffect(() => {
    if (isOnline && !hasActiveRide) {
      // Simulate getting a ride after being online for a while
      const rideTimer = setTimeout(() => {
        const shouldGetRide = Math.random() > 0.6 // 40% chance of getting a ride
        if (shouldGetRide) {
          setActiveRide({
            id: 'ride_001',
            passenger: {
              name: 'Sara Ali',
              phone: '+92 300 1234567',
              rating: 4.9,
              profilePic: null
            },
            pickup: {
              address: 'DHA Phase 5, Block L',
              coordinates: { lat: 31.4697, lng: 74.4142 }
            },
            dropoff: {
              address: 'Emporium Mall, Johar Town',
              coordinates: { lat: 31.4721, lng: 74.3807 }
            },
            estimatedFare: 450,
            distance: '8.2 km',
            duration: '15 min',
            rideType: 'standard',
            status: 'assigned' // assigned, started, completed
          })
          setHasActiveRide(true)
          toast.success('New ride assigned!')
        }
      }, 3000)

      return () => clearTimeout(rideTimer)
    }
  }, [isOnline, hasActiveRide])

  // Handle online/offline toggle with visual feedback and API call
  const handleToggleOnline = async () => {
    if (statusLoading) return // Prevent multiple clicks during loading
    
    const newOnlineStatus = !isOnline
    const newStatus = newOnlineStatus ? 'active' : 'inactive'
    
    setStatusLoading(true)
    
    try {
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          token = parsed?.token || null
        } catch (_) {}
      }

      if (!token) {
        toast.error('Authentication required')
        navigate('/captain/login')
        return
      }

      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const { data } = await axios.put(`${apiBase}/api/captain/update-status`, 
        { status: newStatus },
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      )

      if (data.success) {
        setIsOnline(newOnlineStatus)
        
        if (newOnlineStatus) {
          toast.success('You are now online and ready to receive ride requests!', {
            icon: '🟢'
          })
        } else {
          toast.info('You are now offline. No new rides will be assigned.', {
            icon: '🔴'
          })
          setActiveRide(null)
          setHasActiveRide(false)
        }
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Status update error:', err)
      const message = err?.response?.data?.message || 'Failed to update status'
      toast.error(message)
      
      if (err?.response?.status === 401) {
        navigate('/captain/login')
      }
    } finally {
      setStatusLoading(false)
    }
  }

  // Handle ride actions with proper validation
  const handleStartRide = () => {
    if (!activeRide) {
      toast.error('No ride assigned yet')
      return
    }
    
    if (activeRide.status !== 'assigned') {
      toast.error('Ride has already been started')
      return
    }

    setActiveRide(prev => ({ ...prev, status: 'started' }))
    toast.success('Ride started! Drive safely.', {
      icon: '🚗'
    })
  }

  const handleEndRide = () => {
    if (!activeRide) {
      toast.error('No active ride to end')
      return
    }
    
    if (activeRide.status !== 'started') {
      toast.error('Ride must be started before it can be ended')
      return
    }

    // Add earnings
    setEarnings(prev => ({
      ...prev,
      today: prev.today + activeRide.estimatedFare,
      todayRides: prev.todayRides + 1
    }))
    
    setActiveRide(null)
    setHasActiveRide(false)
    toast.success(`Ride completed! You earned PKR ${activeRide.estimatedFare}`, {
      icon: '💰'
    })
  }

  // Handle navigation
  const handleNavigation = (path) => {
    switch (path) {
      case 'history':
        toast.info('Ride history page coming soon')
        break
      case 'earnings':
        navigate('/captain/earnings')
        break
      case 'profile':
        navigate('/captain/profile')
        break
      default:
        break
    }
  }

  // Handle notification actions
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
  }

  const clearNotifications = () => {
    setNotificationCount(0)
    setShowNotifications(false)
    toast.success('All notifications cleared')
  }

  // Calculate weekly progress
  const weeklyProgress = (earnings.thisWeek.reduce((a, b) => a + b, 0) / earnings.weeklyTarget) * 100

  // Bottom navigation tabs
  const bottomNavTabs = [
    { id: 'home', name: 'Home', icon: '🏠', path: '/captain/home' },
    { id: 'rides', name: 'Rides', icon: '📜', path: '/captain/rides' },
    { id: 'wallet', name: 'Wallet', icon: '💰', path: '/captain/wallet' },
    { id: 'profile', name: 'Profile', icon: '👤', path: '/captain/profile' }
  ]

  if (loading) {
    return (
      <div className='min-h-screen bg-[#1A1A1A] text-white'>
        <CaptainNavbar />
        <div className='flex items-center justify-center min-h-[calc(100vh-56px)]'>
          <div className='flex items-center gap-3'>
            <svg className='w-6 h-6 animate-spin text-[#4DA6FF]' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
            <span className='text-lg font-medium' style={{ fontFamily: 'Inter, system-ui' }}>
              Loading dashboard...
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#1A1A1A] text-white relative overflow-hidden'>
      <CaptainNavbar />
      
      {/* Background gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-20' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-15' />

      <main className='relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-24'>
        {/* Header Section - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6'
        >
          <div className='flex items-center gap-3 sm:gap-4'>
            {/* Captain Profile */}
            <div className='relative'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center border-2 border-white/20 shadow-lg'>
                {captainProfile.profilePic ? (
                  <img 
                    src={`http://localhost:3000${captainProfile.profilePic}`}
                    alt='Captain Profile'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-lg sm:text-2xl font-bold text-white'>
                    {captainProfile.firstname.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Online indicator with animation */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center transition-all duration-300 ${
                isOnline ? 'bg-green-500 shadow-green-400/50 shadow-lg' : 'bg-gray-500'
              }`}>
                <span className='text-xs'>
                  {isOnline ? '✓' : '○'}
                </span>
              </div>
            </div>

            <div className='flex-1'>
              <h1 className='text-lg sm:text-xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Welcome, {captainProfile.firstname}!
              </h1>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-yellow-400'>⭐</span>
                <span className='text-xs sm:text-sm text-gray-300'>
                  {captainProfile.rating.toFixed(1)} • {captainProfile.totalRides} rides • {captainProfile.yearsActive} years
                </span>
              </div>
            </div>
          </div>

          {/* Notifications & Online Toggle - Responsive */}
          <div className='flex items-center gap-3 justify-between sm:justify-end'>
            {/* Notifications */}
            <div className='relative'>
              <button
                onClick={handleNotificationClick}
                className='relative w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg'
              >
                <span className='text-lg'>🔔</span>
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg'
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </button>
              
              {/* Notifications Dropdown - Responsive */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className='absolute right-0 top-12 w-72 sm:w-80 rounded-xl bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 shadow-xl z-50'
                  >
                    <div className='p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-lg font-semibold'>Notifications</h3>
                        {notificationCount > 0 && (
                          <button
                            onClick={clearNotifications}
                            className='text-xs text-[#4DA6FF] hover:text-[#4DA6FF]/80 transition-colors'
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      {notifications.map(notification => (
                        <div key={notification.id} className='flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors'>
                          <span className='text-2xl'>{notification.icon}</span>
                          <div className='flex-1'>
                            <p className='font-medium text-sm'>{notification.title}</p>
                            <p className='text-gray-300 text-xs mt-1'>{notification.message}</p>
                            <p className='text-gray-500 text-xs mt-1'>{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Online/Offline Toggle with enhanced visual feedback */}
            <button
              onClick={handleToggleOnline}
              disabled={statusLoading}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                isOnline 
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-400/30' 
                  : 'bg-gray-600 text-white hover:bg-gray-700 shadow-gray-500/30'
              }`}
            >
              {statusLoading ? (
                <svg className='w-4 h-4 animate-spin' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
              ) : (
                <span className='text-sm sm:text-base'>{isOnline ? '✅' : '❌'}</span>
              )}
              <span className='text-sm sm:text-base'>
                {statusLoading ? 'Updating...' : (isOnline ? 'Online' : 'Offline')}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Stats Section - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6'
        >
          {/* Today's Earnings */}
          <div className='rounded-xl bg-gradient-to-br from-[#4DA6FF]/20 to-[#EFBFFF]/20 backdrop-blur-md border border-white/10 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base sm:text-lg font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Today's Earnings</h3>
              <span className='text-xl sm:text-2xl'>💰</span>
            </div>
            <p className='text-2xl sm:text-3xl font-bold text-[#4DA6FF]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>PKR {earnings.today.toLocaleString()}</p>
            <p className='text-xs sm:text-sm text-gray-300 mt-1' style={{ fontFamily: 'Inter, system-ui' }}>{earnings.todayRides} rides completed</p>
          </div>

          {/* Total Rides Today */}
          <div className='rounded-xl bg-gradient-to-br from-[#7CE7E1]/20 to-[#FFD65C]/20 backdrop-blur-md border border-white/10 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base sm:text-lg font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Total Rides</h3>
              <span className='text-xl sm:text-2xl'>🚗</span>
            </div>
            <p className='text-2xl sm:text-3xl font-bold text-[#7CE7E1]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{earnings.todayRides}</p>
            <p className='text-xs sm:text-sm text-gray-300 mt-1' style={{ fontFamily: 'Inter, system-ui' }}>rides today</p>
          </div>

          {/* Weekly Progress */}
          <div className='rounded-xl bg-gradient-to-br from-[#EFBFFF]/20 to-[#FFD65C]/20 backdrop-blur-md border border-white/10 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base sm:text-lg font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Weekly Target</h3>
              <span className='text-xl sm:text-2xl'>📊</span>
            </div>
            <div className='flex items-end gap-1 mb-2 h-10'>
              {earnings.thisWeek.map((day, index) => (
                <div
                  key={index}
                  className='flex-1 bg-gradient-to-t from-[#FFD65C] to-[#EFBFFF] rounded-t transition-all duration-300 hover:opacity-80'
                  style={{ height: `${(day / Math.max(...earnings.thisWeek)) * 40}px` }}
                ></div>
              ))}
            </div>
            <p className='text-xs sm:text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
              {weeklyProgress.toFixed(0)}% of PKR {earnings.weeklyTarget.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Promo Banner - Responsive and Dismissible */}
        {!promoBannerDismissed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className='mb-6'
          >
            <div className='rounded-xl bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] p-[1px] shadow-lg'>
              <div className='rounded-xl bg-[#1A1A1A] p-4 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <div className='flex items-start sm:items-center gap-3 sm:gap-4 flex-1'>
                    <span className='text-2xl sm:text-3xl'>🏆</span>
                    <div className='flex-1'>
                      <h3 className='text-base sm:text-lg font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Complete 10 rides today, earn PKR 1000 bonus!</h3>
                      <p className='text-gray-300 text-sm' style={{ fontFamily: 'Inter, system-ui' }}>{Math.max(0, 10 - earnings.todayRides)} rides remaining</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setShowPromoDetails(!showPromoDetails)}
                      className='px-3 sm:px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setPromoBannerDismissed(true)}
                      className='p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white'
                      title='Dismiss'
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Ride Section - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className='mb-6'
        >
          <h2 className='text-lg sm:text-xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Current Ride</h2>
          
          {!hasActiveRide || !activeRide ? (
            <div className='rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 text-center shadow-lg'>
              <div className='text-4xl sm:text-6xl mb-4'>🔍</div>
              <h3 className='text-lg sm:text-xl font-semibold mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Waiting for ride requests...</h3>
              <p className='text-gray-300 text-sm sm:text-base mb-4' style={{ fontFamily: 'Inter, system-ui' }}>
                {isOnline ? 'You are online and ready to receive rides' : 'Go online to start receiving ride requests'}
              </p>
              {!isOnline && (
                <button
                  onClick={handleToggleOnline}
                  disabled={statusLoading}
                  className='mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2'
                  style={{ fontFamily: 'Poppins, Inter, system-ui' }}
                >
                  {statusLoading ? (
                    <>
                      <svg className='w-4 h-4 animate-spin' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      Going Online...
                    </>
                  ) : (
                    'Go Online'
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className='rounded-xl bg-gradient-to-br from-[#4DA6FF]/10 to-[#EFBFFF]/10 backdrop-blur-md border border-white/10 p-4 sm:p-6 shadow-lg'>
              {/* Passenger Info - Responsive */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6'>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg'>
                    {activeRide.passenger.name.charAt(0)}
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-base sm:text-lg font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{activeRide.passenger.name}</h3>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-yellow-400'>⭐</span>
                      <span className='text-xs sm:text-sm text-gray-300'>{activeRide.passenger.rating}</span>
                      <span className='text-gray-500 hidden sm:inline'>•</span>
                      <span className='text-xs sm:text-sm text-gray-300 break-all sm:break-normal'>{activeRide.passenger.phone}</span>
                    </div>
                  </div>
                </div>
                <div className='text-left sm:text-right'>
                  <p className='text-xl sm:text-2xl font-bold text-[#4DA6FF]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>PKR {activeRide.estimatedFare}</p>
                  <p className='text-xs sm:text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>{activeRide.distance} • {activeRide.duration}</p>
                </div>
              </div>

              {/* Route Info - Responsive */}
              <div className='space-y-3 sm:space-y-4 mb-6'>
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold'>P</div>
                  <div className='flex-1'>
                    <p className='font-medium text-sm sm:text-base' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Pickup Location</p>
                    <p className='text-gray-300 text-xs sm:text-sm' style={{ fontFamily: 'Inter, system-ui' }}>{activeRide.pickup.address}</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold'>D</div>
                  <div className='flex-1'>
                    <p className='font-medium text-sm sm:text-base' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Drop-off Location</p>
                    <p className='text-gray-300 text-xs sm:text-sm' style={{ fontFamily: 'Inter, system-ui' }}>{activeRide.dropoff.address}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Responsive with Validation */}
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                {activeRide.status === 'assigned' && (
                  <button
                    onClick={handleStartRide}
                    className='flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:scale-105 active:scale-95'
                    style={{ fontFamily: 'Poppins, Inter, system-ui' }}
                  >
                    Start Ride
                  </button>
                )}
                
                {activeRide.status === 'started' && (
                  <button
                    onClick={handleEndRide}
                    className='flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:scale-105 active:scale-95'
                    style={{ fontFamily: 'Poppins, Inter, system-ui' }}
                  >
                    End Ride
                  </button>
                )}

                <button className='px-4 sm:px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg'
                  style={{ fontFamily: 'Inter, system-ui' }}
                >
                  Call Passenger
                </button>
                <button className='px-4 sm:px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg'
                  style={{ fontFamily: 'Inter, system-ui' }}
                >
                  Navigate
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className='mb-6'
        >
          <h2 className='text-lg sm:text-xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Quick Actions</h2>
          <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
            <button
              onClick={() => handleNavigation('history')}
              className='p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 text-center shadow-lg hover:scale-105 active:scale-95'
            >
              <div className='text-xl sm:text-2xl mb-2'>📜</div>
              <p className='font-medium text-xs sm:text-sm' style={{ fontFamily: 'Inter, system-ui' }}>Ride History</p>
            </button>
            
            <button
              onClick={() => handleNavigation('earnings')}
              className='p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 text-center shadow-lg hover:scale-105 active:scale-95'
            >
              <div className='text-xl sm:text-2xl mb-2'>📊</div>
              <p className='font-medium text-xs sm:text-sm' style={{ fontFamily: 'Inter, system-ui' }}>Earnings Report</p>
            </button>
            
            <button
              onClick={() => toast.info('Help & Support coming soon')}
              className='p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 text-center shadow-lg hover:scale-105 active:scale-95'
            >
              <div className='text-xl sm:text-2xl mb-2'>🆘</div>
              <p className='font-medium text-xs sm:text-sm' style={{ fontFamily: 'Inter, system-ui' }}>Help & Support</p>
            </button>
            
            <button
              onClick={() => handleNavigation('/captain/profile')}
              className='p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 text-center shadow-lg hover:scale-105 active:scale-95'
            >
              <div className='text-xl sm:text-2xl mb-2'>⚙️</div>
              <p className='font-medium text-xs sm:text-sm' style={{ fontFamily: 'Inter, system-ui' }}>Settings</p>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Bottom Navigation - Enhanced Responsive */}
      <div className='fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/95 backdrop-blur-md border-t border-white/10 z-50 shadow-lg'>
        <div className='max-w-screen-xl mx-auto px-4 sm:px-6 py-2 sm:py-3'>
          <div className='flex justify-around'>
            {bottomNavTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.path !== '/captain/home') {
                    toast.info(`${tab.name} page coming soon`)
                  }
                }}
                className={`flex flex-col items-center py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-t from-[#4DA6FF]/20 to-[#EFBFFF]/20 text-[#4DA6FF] shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className='text-lg sm:text-xl mb-1'>{tab.icon}</span>
                <span className='text-xs font-medium' style={{ fontFamily: 'Inter, system-ui' }}>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaptainHome