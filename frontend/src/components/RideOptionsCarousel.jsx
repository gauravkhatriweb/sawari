/**
 * RideOptionsCarousel.jsx - Vehicle Selection Carousel Component
 * 
 * A comprehensive carousel component for selecting ride options with different vehicle types.
 * Features responsive design, mobile swipe gestures, fare calculations, and accessibility support.
 * Integrates with the fare calculator to display real-time pricing for each vehicle option.
 * 
 * Key Features:
 * - Responsive carousel with desktop and mobile layouts
 * - Touch/swipe gestures for mobile navigation
 * - Real-time fare calculation for each vehicle type
 * - Pink ride toggle for female-only rides
 * - Accessibility support with keyboard navigation
 * - Smooth animations and transitions
 * - Vehicle capacity and ETA information
 * - Error handling for fare calculation failures
 * - Auto-scrolling to selected vehicle
 * 
 * Vehicle Types:
 * - Bike: Fast, economical single-passenger rides
 * - Auto: Comfortable 3-passenger rickshaw rides
 * - Car: Spacious 4-passenger car rides
 * 
 * Usage:
 * ```jsx
 * <RideOptionsCarousel
 *   selectedId="auto"
 *   onSelect={(vehicleId) => setSelectedVehicle(vehicleId)}
 *   pinkOnly={false}
 *   onTogglePink={(enabled) => setPinkMode(enabled)}
 *   pickup={pickupLocation}
 *   drop={dropLocation}
 *   distanceKm={5.2}
 *   durationMin={12}
 *   isCalculatingFare={false}
 *   fareError={null}
 * />
 * ```
 */

import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPKRDisplay } from '../utils/currency'
import { calculateAllFares, getAllVehicleConfigs } from '../utils/fareCalculator'

/**
 * RideOptionsCarousel Component
 * 
 * Main carousel component for vehicle selection with fare display and mobile optimization.
 * 
 * @param {string} selectedId - Currently selected vehicle ID
 * @param {Function} onSelect - Callback when a vehicle is selected
 * @param {boolean} pinkOnly - Whether pink ride mode is enabled
 * @param {Function} onTogglePink - Callback to toggle pink ride mode
 * @param {Object} pickup - Pickup location object
 * @param {Object} drop - Drop-off location object
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} durationMin - Duration in minutes
 * @param {boolean} isCalculatingFare - Whether fare calculation is in progress
 * @param {string|null} fareError - Error message from fare calculation
 */
