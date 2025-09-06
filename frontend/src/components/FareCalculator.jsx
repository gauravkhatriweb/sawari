/**
 * FareCalculator.jsx - Dynamic Fare Calculation Component
 * 
 * A comprehensive fare calculation system for ride-sharing services.
 * Calculates fares based on distance, time, vehicle type, and operational costs.
 * Features real-time updates, admin controls, and detailed breakdown display.
 * 
 * Key Features:
 * - Real-time fare calculation using actual route distance when available
 * - Fallback to Haversine formula when route data unavailable
 * - Multiple vehicle types (bike, auto, car)
 * - Dynamic pricing based on distance and time
 * - Fuel efficiency and operational cost considerations
 * - Admin controls for fare adjustment
 * - Detailed fare breakdown display
 * - Smooth animations and responsive design
 * - PKR currency formatting
 * - Collapsible detailed view
 * 
 * Calculation Methodology:
 * - Base fare + (distance × per-km rate) + (time × per-minute rate)
 * - Includes fuel costs based on efficiency and petrol prices
 * - Applies operational margin for business sustainability
 * - Uses actual route distance/duration when provided, otherwise estimates
 * 
 * Vehicle Types:
 * - Bike: Most economical, highest fuel efficiency
 * - Auto: Moderate pricing, good for short trips
 * - Car: Premium option, comfortable for longer rides
 * 
 * Usage:
 * ```jsx
 * <FareCalculator
 *   pickup={{ lat: 24.8607, lng: 67.0011 }}
 *   drop={{ lat: 24.8615, lng: 67.0099 }}
 *   selectedVehicle="bike"
 *   routeDistance={5.2} // km from actual route
 *   routeDuration={15} // minutes from actual route
 *   onFareUpdate={(fare) => setCalculatedFare(fare)}
 *   showAdminControls={isAdmin}
 * />
 * ```
 */

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from '@heroicons/react/24/outline'
import { formatPKRDisplay } from '../utils/currency'

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Default vehicle configurations with pricing and efficiency data
const DEFAULT_VEHICLE_CONFIG = {
  bike: {
    baseFare: 80,
    perKm: 15,
    perMin: 3,
    fuelEfficiency: 45, // km/l
    avgSpeed: 25 // km/h
  },
  auto: {
    baseFare: 100,
    perKm: 18,
    perMin: 4,
    fuelEfficiency: 18, // km/l
    avgSpeed: 20 // km/h
  },
  car: {
    baseFare: 150,
    perKm: 25,
    perMin: 5,
    fuelEfficiency: 12, // km/l
    avgSpeed: 30 // km/h
  }
}

// Market-based pricing constants
const DEFAULT_PETROL_PRICE = 280 // PKR per liter
const OPERATIONAL_MARGIN = 1.15 // 15% margin for operational costs

/**
 * FareCalculator Component
 * 
 * Calculates and displays ride fares with detailed breakdown.
 * 
 * @param {Object} pickup - Pickup location coordinates {lat, lng}
 * @param {Object} drop - Drop location coordinates {lat, lng}
 * @param {string} selectedVehicle - Vehicle type ('bike', 'auto', 'car')
 * @param {number} routeDistance - Actual route distance in km (optional)
 * @param {number} routeDuration - Actual route duration in minutes (optional)
 * @param {Function} onFareUpdate - Callback when fare is calculated
 * @param {string} className - Additional CSS classes
 * @param {boolean} showAdminControls - Whether to show admin adjustment controls
 */
