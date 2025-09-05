import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import CaptainHeader from '../../components/CaptainHeader'
import GlassCard from '../../components/GlassCard'
import CaptainBottomNav from '../../captain/components/CaptainBottomNav'
import OnlineToggle from '../../captain/components/OnlineToggle'
import IncomingRideModal from '../../captain/components/IncomingRideModal'
import ActiveRidePanel from '../../captain/components/ActiveRidePanel'
import { formatPKRDisplay } from '../../utils/currency'

const CaptainHome = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUser()
  
  // Captain status states
  const [isOnline, setIsOnline] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [showPromoBanner, setShowPromoBanner] = useState(true)
  const [showIncomingRide, setShowIncomingRide] = useState(false)
  const [rideState, setRideState] = useState('waiting') // 'waiting', 'assigned', 'onTrip', 'completed'
  
  // Dummy captain profile data
  const [captainProfile] = useState({
    firstname: 'Ahmed',
    lastname: 'Khan',
    rating: 4.8,
    profilePic: null,
    totalRides: 247,
    yearsActive: 2,
    isAccountVerified: true,
    vehicleType: 'car',
    vehicleMake: 'Toyota Corolla',
    vehicleColor: 'White',
    numberPlate: 'ABC-123'
  })
  
  // Dummy earnings and stats data
  const [todayStats] = useState({
    earnings: 3250,
    rides: 12,
    weeklyProgress: 68, // percentage of weekly target
    weeklyTarget: 15000,
    weeklyEarnings: 10200
  })
  
  // Dummy active ride data
  const [activeRide] = useState(null) // Set to null for "waiting" state
  
  // Mock incoming ride data
  const [mockRideData] = useState({
    passenger: {
      name: 'Sarah Ahmed',
      rating: 4.9,
      totalRides: 156
    },
    pickup: {
      address: 'Gulberg III, Main Boulevard, Lahore',
      eta: '3 min'
    },
    dropoff: {
      address: 'DHA Phase 5, Y Block Commercial, Lahore',
      eta: '15 min'
    },
    fare: 450,
    tripDistance: '8.2 km',
    tripDuration: '15 min'
  })
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/captain/login')
    }
  }, [isAuthenticated, navigate])
  
  // Toggle online status
  const handleToggleOnline = async (newState) => {
    setStatusLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsOnline(newState)
      toast.success(newState ? 'You are now online' : 'You are now offline')
    } catch (error) {
      toast.error('Failed to update status')
      throw error // Re-throw to let OnlineToggle handle the error state
    } finally {
      setStatusLoading(false)
    }
  }
  
  // Quick actions handler
  const handleQuickAction = (action) => {
    switch (action) {
      case 'history':
        navigate('/captain/rides')
        break
      case 'earnings':
        navigate('/captain/wallet')
        break
      case 'support':
        navigate('/captain/help')
        break
      case 'settings':
        navigate('/captain/profile')
        break
      default:
        break
    }
  }
  
  // Incoming ride handlers
  const handleAcceptRide = () => {
    setShowIncomingRide(false)
    setRideState('assigned')
    toast.success('Ride accepted! Navigating to pickup location...')
  }
  
  const handleRejectRide = () => {
    setShowIncomingRide(false)
    toast.info('Ride request declined')
  }
  
  // Ride state change handler
  const handleRideStateChange = (newState) => {
    setRideState(newState)
    
    // Show appropriate toast messages
    switch (newState) {
      case 'onTrip':
        toast.success('Trip started! Drive safely.')
        break
      case 'completed':
        toast.success('Trip completed successfully!')
        break
      case 'waiting':
        toast.info('Ready for next ride request')
        break
      default:
        break
    }
  }
  
  // Handle going online from ActiveRidePanel
  const handleGoOnlineFromPanel = () => {
    handleToggleOnline(true)
  }
  
  // Test function to simulate incoming ride
  const simulateIncomingRide = () => {
    if (isOnline) {
      setShowIncomingRide(true)
    } else {
      toast.warning('You need to be online to receive ride requests')
    }
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className='min-h-screen bg-theme-base relative overflow-hidden'>
      {/* Background Elements */}
      <div className='absolute inset-0 bg-gradient-primary opacity-20' />
      <div className='absolute top-0 left-0 w-full h-full bg-noise opacity-5' />
      
      {/* Main Content */}
      <div className='relative z-10 pb-20'>
        {/* Captain Header */}
        <div className='px-4 sm:px-6 lg:px-8 pt-6'>
          <CaptainHeader
            captain={captainProfile}
            isOnline={isOnline}
            notificationCount={3}
            showNotifications={false}
            notifications={[]}
          />
        </div>
        
        {/* Online Toggle */}
        <div className='px-4 sm:px-6 lg:px-8 mb-6'>
          <OnlineToggle
            isOnline={isOnline}
            onChange={handleToggleOnline}
            disabled={statusLoading}
          />
        </div>
        
        {/* Stats Row */}
        <div className='px-4 sm:px-6 lg:px-8 mb-6'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {/* Today's Earnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <GlassCard className='text-center' padding='lg'>
                <div className='text-2xl sm:text-3xl font-bold text-white mb-1'>
                  {formatPKRDisplay(todayStats.earnings)}
                </div>
                <div className='text-sm text-white/70'>Today's Earnings</div>
              </GlassCard>
            </motion.div>
            
            {/* Today's Rides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassCard className='text-center' padding='lg'>
                <div className='text-2xl sm:text-3xl font-bold text-white mb-1'>
                  {todayStats.rides}
                </div>
                <div className='text-sm text-white/70'>Today's Rides</div>
              </GlassCard>
            </motion.div>
            
            {/* Weekly Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='sm:col-span-1'
            >
              <GlassCard padding='lg'>
                <div className='text-center mb-3'>
                  <div className='text-lg font-bold text-white'>
                    {todayStats.weeklyProgress}%
                  </div>
                  <div className='text-xs text-white/70'>Weekly Progress</div>
                </div>
                <div className='w-full bg-white/20 rounded-full h-2'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayStats.weeklyProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className='bg-gradient-to-r from-brand-blue to-brand-pink h-2 rounded-full'
                  />
                </div>
                <div className='text-xs text-white/60 mt-2 text-center'>
                  {formatPKRDisplay(todayStats.weeklyEarnings)} / {formatPKRDisplay(todayStats.weeklyTarget)}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
        
        {/* Promotional Banner */}
        <AnimatePresence>
          {showPromoBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className='px-4 sm:px-6 lg:px-8 mb-6'
            >
              <GlassCard className='relative overflow-hidden' padding='lg'>
                <button
                  onClick={() => setShowPromoBanner(false)}
                  className='absolute top-3 right-3 text-white/60 hover:text-white transition-colors'
                  aria-label='Close banner'
                >
                  ✕
                </button>
                <div className='flex items-center gap-4'>
                  <div className='text-3xl'>🎉</div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-bold text-white mb-1'>
                      Weekend Bonus Active!
                    </h3>
                    <p className='text-sm text-white/80'>
                      Earn 20% extra on all rides this weekend. Complete 5 more rides to unlock bonus.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active Ride Panel */}
        <div className='px-4 sm:px-6 lg:px-8 mb-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ActiveRidePanel
              isOnline={isOnline}
              onGoOnline={handleGoOnlineFromPanel}
              rideState={rideState}
              onStateChange={handleRideStateChange}
              rideData={mockRideData}
            />
          </motion.div>
        </div>
        
        {/* Test Controls - Only show when online and in waiting state */}
        {isOnline && rideState === 'waiting' && (
          <div className='px-4 sm:px-6 lg:px-8 mb-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <GlassCard padding='lg'>
                <h4 className='text-lg font-bold text-white mb-3'>Test Controls</h4>
                <div className='flex flex-wrap gap-3'>
                  <button
                    onClick={simulateIncomingRide}
                    className='bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm'
                  >
                    🔔 Simulate Incoming Ride
                  </button>
                  <button
                    onClick={() => setRideState('assigned')}
                    className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm'
                  >
                    📍 Test Assigned State
                  </button>
                  <button
                    onClick={() => setRideState('onTrip')}
                    className='bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm'
                  >
                    🚗 Test On Trip State
                  </button>
                  <button
                    onClick={() => setRideState('completed')}
                    className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm'
                  >
                    🎉 Test Completed State
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
        
       
       
      </div>
      
      {/* Captain Bottom Navigation */}
      <CaptainBottomNav />
      
      {/* Incoming Ride Modal */}
      <IncomingRideModal
        isOpen={showIncomingRide}
        onAccept={handleAcceptRide}
        onReject={handleRejectRide}
        rideData={mockRideData}
        countdownDuration={15}
      />
    </div>
  )
}

export default CaptainHome