const RideOptionsCarousel = ({ 
  selectedId, 
  onSelect, 
  pinkOnly, 
  onTogglePink, 
  pickup, 
  drop, 
  distanceKm = 0, 
  durationMin = 0,
  isCalculatingFare = false,
  fareError = null
}) => {
  // Refs for DOM manipulation and scrolling
  const containerRef = useRef(null) // Desktop carousel container
  const selectedButtonRef = useRef(null) // Currently selected button
  const mobileContainerRef = useRef(null) // Mobile carousel container
  
  // Mobile swipe gesture state management
  const [currentIndex, setCurrentIndex] = useState(0) // Current visible card index
  const [isDragging, setIsDragging] = useState(false) // Whether user is dragging
  const [dragStart, setDragStart] = useState(0) // Initial drag position
  const [dragOffset, setDragOffset] = useState(0) // Current drag offset
  const [showVehicleSheet, setShowVehicleSheet] = useState(false) // Fallback sheet visibility

  // Get vehicle configurations from fare calculator utility
  const vehicleConfigs = useMemo(() => getAllVehicleConfigs(), [])
  
  /**
   * Transform vehicle configurations into display-ready options
   * Calculates ETA based on distance and average speed for each vehicle type
   */
  const vehicleOptions = useMemo(() => {
    return Object.entries(vehicleConfigs).map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
      // Calculate ETA range based on distance and vehicle speed
      eta: `${Math.round(distanceKm / config.avgSpeed * 60) || 3}-${Math.round(distanceKm / config.avgSpeed * 60) + 2 || 5} min`,
      capacity: `${config.capacity} passenger${config.capacity > 1 ? 's' : ''}`,
      note: config.description,
      suitability: config.description,
      color: config.color,
      femaleAllowed: config.femaleAllowed, // Whether vehicle supports pink rides
      avgSpeed: config.avgSpeed
    }))
  }, [vehicleConfigs, distanceKm])

  /**
   * Calculate fare for each vehicle type using the fare calculator
   * Returns vehicles with calculated fares or placeholder values
   */
  const vehiclesWithFare = useMemo(() => {
    if (!distanceKm || distanceKm <= 0) {
      // Return vehicles with placeholder fares when no distance is available
      return vehicleOptions.map(vehicle => ({
        ...vehicle,
        previewFare: 0,
        fareBreakdown: null,
        isEstimate: true
      }))
    }

    try {
      const allFares = calculateAllFares({
        distanceKm,
        durationMin: durationMin || undefined,
        includeSurge: false // Don't include surge for preview
      })

      return vehicleOptions.map(vehicle => {
        const fareData = allFares[vehicle.id]
        if (fareData && !fareData.error) {
          return {
            ...vehicle,
            previewFare: fareData.breakdown.total,
            fareBreakdown: fareData.breakdown,
            isEstimate: false
          }
        } else {
          // Fallback calculation if fare calculator fails
          const config = vehicleConfigs[vehicle.id]
          const fallbackFare = config.baseFare + (config.perKmRate * distanceKm)
          return {
            ...vehicle,
            previewFare: Math.round(fallbackFare),
            fareBreakdown: null,
            isEstimate: true
          }
        }
      })
    } catch (error) {
      console.error('Fare calculation error:', error)
      // Return vehicles with fallback fares
      return vehicleOptions.map(vehicle => {
        const config = vehicleConfigs[vehicle.id]
        const fallbackFare = config.baseFare + (config.perKmRate * (distanceKm || 0))
        return {
          ...vehicle,
          previewFare: Math.round(fallbackFare),
          fareBreakdown: null,
          isEstimate: true,
          error: 'Calculation failed'
        }
      })
    }
  }, [vehicleOptions, vehicleConfigs, distanceKm, durationMin])

  // Filter options based on Sawari Pink toggle
  const visibleOptions = useMemo(() => {
    return pinkOnly ? vehiclesWithFare.filter(v => v.femaleAllowed) : vehiclesWithFare
  }, [vehiclesWithFare, pinkOnly])

  // Check if vehicles should be disabled
  const isDisabled = !pickup || !drop
  
  // Update current index when selected vehicle changes
  useEffect(() => {
    const selectedIndex = visibleOptions.findIndex(v => v.id === selectedId)
    if (selectedIndex !== -1) {
      setCurrentIndex(selectedIndex)
    }
  }, [selectedId, visibleOptions])
  
  // Mobile touch handlers
  const handleTouchStart = useCallback((e) => {
    if (isDisabled) return
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
    setDragOffset(0)
  }, [isDisabled])
  
  const handleTouchMove = useCallback((e) => {
    if (!isDragging || isDisabled) return
    const currentX = e.touches[0].clientX
    const offset = currentX - dragStart
    setDragOffset(offset)
  }, [isDragging, dragStart, isDisabled])
  
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || isDisabled) return
    
    const threshold = 50 // Minimum swipe distance
    let newIndex = currentIndex
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        // Swipe right - go to previous
        newIndex = currentIndex - 1
      } else if (dragOffset < 0 && currentIndex < visibleOptions.length - 1) {
        // Swipe left - go to next
        newIndex = currentIndex + 1
      }
    }
    
    setCurrentIndex(newIndex)
    if (visibleOptions[newIndex]) {
      onSelect?.(visibleOptions[newIndex].id)
      
      // Haptic feedback on mobile
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(25)
      }
    }
    
    setIsDragging(false)
    setDragOffset(0)
  }, [isDragging, dragOffset, currentIndex, visibleOptions, onSelect, isDisabled])
  
  // Navigation functions for mobile
  const goToPrevious = useCallback(() => {
    if (isDisabled || currentIndex <= 0) return
    const newIndex = currentIndex - 1
    setCurrentIndex(newIndex)
    onSelect?.(visibleOptions[newIndex].id)
  }, [currentIndex, visibleOptions, onSelect, isDisabled])
  
  const goToNext = useCallback(() => {
    if (isDisabled || currentIndex >= visibleOptions.length - 1) return
    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)
    onSelect?.(visibleOptions[newIndex].id)
  }, [currentIndex, visibleOptions, onSelect, isDisabled])

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e, optionId, index) => {
    if (isDisabled) return
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = index > 0 ? index - 1 : visibleOptions.length - 1
        const prevButton = containerRef.current?.children[prevIndex]
        if (prevButton) {
          prevButton.focus()
          onSelect?.(visibleOptions[prevIndex].id)
        }
        break
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = index < visibleOptions.length - 1 ? index + 1 : 0
        const nextButton = containerRef.current?.children[nextIndex]
        if (nextButton) {
          nextButton.focus()
          onSelect?.(visibleOptions[nextIndex].id)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelect?.(optionId)
        break
    }
  }, [visibleOptions, onSelect, isDisabled])

  // Scroll selected option into view
  useEffect(() => {
    if (selectedButtonRef.current) {
      selectedButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [selectedId])

  // Sync currentIndex with selectedId for mobile carousel
  useEffect(() => {
    const selectedIndex = visibleOptions.findIndex(option => option.id === selectedId)
    if (selectedIndex !== -1 && selectedIndex !== currentIndex) {
      setCurrentIndex(selectedIndex)
    }
  }, [selectedId, visibleOptions, currentIndex])

  return (
    <div className="space-y-4">
      {/* Header with Sawari Pink Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-theme-primary font-poppins" id="ride-options-heading">
          Choose your ride
        </h3>
        <motion.label 
          className="flex items-center gap-2 text-sm cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input 
            type="checkbox" 
            checked={pinkOnly} 
            onChange={(e) => onTogglePink?.(e.target.checked)}
            disabled={isDisabled}
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-pink-500/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby="pink-option-desc"
          />
          <span 
            id="pink-option-desc" 
            className={`font-inter ${isDisabled ? 'text-theme-muted' : 'text-theme-secondary'}`}
          >
            Sawari Pink
          </span>
        </motion.label>
      </div>

      {/* Disabled State Message */}
      {isDisabled && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-sm"
          role="alert"
        >
          <div className="flex items-center gap-2 text-sm text-yellow-300 font-inter">
            <span aria-hidden="true">⚠️</span>
            <span>Please select pickup and drop locations to view vehicle options</span>
          </div>
        </motion.div>
      )}

      {/* Sawari Pink Female Drivers Note */}
      {pinkOnly && !isDisabled && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg backdrop-blur-sm"
          role="note"
        >
          <div className="flex items-center gap-2 text-sm text-pink-300 font-inter">
            <span aria-hidden="true">👩‍💼</span>
            <span>Female drivers only - Ensuring your safety and comfort</span>
          </div>
        </motion.div>
      )}

      {/* Vehicle Cards Carousel */}
      <div className="relative">
        {/* Desktop: Horizontal scroll with navigation */}
        <div className="hidden md:block">
          <div className="overflow-x-auto scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30 hover:scrollbar-thumb-white/50">
            <div 
              className="flex gap-4 pb-2 scroll-smooth" 
              ref={containerRef}
              role="radiogroup"
              aria-labelledby="ride-options-heading"
              aria-describedby="ride-options-instructions"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              <div id="ride-options-instructions" className="sr-only">
                Use arrow keys to navigate between ride options. Press Enter or Space to select.
              </div>
              {visibleOptions.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedId === vehicle.id}
                  isDisabled={isDisabled}
                  onSelect={() => !isDisabled && onSelect?.(vehicle.id)}
                  onKeyDown={(e) => handleKeyDown(e, vehicle.id, index)}
                  ref={selectedId === vehicle.id ? selectedButtonRef : null}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Enhanced Swipeable cards with navigation */}
        <div className="md:hidden">
          <div className="relative">
            {/* Navigation arrows */}
            <button
              onClick={goToPrevious}
              disabled={isDisabled || currentIndex <= 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:bg-black/90 hover:border-brand-primary/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 shadow-xl"
              aria-label="Previous vehicle option"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              disabled={isDisabled || currentIndex >= visibleOptions.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:bg-black/90 hover:border-brand-primary/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 shadow-xl"
              aria-label="Next vehicle option"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Swipeable container */}
            <div 
              className="overflow-hidden px-16"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="radiogroup"
              aria-labelledby="ride-options-heading"
              aria-describedby="ride-options-instructions"
              style={{ touchAction: 'pan-x' }}
            >
              <motion.div 
                ref={mobileContainerRef}
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
                  scrollSnapType: 'x mandatory'
                }}
                animate={{
                  x: isDragging ? dragOffset : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                {visibleOptions.map((vehicle, index) => (
                  <div key={vehicle.id} className="w-full flex-shrink-0 px-2" style={{ scrollSnapAlign: 'center' }}>
                    <VehicleCard
                      vehicle={vehicle}
                      isSelected={selectedId === vehicle.id}
                      isDisabled={isDisabled}
                      onSelect={() => !isDisabled && onSelect?.(vehicle.id)}
                      onKeyDown={(e) => handleKeyDown(e, vehicle.id, index)}
                      ref={selectedId === vehicle.id ? selectedButtonRef : null}
                      isMobile={true}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Dots indicator and More vehicles button */}
            <div className="flex flex-col items-center mt-6 gap-4">
              <div className="flex justify-center gap-3">
                {visibleOptions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isDisabled) {
                        setCurrentIndex(index)
                        onSelect?.(visibleOptions[index].id)
                      }
                    }}
                    disabled={isDisabled}
                    className={`w-3 h-3 rounded-full transition-all duration-300 border ${
                      index === currentIndex 
                        ? 'bg-brand-primary border-brand-primary scale-125 shadow-lg shadow-brand-primary/30' 
                        : 'bg-white/20 border-white/30 hover:bg-white/40 hover:border-white/50'
                    } disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
                    aria-label={`Go to ${visibleOptions[index]?.name} option`}
                  />
                ))}
              </div>
              
              {/* More vehicles fallback button */}
              <button
                onClick={() => setShowVehicleSheet(true)}
                disabled={isDisabled}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/80 text-sm font-inter hover:bg-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                aria-label="View all vehicle options"
              >
                <span>More vehicles</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Vehicle Selection Sheet */}
      <AnimatePresence>
        {showVehicleSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => setShowVehicleSheet(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-theme-surface border border-white/20 rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-theme-primary font-poppins">
                    Select Vehicle
                  </h3>
                  <button
                    onClick={() => setShowVehicleSheet(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                    aria-label="Close vehicle selection"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {visibleOptions.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        onSelect?.(vehicle.id)
                        setShowVehicleSheet(false)
                      }}
                      disabled={isDisabled}
                      className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                        selectedId === vehicle.id
                          ? 'bg-brand-primary/20 border-brand-primary text-white'
                          : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                      } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{vehicle.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{vehicle.name}</div>
                          <div className="text-sm opacity-70">{vehicle.capacity} • {vehicle.eta}</div>
                          {vehicle.previewFare > 0 && (
                            <div className="text-lg font-bold text-brand-primary mt-1">
                              {formatPKRDisplay(vehicle.previewFare)}
                            </div>
                          )}
                        </div>
                        {selectedId === vehicle.id && (
                          <div className="text-brand-primary">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Microcopy */}
      <AnimatePresence>
        {selectedId && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg shadow-lg"
            role="note"
          >
            <div className="flex items-start gap-2 text-sm text-white/80 font-inter">
              <span aria-hidden="true">💡</span>
              <span>
                {visibleOptions.find(v => v.id === selectedId)?.suitability}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Vehicle Card Component
const VehicleCard = React.forwardRef(({ 
  vehicle, 
  isSelected, 
  isDisabled, 
  onSelect, 
  onKeyDown, 
  isMobile = false 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={!isDisabled ? { y: -2, scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      disabled={isDisabled}
      className={`
        ${isMobile ? 'w-[280px]' : 'min-w-[240px] max-w-[280px]'} 
        text-left rounded-xl p-4 shadow-lg transition-all duration-300 relative
        focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-transparent
        disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl
        ${
          isSelected 
            ? 'bg-gradient-to-br from-brand-primary/20 via-black/60 to-black/80 border-2 border-brand-primary/50 shadow-xl shadow-brand-primary/30' 
            : 'bg-black/60 border border-white/20 hover:bg-black/70 hover:border-white/30 hover:shadow-xl'
        }
      `}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${vehicle.name}, ${vehicle.eta}, ${vehicle.capacity}, ${formatPKRDisplay(vehicle.previewFare)}`}
      tabIndex={isSelected ? 0 : -1}
    >
      {/* Vehicle Icon and ETA */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl" aria-hidden="true">{vehicle.icon}</div>
        <div className="text-right">
          <div className="text-xs text-white/60 font-inter">ETA</div>
          <div className="text-sm font-medium text-white/80 font-inter">{vehicle.eta}</div>
        </div>
      </div>

      {/* Vehicle Name */}
      <div className="mb-2">
        <h4 
          className="text-lg font-semibold font-poppins text-white" 
        >
          {vehicle.name}
        </h4>
      </div>

      {/* Capacity and Note */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-2 text-sm text-white/80 font-inter">
          <span aria-hidden="true">👥</span>
          <span>{vehicle.capacity}</span>
        </div>
        <div className="text-xs text-white/60 font-inter">
          {vehicle.note}
        </div>
      </div>

      {/* Travel Time and Fare */}
      <div className="flex items-center justify-between pt-2 border-t border-white/20">
        <div className="text-sm text-white/80 font-inter">
          ~{Math.round(18)} min
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60 font-inter">Fare</div>
          <div className="text-lg font-bold text-white font-poppins">
            {vehicle.previewFare > 0 ? formatPKRDisplay(vehicle.previewFare) : '--'}
          </div>
          {vehicle.isEstimate && (
            <div className="text-xs text-white/60 font-inter">Estimated</div>
          )}
          {vehicle.error && (
            <div className="text-xs text-yellow-400 font-inter">Approx.</div>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
      
      <div className="sr-only">
        {isSelected ? 'Selected' : 'Not selected'}
      </div>
     </motion.button>
   )
 })

 VehicleCard.displayName = 'VehicleCard'

 export default RideOptionsCarousel