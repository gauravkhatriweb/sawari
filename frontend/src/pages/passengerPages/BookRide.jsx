import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import LiveMap from '../../components/LiveMap'
import EnhancedSearchBar from '../../components/EnhancedSearchBar'
import useCurrentLocation from '../../customHooks/useCurrentLocation'
import RideOptionsCarousel from '../../components/RideOptionsCarousel'
import FareBreakdownCard from '../../components/FareBreakdownCard'
import FareCalculator from '../../components/FareCalculator'
import PaymentSelector from '../../components/PaymentSelector'
import ConfirmRideModal from '../../components/ConfirmRideModal'
import RideSuccessModal from '../../components/RideSuccessModal'
import NetworkStatus, { useNetworkStatus } from '../../components/NetworkStatus'
import LocationErrorHandler from '../../components/LocationErrorHandler'
import BookFlowLoadingState from '../../components/book-flow/ui/BookFlowLoadingState'
import BookFlowErrorBoundary from '../../components/book-flow/ui/BookFlowErrorBoundary'
import DirectionsErrorFallback from '../../components/DirectionsErrorFallback'
import DirectionsLoadingFallback from '../../components/DirectionsLoadingFallback'
import { getRouteDistance, isLocationInPakistan } from '../../services/locationiq'
import { getDirections, formatRouteDuration, formatRouteDistance } from '../../services/directions'
import { calculateAllFares, getAllVehicleConfigs } from '../../utils/fareCalculator'

const STEPS = {
  PICKUP: 'pickup',
  DROP: 'drop', 
  VEHICLE: 'vehicle',
  FARE: 'fare',
  PAYMENT: 'payment'
}