const FareCalculator = ({ 
  pickup, 
  drop, 
  selectedVehicle = 'bike',
  routeDistance = null,
  routeDuration = null,
  onFareUpdate,
  className = '',
  showAdminControls = false
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [petrolPrice, setPetrolPrice] = useState(DEFAULT_PETROL_PRICE)
  const [vehicleConfig, setVehicleConfig] = useState(DEFAULT_VEHICLE_CONFIG)

  // Calculate distance and duration - use route data when available, fallback to Haversine
  const { distance, duration, isEstimated } = useMemo(() => {
    if (!pickup || !drop) {
      return { distance: 0, duration: 0, isEstimated: false }
    }

    // Use actual route distance and duration when available
    if (routeDistance !== null && routeDuration !== null) {
      return {
        distance: Math.round(routeDistance * 100) / 100, // Round to 2 decimal places
        duration: Math.round(routeDuration),
        isEstimated: false
      }
    }

    // Fallback to Haversine calculation
    const distanceKm = calculateDistance(
      pickup.lat, pickup.lng || pickup.lon,
      drop.lat, drop.lng || drop.lon
    )

    const config = vehicleConfig[selectedVehicle]
    if (!config || !config.avgSpeed) {
      console.warn(`Invalid vehicle type: ${selectedVehicle}. Using default bike config.`)
      const fallbackConfig = vehicleConfig.bike || DEFAULT_VEHICLE_CONFIG.bike
      const durationMin = (distanceKm / fallbackConfig.avgSpeed) * 60
      return {
        distance: Math.round(distanceKm * 100) / 100,
        duration: Math.round(durationMin),
        isEstimated: true
      }
    }
    
    const durationMin = (distanceKm / config.avgSpeed) * 60

    return {
      distance: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
      duration: Math.round(durationMin),
      isEstimated: true
    }
  }, [pickup, drop, selectedVehicle, vehicleConfig, routeDistance, routeDuration])

  // Calculate fare breakdown
  const fareBreakdown = useMemo(() => {
    if (!pickup || !drop) {
      return null
    }

    const config = vehicleConfig[selectedVehicle] || vehicleConfig.bike || DEFAULT_VEHICLE_CONFIG.bike
    const baseFare = config.baseFare
    const distanceCharge = Math.round(config.perKm * distance)
    const timeCharge = Math.round(config.perMin * duration)
    const fuelCost = Math.round((distance / config.fuelEfficiency) * petrolPrice)
    const subtotal = baseFare + distanceCharge + timeCharge + fuelCost
    const total = Math.round(subtotal * OPERATIONAL_MARGIN)

    return {
      baseFare,
      distanceCharge,
      timeCharge,
      fuelCost,
      subtotal,
      total,
      distance,
      duration
    }
  }, [pickup, drop, selectedVehicle, distance, duration, petrolPrice, vehicleConfig])

  // Notify parent component of fare updates
  useEffect(() => {
    if (fareBreakdown && onFareUpdate) {
      onFareUpdate(fareBreakdown)
    }
  }, [fareBreakdown, onFareUpdate])

  // Update vehicle config
  const updateVehicleConfig = (vehicle, field, value) => {
    setVehicleConfig(prev => ({
      ...prev,
      [vehicle]: {
        ...prev[vehicle],
        [field]: parseFloat(value) || 0
      }
    }))
  }

  if (!pickup || !drop) {
    return (
      <div className={`bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-4 text-center shadow-2xl ${className}`}>
        <p className="text-white/60 text-sm font-inter">
          Select pickup and drop locations to see fare estimate
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl ${className}`}>
      {/* Main Fare Display */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white font-inter">
              {isEstimated ? 'Estimated Fare' : 'Route Fare'}
            </h3>
            {!isEstimated && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 font-inter">
                Actual Route
              </span>
            )}
            {isEstimated && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30 font-inter">
                Estimated
              </span>
            )}
          </div>
          {showAdminControls && (
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="p-2 text-white/60 hover:text-white transition-colors"
              title="Admin Controls"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold text-brand-primary">
              {formatPKRDisplay(fareBreakdown?.total || 0)}
            </span>
            <span className="text-sm text-white/60 ml-2 font-inter">
              {distance}km • {duration}min
            </span>
          </div>
          
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center text-sm text-brand-primary hover:text-brand-secondary transition-colors font-inter"
          >
            {showBreakdown ? 'Hide' : 'Show'} breakdown
            {showBreakdown ? (
              <ChevronUpIcon className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>

        <p className="text-xs text-white/50 mt-2 font-inter">
          {isEstimated 
            ? `Estimation based on straight-line distance, petrol PKR ${petrolPrice}/L & typical vehicle efficiency. Final price may vary.`
            : `Based on actual route distance, petrol PKR ${petrolPrice}/L & typical vehicle efficiency. Final price may vary.`
          }
        </p>
      </div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {showBreakdown && fareBreakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/20 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <h4 className="font-medium text-white mb-3 font-inter">Fare Breakdown</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70 font-inter">Base fare</span>
                  <span className="font-medium text-white font-inter">{formatPKRDisplay(fareBreakdown.baseFare)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/70 font-inter">
                    Distance charge ({distance}km × PKR {vehicleConfig[selectedVehicle].perKm}/km)
                  </span>
                  <span className="font-medium text-white font-inter">{formatPKRDisplay(fareBreakdown.distanceCharge)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/70 font-inter">
                    Time charge ({duration}min × PKR {vehicleConfig[selectedVehicle].perMin}/min)
                  </span>
                  <span className="font-medium text-white font-inter">{formatPKRDisplay(fareBreakdown.timeCharge)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/70 font-inter">
                    Fuel cost ({(distance / vehicleConfig[selectedVehicle].fuelEfficiency).toFixed(1)}L × PKR {petrolPrice}/L)
                  </span>
                  <span className="font-medium text-white font-inter">{formatPKRDisplay(fareBreakdown.fuelCost)}</span>
                </div>
                
                <div className="border-t border-white/20 pt-2 mt-3">
                  <div className="flex justify-between">
                    <span className="text-white/70 font-inter">Subtotal</span>
                    <span className="font-medium text-white font-inter">{formatPKRDisplay(fareBreakdown.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70 font-inter">Service margin (15%)</span>
                    <span className="font-medium text-white font-inter">{formatPKRDisplay(fareBreakdown.total - fareBreakdown.subtotal)}</span>
                  </div>
                </div>
                
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white font-inter">Total Fare</span>
                    <span className="text-brand-primary font-inter">{formatPKRDisplay(fareBreakdown.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdminPanel && showAdminControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/20 bg-black/60 overflow-hidden"
          >
            <div className="p-4">
              <h4 className="font-medium text-white mb-3 font-inter">Admin Controls</h4>
              
              {/* Petrol Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-1 font-inter">
                  Petrol Price (PKR/L)
                </label>
                <input
                  type="number"
                  value={petrolPrice}
                  onChange={(e) => setPetrolPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-primary font-inter"
                  step="0.1"
                  min="0"
                />
              </div>

              {/* Vehicle Configurations */}
              {Object.entries(vehicleConfig).map(([vehicle, config]) => (
                <div key={vehicle} className="mb-4 p-3 bg-white/5 rounded border border-white/10">
                  <h5 className="font-medium text-white/90 mb-2 capitalize font-inter">
                    {vehicle} Configuration
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="block text-white/70 mb-1 font-inter">Base Fare (PKR)</label>
                      <input
                        type="number"
                        value={config.baseFare}
                        onChange={(e) => updateVehicleConfig(vehicle, 'baseFare', e.target.value)}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-brand-primary font-inter"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-1 font-inter">Per KM (PKR)</label>
                      <input
                        type="number"
                        value={config.perKm}
                        onChange={(e) => updateVehicleConfig(vehicle, 'perKm', e.target.value)}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-brand-primary font-inter"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-1 font-inter">Per Min (PKR)</label>
                      <input
                        type="number"
                        value={config.perMin}
                        onChange={(e) => updateVehicleConfig(vehicle, 'perMin', e.target.value)}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-brand-primary font-inter"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-1 font-inter">Efficiency (km/L)</label>
                      <input
                        type="number"
                        value={config.fuelEfficiency}
                        onChange={(e) => updateVehicleConfig(vehicle, 'fuelEfficiency', e.target.value)}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-brand-primary font-inter"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FareCalculator