const BookRide = () => {
  const navigate = useNavigate()
  
  // Authentication check
  const { user, isAuthenticated, isInitialized } = useUser()
  
  // Network status monitoring
  const networkStatus = useNetworkStatus()
  
  const {
    coords,
    loading: locationLoading,
    error: locationError,
    address: reverseAddress,
    userCity: detectedUserCity,
    retry: retryLocation,
    getCurrentPosition
  } = useCurrentLocation()

  // Stepper state
  const [currentStep, setCurrentStep] = useState(STEPS.PICKUP)
  
  // Location state
  const [pickup, setPickup] = useState(null)
  const [pickupLabel, setPickupLabel] = useState('')
  const [drop, setDrop] = useState(null)
  const [dropLabel, setDropLabel] = useState('')
  const [pickupValidationError, setPickupValidationError] = useState(null)
  const [userCity, setUserCity] = useState(null)
  
  // Booking state
  const [selectedRide, setSelectedRide] = useState('bike')
  const [pinkOnly, setPinkOnly] = useState(false)
  const [payment, setPayment] = useState('cash')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPaymentValid, setIsPaymentValid] = useState(true)
  
  // UI state
  const [errors, setErrors] = useState({})
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [calculatedFare, setCalculatedFare] = useState(null)
  
  // Fare calculation state
  const [distanceKm, setDistanceKm] = useState(0)
  const [durationMin, setDurationMin] = useState(0)
  
  // Route state for multi-route display
  const [routes, setRoutes] = useState([])
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false)
  const [routeError, setRouteError] = useState(null)
  
  // Get vehicle configurations
  const vehicleConfigs = useMemo(() => getAllVehicleConfigs(), [])
  
  // Define vehicle options
  const vehicleOptions = useMemo(() => {
    return Object.entries(vehicleConfigs).map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
      eta: `${Math.round(distanceKm / config.avgSpeed * 60) || 3}-${Math.round(distanceKm / config.avgSpeed * 60) + 2 || 5} min`,
      capacity: `${config.capacity} passenger${config.capacity > 1 ? 's' : ''}`,
      note: config.description,
      suitability: config.description,
      color: config.color,
      femaleAllowed: config.femaleAllowed,
      avgSpeed: config.avgSpeed
    }))
  }, [vehicleConfigs, distanceKm])
  
  // Get current selected ride object
  const currentRide = useMemo(() => {
    return vehicleOptions.find(vehicle => vehicle.id === selectedRide) || vehicleOptions[0]
  }, [vehicleOptions, selectedRide])
  
  const [routePolyline, setRoutePolyline] = useState(null)
  const [isCalculatingFare, setIsCalculatingFare] = useState(false)
  const [fareError, setFareError] = useState(null)
  const [allVehicleFares, setAllVehicleFares] = useState({})

  // Handle network status changes
  const handleNetworkChange = useCallback(({ isOnline, quality }) => {
    setIsOfflineMode(!isOnline)
    
    if (!isOnline) {
      toast.warning('You\'re offline. Some features may be limited.', {
        position: 'top-center',
        autoClose: 4000,
        toastId: 'offline-mode'
      })
    } else if (quality === 'poor') {
      toast.info('Slow connection detected. Location search may be slower.', {
        position: 'top-center',
        autoClose: 3000,
        toastId: 'slow-connection'
      })
    }
  }, [])

  // Handle location permission errors
  useEffect(() => {
    if (locationError) {
      console.error('Location detection failed:', locationError)
      if (locationError.includes('denied') || locationError.includes('permission')) {
        setLocationPermissionDenied(true)
      }
    } else {
      setLocationPermissionDenied(false)
    }
  }, [locationError])

  // Authentication check - redirect if not logged in
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || !user || user.type !== 'passenger')) {
      toast.error('Please log in to book a ride')
      navigate('/passenger/login')
    }
  }, [isAuthenticated, user, navigate, isInitialized])

  // Handle offline mode restrictions
  const isFeatureDisabled = useCallback((feature) => {
    if (!networkStatus.isOnline) {
      switch (feature) {
        case 'search':
        case 'fare_calculation':
        case 'booking':
          return true
        default:
          return false
      }
    }
    return false
  }, [networkStatus.isOnline])



  // Auto-start location fetching on component mount
  useEffect(() => {
    if (networkStatus.isOnline && !coords.lat && !locationLoading && !locationError) {
      getCurrentPosition().catch(error => {
        console.warn('Auto location fetch failed:', error)
      })
    }
  }, [getCurrentPosition, coords.lat, locationLoading, locationError, networkStatus.isOnline])

  // Auto-set pickup location when GPS coordinates are available
  useEffect(() => {
    if (coords.lat && coords.lon && reverseAddress && !pickup) {
      setPickup({ lat: coords.lat, lon: coords.lon })
      setPickupLabel(reverseAddress.label || `GPS Location (${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)})`)
      setErrors(prev => ({ ...prev, pickup: '' }))
      setPickupValidationError(null)
    }
  }, [coords, reverseAddress, pickup])

  // Extract user's current city for validation
  useEffect(() => {
    if (detectedUserCity) {
      setUserCity(detectedUserCity)
    } else if (reverseAddress && reverseAddress.city) {
      setUserCity(reverseAddress.city)
    }
  }, [detectedUserCity, reverseAddress])

  // Debounced directions fetching
  const fetchDirections = useCallback(async (pickupCoords, dropCoords, signal) => {
    if (!pickupCoords || !dropCoords) {
      setRoutes([])
      setSelectedRouteId(null)
      setDistanceKm(0)
      setDurationMin(0)
      setRoutePolyline(null)
      setAllVehicleFares({})
      return
    }

    // Validate locations are in Pakistan
    const isPickupInPakistan = await isLocationInPakistan(pickupCoords.lat, pickupCoords.lon)
    const isDropInPakistan = await isLocationInPakistan(dropCoords.lat, dropCoords.lon)
    
    if (!isPickupInPakistan || !isDropInPakistan) {
      toast.error('Service is only available within Pakistan', {
        position: 'top-center',
        autoClose: 4000
      })
      setRouteError('Service area restricted')
      return
    }

    setIsLoadingRoutes(true)
    setRouteError(null)
    setIsCalculatingFare(true)
    setFareError(null)

    try {
      // Convert coordinates to the format expected by directions service
      const pickup = { lat: pickupCoords.lat, lon: pickupCoords.lng || pickupCoords.lon }
      const drop = { lat: dropCoords.lat, lon: dropCoords.lng || dropCoords.lon }
      
      // Fetch multiple routes from directions API
      const fetchedRoutes = await getDirections(pickup, drop, { signal, alternatives: true })
      
      if (signal?.aborted) return
      
      setRoutes(fetchedRoutes)
      
      // Select the first route by default
      const defaultRoute = fetchedRoutes[0]
      if (defaultRoute) {
        setSelectedRouteId(defaultRoute.id)
        
        // Update distance and duration from selected route
        const distanceKm = defaultRoute.distance / 1000 // Convert meters to km
        const durationMin = defaultRoute.duration / 60 // Convert seconds to minutes
        
        setDistanceKm(distanceKm)
        setDurationMin(durationMin)
        setRoutePolyline(defaultRoute.geometry)
        
        // Calculate fares for all vehicles using route distance
        const fares = calculateAllFares({
          distanceKm,
          durationMin,
          includeSurge: false
        })
        
        setAllVehicleFares(fares)
        setCalculatedFare(fares[selectedRide]?.breakdown?.total || null)
        
        // Show user feedback for fallback routes
        if (defaultRoute.isFallback) {
          toast.info('Using estimated route due to limited data', {
            position: 'top-center',
            autoClose: 4000,
            toastId: 'fallback-route'
          })
          setRouteError('Estimated route')
        }
      }
      
    } catch (error) {
      if (signal?.aborted) return
      
      console.error('Directions fetch failed:', error)
      
      // Enhanced error handling with user-friendly messages
      let userMessage = 'Unable to fetch routes. Please try again.'
      
      if (error.message?.includes('cancelled')) {
        userMessage = 'Request was cancelled. Please try again.'
      } else if (error.message?.includes('Network')) {
        userMessage = 'Network issue. Please check your connection and try again.'
      } else if (error.message?.includes('rate limit')) {
        userMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.message?.includes('No route found')) {
        userMessage = 'No route found between these locations. Please try different addresses.'
      }
      
      toast.error(userMessage, {
        position: 'top-center',
        autoClose: 5000
      })
      
      setRouteError(userMessage)
      setRoutes([])
      setSelectedRouteId(null)
      setDistanceKm(0)
      setDurationMin(0)
      setRoutePolyline(null)
      setAllVehicleFares({})
      setCalculatedFare(null)
      
    } finally {
      setIsLoadingRoutes(false)
      setIsCalculatingFare(false)
    }
  }, [selectedRide])

  // Debounced directions fetching with AbortController
  useEffect(() => {
    if (!pickup || !drop) return
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      fetchDirections(pickup, drop, controller.signal)
    }, 300) // 300ms debounce
    
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [pickup, drop, fetchDirections])
  // Handle route selection
  const handleRouteSelect = useCallback((routeId) => {
    const selectedRoute = routes.find(route => route.id === routeId)
    if (!selectedRoute) return
    
    setSelectedRouteId(routeId)
    
    // Update distance and duration from selected route
    const distanceKm = selectedRoute.distance / 1000 // Convert meters to km
    const durationMin = selectedRoute.duration / 60 // Convert seconds to minutes
    
    setDistanceKm(distanceKm)
    setDurationMin(durationMin)
    setRoutePolyline(selectedRoute.geometry)
    
    // Recalculate fares for all vehicles using new route distance
    const fares = calculateAllFares({
      distanceKm,
      durationMin,
      includeSurge: false
    })
    
    setAllVehicleFares(fares)
    setCalculatedFare(fares[selectedRide]?.breakdown?.total || null)
  }, [routes, selectedRide])

  // Get current ride fare from calculated fares
  const currentRideFare = useMemo(() => {
    if (allVehicleFares[selectedRide]) {
      return allVehicleFares[selectedRide].breakdown?.total || 0
    }
    return 0
  }, [allVehicleFares, selectedRide])

  const handleLocationSelect = (location, type) => {
    // Defensive guards
    if (!location || typeof location !== 'object') {
      console.error('Invalid location data:', location)
      return
    }
    
    if (typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      console.error('Invalid coordinates:', location)
      return
    }
    
    const pos = { lat: location.lat, lon: location.lon }
    if (type === 'pickup') {
      setPickup(pos)
      setPickupLabel(location.label || location.display_name || '')
      setErrors(prev => ({ ...prev, pickup: '' }))
    } else {
      setDrop(pos)
      setDropLabel(location.label || location.display_name || '')
      setErrors(prev => ({ ...prev, drop: '' }))
      // Auto-advance to vehicle selection
      setCurrentStep(STEPS.VEHICLE)
    }
  }

  // Handle pickup location selection from AddressSearchInput
  const handlePickupLocationSelect = (locationData) => {
    // Defensive guards
    if (!locationData || typeof locationData !== 'object') {
      console.error('Invalid pickup location data:', locationData)
      return
    }
    
    if (typeof locationData.lat !== 'number' || typeof locationData.lon !== 'number') {
      console.error('Invalid pickup coordinates:', locationData)
      return
    }
    
    setPickup({ lat: locationData.lat, lon: locationData.lon })
    setPickupLabel(locationData.address || locationData.displayName || '')
    setErrors(prev => ({ ...prev, pickup: '' }))
    setPickupValidationError(null)
    
    // Auto-advance to drop step
    setCurrentStep(STEPS.DROP)
  }

  // Handle drop location selection from AddressSearchInput
  const handleDropLocationSelect = (locationData) => {
    // Defensive guards
    if (!locationData || typeof locationData !== 'object') {
      console.error('Invalid drop location data:', locationData)
      return
    }
    
    if (typeof locationData.lat !== 'number' || typeof locationData.lon !== 'number') {
      console.error('Invalid drop coordinates:', locationData)
      return
    }
    
    setDrop({ lat: locationData.lat, lon: locationData.lon })
    setDropLabel(locationData.address || locationData.displayName || '')
    setErrors(prev => ({ ...prev, drop: '' }))
    
    // Auto-advance to vehicle selection
    setCurrentStep(STEPS.VEHICLE)
  }

  // Handle fare updates from FareCalculator
  const handleFareUpdate = (fareData) => {
    setCalculatedFare(fareData)
  }

  const handleStepAdvance = () => {
    switch (currentStep) {
      case STEPS.PICKUP:
        if (!pickup) {
          setErrors({ pickup: 'Please set a pickup location' })
          return
        }
        setCurrentStep(STEPS.DROP)
        break
      case STEPS.DROP:
        if (!drop) {
          setErrors({ drop: 'Please select a drop location' })
          return
        }
        setCurrentStep(STEPS.VEHICLE)
        break
      case STEPS.VEHICLE:
        setCurrentStep(STEPS.FARE)
        break
      case STEPS.FARE:
        setCurrentStep(STEPS.PAYMENT)
        break
      case STEPS.PAYMENT:
        handleConfirm()
        break
    }
    setErrors({})
  }

  const handleConfirm = () => {
    if (!pickup || !drop) {
      setErrors({
        pickup: !pickup ? 'Please set a pickup location' : '',
        drop: !drop ? 'Please select a drop location' : ''
      })
      return
    }
    setShowConfirm(true)
  }

  const recenterMap = () => {
    // Trigger recenter via LiveMap's internal recenter functionality
    // The LiveMap component handles this automatically with its recenter button
  }

  const visibleOptions = pinkOnly
    ? vehicleOptions.filter(o => o.femaleAllowed)
    : vehicleOptions

  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.PICKUP: return 'Pickup'
      case STEPS.DROP: return 'Drop'
      case STEPS.VEHICLE: return 'Choose vehicle'
      case STEPS.FARE: return 'Fare'
      case STEPS.PAYMENT: return 'Payment'
      default: return 'Book a Ride'
    }
  }

  const getButtonText = () => {
    switch (currentStep) {
      case STEPS.PICKUP: return 'Next'
      case STEPS.DROP: return 'Next'
      case STEPS.VEHICLE: return 'Next'
      case STEPS.FARE: return 'Next'
      case STEPS.PAYMENT: return 'Confirm'
      default: return 'Next'
    }
  }

  const getHelpText = () => {
    if (currentStep === STEPS.PICKUP && pickupValidationError) {
      return pickupValidationError.message
    }
    
    const helpMessages = {
      [STEPS.PICKUP]: 'Please select a pickup location to continue',
      [STEPS.DROP]: 'Please select a destination to continue',
      [STEPS.VEHICLE]: 'Please choose a vehicle to continue',
      [STEPS.PAYMENT]: 'Please select a payment method to continue'
    }
    
    return helpMessages[currentStep] || ''
  }

  const canAdvance = () => {
    switch (currentStep) {
      case STEPS.PICKUP: return !!pickup
      case STEPS.DROP: return !!drop
      case STEPS.VEHICLE: return !!selectedRide
      case STEPS.FARE: return true
      case STEPS.PAYMENT: return !!payment
      default: return false
    }
  }

  // Keyboard navigation for stepper
  const handleKeyDown = useCallback((e) => {
    if (e.target.closest('[role="dialog"]')) return // Don't interfere with modal
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        if (currentStep !== STEPS.PICKUP) {
          const currentIndex = Object.values(STEPS).indexOf(currentStep)
          if (currentIndex > 0) {
            setCurrentStep(Object.values(STEPS)[currentIndex - 1])
          }
        }
        break
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        if (canAdvance()) {
          handleStepAdvance()
        }
        break
      case 'Escape':
        e.preventDefault()
        if (showConfirm) {
          setShowConfirm(false)
        } else {
          navigate('/passenger/home')
        }
        break
    }
  }, [currentStep, canAdvance, handleStepAdvance, showConfirm, navigate])

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Loading state to prevent white screen
  if (!vehicleOptions || vehicleOptions.length === 0) {
    return <BookFlowLoadingState.PageOverlay message="Loading booking interface..." />
  }

  const handleErrorBoundaryRetry = useCallback((retryCount) => {
    console.log(`BookRide error boundary retry attempt: ${retryCount}`);
    // Reset component state on retry
    setCurrentStep(STEPS.PICKUP);
    setFormData({
      pickup: { lat: null, lon: null, address: '' },
      drop: { lat: null, lon: null, address: '' },
      selectedVehicle: null,
      paymentMethod: 'cash'
    });
  }, []);

  const handleErrorBoundaryGoHome = useCallback(() => {
    navigate('/passenger/home');
  }, [navigate]);

  return (
    <BookFlowErrorBoundary 
      onRetry={handleErrorBoundaryRetry}
      onGoHome={handleErrorBoundaryGoHome}
      maxRetries={2}
    >
      <NetworkStatus onNetworkChange={handleNetworkChange}>
        <LocationErrorHandler onRetry={retryLocation}>
        <div className='relative min-h-screen w-full bg-theme-background text-theme-primary overflow-hidden'>
          {/* Skip Link for Screen Readers */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-lg focus:shadow-lg"
          >
            Skip to main content
          </a>
          
          {/* Screen Reader Announcements */}
          <div 
            aria-live="assertive" 
            aria-atomic="true" 
            className="sr-only"
            id="step-announcer"
          >
            Step {Object.values(STEPS).indexOf(currentStep) + 1} of {Object.values(STEPS).length}: {getStepTitle()}
          </div>
          {/* Ambient gradient orbs following brand guidelines */}
          <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-primary blur-3xl opacity-30' />
          <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-secondary blur-3xl opacity-25' />
          <div className='pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-accent blur-3xl opacity-20' />

          {/* Offline Mode Banner */}
          <AnimatePresence>
            {isOfflineMode && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-0 left-0 right-0 z-30 bg-orange-600/90 backdrop-blur-sm text-white px-4 py-2 text-center text-sm font-medium"
              >
                📱 Offline Mode - Limited functionality available
              </motion.div>
            )}
          </AnimatePresence>

      {/* Map Section - Responsive height and positioning */}
      <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-screen lg:w-3/5 z-10">
        <LiveMap 
          pickup={pickup ? { ...pickup, label: pickupLabel } : null} 
          drop={drop ? { ...drop, label: dropLabel } : null} 
          routes={routes}
          selectedRouteId={selectedRouteId}
          onRouteSelect={handleRouteSelect}
          className="w-full h-full"
        />
        
        {/* Location Permission Denied Overlay */}
        {locationPermissionDenied && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-30">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm text-center shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-white mb-2 font-poppins">Location Access Needed</h3>
              <p className="text-white/80 mb-4 font-inter">
                Please enable location access in your browser settings to automatically detect your pickup location.
              </p>
              <div className="space-y-3">
                <button
                  onClick={retryLocation}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1] text-white rounded-xl hover:shadow-[0_8px_30px_rgba(77,166,255,0.4)] transition-all duration-300 font-medium font-inter"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => setLocationPermissionDenied(false)}
                  className="w-full py-3 px-4 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-all duration-300 backdrop-blur-sm font-inter"
                >
                  Continue Manually
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Recenter functionality is handled by LiveMap component's built-in recenter button */}
      </div>

      {/* Route Selection Cards */}
      <AnimatePresence>
        {routes.length > 1 && (
          <motion.div 
            className="absolute bottom-4 left-4 right-4 lg:right-[42%] z-30"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0, 0.2, 1],
              delay: 0.2
            }}
          >
            <motion.div 
              className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(24px)' }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3 
                className="text-white font-medium mb-3 font-inter text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Choose Route ({routes.length} options)
              </motion.h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {routes.map((route, index) => {
                    const isSelected = route.id === selectedRouteId
                    const distanceText = formatRouteDistance(route.distance)
                    const durationText = formatRouteDuration(route.duration)
                    
                    return (
                      <motion.button
                        key={route.id}
                        onClick={() => handleRouteSelect(route.id)}
                        className={`w-full p-3 rounded-xl text-left relative overflow-hidden ${
                          isSelected 
                            ? 'bg-gradient-to-r from-[#4DA6FF]/20 via-[#EFBFFF]/20 to-[#7CE7E1]/20 border border-[#4DA6FF]/30 shadow-[0_4px_20px_rgba(77,166,255,0.2)]' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0, 
                          scale: isSelected ? 1.02 : 1,
                          boxShadow: isSelected 
                            ? '0 4px 20px rgba(77, 166, 255, 0.2)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.1,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        whileHover={{ 
                          scale: isSelected ? 1.02 : 1.01,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        layout
                      >
                        {/* Selection ripple effect */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#4DA6FF]/10 via-[#EFBFFF]/10 to-[#7CE7E1]/10 rounded-xl"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          />
                        )}
                        
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-[#4DA6FF]' : 'bg-white/40'
                              }`}
                              animate={{
                                scale: isSelected ? [1, 1.3, 1] : 1,
                                boxShadow: isSelected 
                                  ? '0 0 8px rgba(77, 166, 255, 0.6)' 
                                  : '0 0 0px rgba(255, 255, 255, 0)'
                              }}
                              transition={{ 
                                duration: 0.3,
                                scale: { repeat: isSelected ? Infinity : 0, repeatDelay: 2 }
                              }}
                            />
                            <div>
                              <motion.div 
                                className="text-white font-medium text-sm font-inter"
                                animate={{ 
                                  color: isSelected ? '#4DA6FF' : '#ffffff'
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                Route {index + 1}
                                {route.isFallback && (
                                  <motion.span 
                                    className="ml-2 text-xs text-yellow-400"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    (Est.)
                                  </motion.span>
                                )}
                              </motion.div>
                              <motion.div 
                                className="text-white/70 text-xs font-inter"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                {distanceText} • {durationText}
                              </motion.div>
                            </div>
                          </div>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div 
                                className="text-[#4DA6FF] text-xs font-medium flex items-center space-x-1"
                                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <motion.div
                                  className="w-1 h-1 bg-[#4DA6FF] rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                  }}
                                />
                                <span>Selected</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
               </div>
               <DirectionsLoadingFallback
                 isLoading={isLoadingRoutes}
                 pickup={pickup}
                 drop={drop}
                 className="py-2"
               />
               {routeError && (
                 <DirectionsErrorFallback
                   error={routeError}
                   onRetry={() => {
                     if (pickup && drop) {
                       fetchDirections(pickup, drop)
                     }
                   }}
                   className="mt-2"
                 />
               )}
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

      {/* Stepper Section */}
      <div className="relative lg:fixed lg:top-0 lg:right-0 lg:w-2/5 lg:h-full lg:overflow-y-auto bg-black/80 backdrop-blur-xl lg:border-l border-white/10 z-20 shadow-[0_8px_30px_rgba(0,0,0,0.25)] min-h-[55vh] sm:min-h-[50vh] md:min-h-[45vh] lg:min-h-full">
        <div className="p-4 sm:p-5 lg:p-6 bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-md border border-white/5 rounded-2xl lg:rounded-none" tabIndex="-1" id="main-content">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button 
              onClick={() => navigate('/passenger/home')}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-lg transition-colors font-inter min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#4DA6FF]/50 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Go back to passenger home"
              title="Go back"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold font-poppins text-center flex-1 px-2" id="page-title" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              {currentStep === STEPS.PICKUP ? (
                <>Book Your <span className='bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1] bg-clip-text text-transparent'>Ride</span></>
              ) : (
                <span className="text-white">{getStepTitle()}</span>
              )}
            </h1>
            <div className="w-10 sm:w-11"></div> {/* Spacer to match button width */}
          </div>

          {/* Progress Indicator */}
          <nav aria-label="Booking progress" className="mb-6 sm:mb-8" role="navigation">
            <ol className="flex items-center justify-center" role="list">
              {Object.values(STEPS).map((step, index) => {
                const isActive = step === currentStep
                const isCompleted = Object.values(STEPS).indexOf(currentStep) > index
                const stepNames = {
                  [STEPS.PICKUP]: 'Pickup Location',
                  [STEPS.DROP]: 'Destination',
                  [STEPS.VEHICLE]: 'Vehicle Selection',
                  [STEPS.FARE]: 'Fare Review',
                  [STEPS.PAYMENT]: 'Payment Method'
                }
                return (
                  <React.Fragment key={step}>
                    <li className="flex items-center" role="listitem">
                      <motion.div 
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 font-inter min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] ${
                          isActive ? 'bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] text-white shadow-[0_0_20px_rgba(77,166,255,0.5)] scale-110' :
                          isCompleted ? 'bg-gradient-to-r from-[#7CE7E1] to-[#4DA6FF] text-white shadow-[0_8px_30px_rgba(124,231,225,0.3)]' :
                          'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
                        }`}
                        initial={false}
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          boxShadow: isActive ? '0 0 20px rgba(77, 166, 255, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        role="img"
                        aria-label={`Step ${index + 1}: ${stepNames[step]} - ${isCompleted ? 'Completed' : isActive ? 'Current' : 'Pending'}`}
                        aria-current={isActive ? 'step' : undefined}
                      >
                        <motion.span
                          initial={false}
                          animate={{ 
                            scale: isCompleted ? [1, 1.2, 1] : 1,
                            rotate: isCompleted ? [0, 360] : 0
                          }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          aria-hidden="true"
                        >
                          {isCompleted ? '✓' : index + 1}
                        </motion.span>
                      </motion.div>
                    </li>
                    {index < Object.values(STEPS).length - 1 && (
                      <li className="flex-1 h-0.5 mx-1 sm:mx-2 relative max-w-[20px] sm:max-w-none" aria-hidden="true">
                        <div className="absolute inset-0 bg-white/20 rounded-full" />
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-[#7CE7E1] to-[#4DA6FF] rounded-full origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isCompleted ? 1 : 0 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                      </li>
                    )}
                  </React.Fragment>
                )
              })}
            </ol>
          </nav>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 }
              }}
              className="space-y-6"
              role="main"
              aria-live="polite"
              aria-label={`Step ${Object.values(STEPS).indexOf(currentStep) + 1} of ${Object.values(STEPS).length}: ${getStepTitle()}`}
              aria-labelledby="page-title"
              aria-describedby="step-instructions"
            >
              <div id="step-instructions" className="sr-only">
                {currentStep === STEPS.PICKUP && "Enter your pickup location or use current location"}
                {currentStep === STEPS.DROP && "Enter your destination"}
                {currentStep === STEPS.VEHICLE && "Select a vehicle type for your ride"}
                {currentStep === STEPS.FARE && "Review the fare breakdown for your trip"}
                {currentStep === STEPS.PAYMENT && "Choose your preferred payment method"}
              </div>
              {/* Step 1: Pickup */}
              {currentStep === STEPS.PICKUP && (
                <fieldset className="space-y-4">
                  <legend className="sr-only">Pickup Location Selection</legend>
                  <div className="space-y-2">
                    <label htmlFor="pickup-search" className="block text-sm font-medium text-theme-primary">
                      Pickup Location {errors.pickup && <span className="text-error">*</span>}
                    </label>
                    <EnhancedSearchBar
                      mode="pickup"
                      placeholder="Search for pickup location..."
                      value={pickupLabel}
                      onChange={setPickupLabel}
                      onLocationSelect={(location) => {
                        handlePickupLocationSelect({
                          lat: location.lat,
                          lon: location.lon,
                          address: location.label,
                          displayName: location.label,
                          displayPlace: location.enhancedLabel || location.label,
                          displayAddress: location.address?.road || ''
                        })
                      }}
                      disabled={isFeatureDisabled('search')}
                      className="w-full"
                      userCity={userCity}
                      userCoords={coords}
                      showCurrentLocationButton={true}
                      onRequestCurrentLocation={() => {
                        if (coords.lat && coords.lon) {
                          const locationData = {
                            lat: coords.lat,
                            lon: coords.lon,
                            address: reverseAddress?.label || `GPS Location (${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)})`,
                            displayName: reverseAddress?.label || `GPS Location (${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)})`,
                            displayPlace: 'Current Location',
                            displayAddress: reverseAddress?.label || ''
                          }
                          handlePickupLocationSelect(locationData)
                        }
                      }}
                    />
                    {errors.pickup && (
                      <p className="text-sm text-error">{errors.pickup}</p>
                    )}
                  </div>
                  

                </fieldset>
              )}

              {/* Step 2: Drop */}
              {currentStep === STEPS.DROP && (
                <fieldset className="space-y-4">
                  <legend className="sr-only">Destination Selection</legend>
                  <div className="space-y-2">
                    <label htmlFor="drop-search" className="block text-sm font-medium text-theme-primary">
                      Where to? {errors.drop && <span className="text-error">*</span>}
                    </label>
                    <EnhancedSearchBar
                      mode="drop"
                      placeholder="Search for destination..."
                      value={dropLabel}
                      onChange={setDropLabel}
                      onLocationSelect={(location) => {
                        handleDropLocationSelect({
                          lat: location.lat,
                          lon: location.lon,
                          address: location.label,
                          displayName: location.label,
                          displayPlace: location.enhancedLabel || location.label,
                          displayAddress: location.address?.road || ''
                        })
                      }}
                      disabled={isFeatureDisabled('search')}
                      className="w-full"
                      userCity={userCity}
                      userCoords={coords}
                    />
                    {errors.drop && (
                      <p className="text-sm text-error">{errors.drop}</p>
                    )}
                  </div>
                  
                  {/* Show selected pickup location for context */}
                  {pickup && pickupLabel && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
                      <p className="text-sm text-green-300 font-inter">
                        <span className="font-medium">From:</span> {pickupLabel}
                      </p>
                    </div>
                  )}
                </fieldset>
              )}

              {/* Step 3: Vehicle Selection */}
              {currentStep === STEPS.VEHICLE && (
                <fieldset className="space-y-4">
                  <legend className="block text-sm font-medium text-theme-primary mb-2 font-inter">
                    Choose your ride
                  </legend>
                  <RideOptionsCarousel
                    selectedId={selectedRide}
                    onSelect={setSelectedRide}
                    pinkOnly={pinkOnly}
                    onTogglePink={setPinkOnly}
                    pickup={pickup}
                    drop={drop}
                    distanceKm={distanceKm}
                    durationMin={durationMin}
                    isCalculatingFare={isCalculatingFare}
                    fareError={fareError}
                    allVehicleFares={allVehicleFares}
                    aria-label="Available ride options"
                  />
                  
                  {/* Live Fare Calculator */}
                  {pickup && drop && (
                    <FareCalculator
                      pickup={pickup}
                      drop={drop}
                      selectedVehicle={selectedRide}
                      routeDistance={distanceKm}
                      routeDuration={durationMin}
                      onFareUpdate={handleFareUpdate}
                      showAdminControls={false}
                      className="w-full mt-4"
                    />
                  )}
                  
                  {pinkOnly && visibleOptions.length === 0 && (
                    <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg backdrop-blur-sm" role="alert">
                      <p className="text-sm text-pink-300 font-inter">
                        No female drivers available for this route. Try again later or disable Sawari Pink.
                      </p>
                    </div>
                  )}
                </fieldset>
              )}

              {/* Step 4: Fare */}
              {currentStep === STEPS.FARE && (
                <section className="space-y-4" aria-labelledby="fare-heading">
                  <div>
                    <h3 id="fare-heading" className="block text-sm font-medium text-theme-primary mb-2 font-inter">
                      Fare breakdown
                    </h3>
                    <FareCalculator
                      pickup={pickup}
                      drop={drop}
                      selectedVehicle={selectedRide}
                      routeDistance={distanceKm}
                      routeDuration={durationMin}
                      onFareUpdate={handleFareUpdate}
                      showAdminControls={false}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="p-3 bg-white/5 backdrop-blur-sm glass-border rounded-lg" role="note">
                    <div className="flex items-center gap-2 text-sm text-theme-secondary font-inter">
                      <span aria-hidden="true">ℹ️</span>
                      <span>Final fare may vary based on actual distance and time</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 5: Payment */}
              {currentStep === STEPS.PAYMENT && (
                <fieldset className="space-y-4">
                  <legend className="block text-sm font-medium text-theme-primary mb-2 font-inter">
                    Payment method
                  </legend>
                  <PaymentSelector 
                    value={payment} 
                    onChange={setPayment}
                    onValidationChange={setIsPaymentValid}
                    aria-label="Select payment method"
                  />
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Button */}
          <div className="mt-6 sm:mt-8">
            <button
              onClick={handleStepAdvance}
              disabled={!canAdvance() || (currentStep === STEPS.PAYMENT && (isFeatureDisabled('booking') || !isPaymentValid)) || (currentStep === STEPS.PICKUP && pickupValidationError)}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 font-poppins shadow-lg min-h-[48px] sm:min-h-[56px] focus:outline-none focus:ring-4 focus:ring-[#4DA6FF]/30 focus:ring-offset-2 focus:ring-offset-transparent ${
                !canAdvance() || (currentStep === STEPS.PAYMENT && (isFeatureDisabled('booking') || !isPaymentValid)) || (currentStep === STEPS.PICKUP && pickupValidationError)
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-500/30'
                  : 'bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1] text-white hover:shadow-[0_8px_30px_rgba(77,166,255,0.4)] hover:scale-[1.02] active:scale-[0.98] border border-[#4DA6FF]/30'
              }`}
              aria-describedby={!canAdvance() ? 'button-help' : undefined}
              aria-label={`${isOfflineMode && currentStep === STEPS.PAYMENT ? 'Offline - Cannot Book' : currentStep === STEPS.PICKUP && pickupValidationError ? 'Invalid Location' : getButtonText()}. Step ${Object.values(STEPS).indexOf(currentStep) + 1} of ${Object.values(STEPS).length}`}
              type="button"
            >
              {isOfflineMode && currentStep === STEPS.PAYMENT ? 'Offline - Cannot Book' : 
               currentStep === STEPS.PICKUP && pickupValidationError ? 'Invalid Location' :
               getButtonText()}
            </button>
            {!canAdvance() && (
              <p id="button-help" className="text-xs text-theme-muted mt-2 font-inter">
                {getHelpText()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Ride Modal */}
      <ConfirmRideModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onEdit={() => {
          setShowConfirm(false)
          setCurrentStep(STEPS.PICKUP)
        }}
        onConfirm={() => {
          setShowConfirm(false)
          setShowSuccess(true)
        }}
        pickup={pickupLabel}
        drop={dropLabel}
        vehicle={currentRide}
        fare={allVehicleFares[selectedRide] || calculatedFare || { breakdown: { total: currentRideFare }, details: { distanceKm: distanceKm, durationMin: durationMin } }}
        payment={payment}
        isRequestDisabled={!isPaymentValid}
      />

      {/* Ride Success Modal */}
      <RideSuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          navigate('/passenger/home')
        }}
      />
        </div>
      </LocationErrorHandler>
    </NetworkStatus>
    </BookFlowErrorBoundary>
  )
}

export default BookRide