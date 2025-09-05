/**
 * Robust Fare Calculator utility for Sawari.pro
 * Calculates fares based on distance, vehicle type, fuel efficiency, and current fuel prices
 */

import { formatPKRDisplay } from './currency'

// Default fuel price in PKR per liter (can be updated dynamically)
const DEFAULT_FUEL_PRICE = 280

// Vehicle configurations with fuel efficiency and pricing
const VEHICLE_CONFIGS = {
  bike: {
    name: 'Bike',
    icon: '🏍️',
    baseFare: 80,
    perKmRate: 15,
    perMinRate: 3,
    fuelEfficiency: 45, // km per liter
    avgSpeed: 25, // km/h in city traffic
    capacity: 1,
    color: '#F59E0B',
    femaleAllowed: true,
    description: 'Fast and economical for single passengers'
  },
  auto: {
    name: 'Auto',
    icon: '🛺',
    baseFare: 100,
    perKmRate: 18,
    perMinRate: 4,
    fuelEfficiency: 18, // km per liter
    avgSpeed: 20, // km/h in city traffic
    capacity: 3,
    color: '#10B981',
    femaleAllowed: true,
    description: 'Good balance of comfort and affordability'
  },
  car: {
    name: 'Car',
    icon: '🚗',
    baseFare: 150,
    perKmRate: 25,
    perMinRate: 5,
    fuelEfficiency: 12, // km per liter
    avgSpeed: 30, // km/h in city traffic
    capacity: 4,
    color: '#3B82F6',
    femaleAllowed: true,
    description: 'Maximum comfort and space for families'
  }
}

// Pricing factors and margins
const PRICING_CONFIG = {
  operationalMargin: 1.15, // 15% operational margin
  peakHourMultiplier: 1.2, // 20% surge during peak hours
  nightChargeMultiplier: 1.1, // 10% night charge (10 PM - 6 AM)
  minimumFare: 50, // Minimum fare in PKR
  maximumFare: 5000, // Maximum fare in PKR for safety
  distanceThreshold: 0.5, // Minimum billable distance in km
  timeThreshold: 2 // Minimum billable time in minutes
}

// Peak hours definition (24-hour format)
const PEAK_HOURS = [
  { start: 7, end: 10 }, // Morning rush
  { start: 17, end: 20 } // Evening rush
]

/**
 * Check if current time is during peak hours
 * @param {Date} date - Date object (defaults to current time)
 * @returns {boolean} Whether it's peak hour
 */
const isPeakHour = (date = new Date()) => {
  const hour = date.getHours()
  return PEAK_HOURS.some(peak => hour >= peak.start && hour < peak.end)
}

/**
 * Check if current time is during night hours
 * @param {Date} date - Date object (defaults to current time)
 * @returns {boolean} Whether it's night time
 */
const isNightTime = (date = new Date()) => {
  const hour = date.getHours()
  return hour >= 22 || hour < 6 // 10 PM to 6 AM
}

/**
 * Calculate fuel cost based on distance and vehicle efficiency
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} vehicleType - Vehicle type (bike, auto, car)
 * @param {number} fuelPrice - Current fuel price per liter
 * @returns {number} Fuel cost in PKR
 */
const calculateFuelCost = (distanceKm, vehicleType, fuelPrice = DEFAULT_FUEL_PRICE) => {
  const config = VEHICLE_CONFIGS[vehicleType]
  if (!config) {
    console.warn(`Unknown vehicle type: ${vehicleType}, using bike config`)
    return calculateFuelCost(distanceKm, 'bike', fuelPrice)
  }

  const fuelConsumed = distanceKm / config.fuelEfficiency // liters
  return fuelConsumed * fuelPrice
}

/**
 * Calculate estimated travel time
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} vehicleType - Vehicle type
 * @returns {number} Estimated time in minutes
 */
const calculateTravelTime = (distanceKm, vehicleType) => {
  const config = VEHICLE_CONFIGS[vehicleType]
  if (!config) {
    return Math.round((distanceKm / 25) * 60) // Default 25 km/h
  }
  
  return Math.round((distanceKm / config.avgSpeed) * 60)
}

/**
 * Calculate fare for a specific vehicle type
 * @param {Object} params - Calculation parameters
 * @param {number} params.distanceKm - Distance in kilometers
 * @param {number} params.durationMin - Duration in minutes (optional, will be calculated if not provided)
 * @param {string} params.vehicleType - Vehicle type (bike, auto, car)
 * @param {number} params.fuelPrice - Current fuel price per liter
 * @param {Date} params.tripTime - Trip time for surge pricing
 * @param {boolean} params.includeSurge - Whether to include surge pricing
 * @returns {Object} Detailed fare breakdown
 */
export const calculateFare = (params) => {
  const {
    distanceKm,
    durationMin = null,
    vehicleType = 'bike',
    fuelPrice = DEFAULT_FUEL_PRICE,
    tripTime = new Date(),
    includeSurge = true
  } = params

  // Validate inputs
  if (!distanceKm || distanceKm < 0) {
    throw new Error('Invalid distance provided')
  }

  if (!VEHICLE_CONFIGS[vehicleType]) {
    throw new Error(`Unsupported vehicle type: ${vehicleType}`)
  }

  const config = VEHICLE_CONFIGS[vehicleType]
  
  // Calculate or use provided duration
  const estimatedDuration = durationMin || calculateTravelTime(distanceKm, vehicleType)
  
  // Apply minimum thresholds
  const billableDistance = Math.max(distanceKm, PRICING_CONFIG.distanceThreshold)
  const billableTime = Math.max(estimatedDuration, PRICING_CONFIG.timeThreshold)
  
  // Base fare components
  const baseFare = config.baseFare
  const distanceCharge = billableDistance * config.perKmRate
  const timeCharge = billableTime * config.perMinRate
  const fuelCost = calculateFuelCost(billableDistance, vehicleType, fuelPrice)
  
  // Calculate subtotal
  let subtotal = baseFare + distanceCharge + timeCharge + fuelCost
  
  // Apply operational margin
  subtotal *= PRICING_CONFIG.operationalMargin
  
  // Surge pricing factors
  let surgeMultiplier = 1
  const surgeReasons = []
  
  if (includeSurge) {
    if (isPeakHour(tripTime)) {
      surgeMultiplier *= PRICING_CONFIG.peakHourMultiplier
      surgeReasons.push('Peak hour surge')
    }
    
    if (isNightTime(tripTime)) {
      surgeMultiplier *= PRICING_CONFIG.nightChargeMultiplier
      surgeReasons.push('Night charge')
    }
  }
  
  // Apply surge multiplier
  const surgeAmount = subtotal * (surgeMultiplier - 1)
  let total = subtotal * surgeMultiplier
  
  // Apply minimum and maximum fare limits
  total = Math.max(total, PRICING_CONFIG.minimumFare)
  total = Math.min(total, PRICING_CONFIG.maximumFare)
  
  // Round to nearest PKR
  const finalTotal = Math.round(total)
  
  return {
    vehicleType,
    vehicleConfig: config,
    breakdown: {
      baseFare: Math.round(baseFare),
      distanceCharge: Math.round(distanceCharge),
      timeCharge: Math.round(timeCharge),
      fuelCost: Math.round(fuelCost),
      subtotal: Math.round(subtotal),
      surgeAmount: Math.round(surgeAmount),
      total: finalTotal
    },
    details: {
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMin: Math.round(estimatedDuration),
      billableDistance: Math.round(billableDistance * 100) / 100,
      billableTime: Math.round(billableTime),
      fuelPrice,
      surgeMultiplier: Math.round(surgeMultiplier * 100) / 100,
      surgeReasons,
      isPeakHour: isPeakHour(tripTime),
      isNightTime: isNightTime(tripTime)
    },
    formatted: {
      total: formatPKRDisplay(finalTotal),
      baseFare: formatPKRDisplay(baseFare),
      distanceCharge: formatPKRDisplay(distanceCharge),
      timeCharge: formatPKRDisplay(timeCharge),
      fuelCost: formatPKRDisplay(fuelCost),
      surgeAmount: formatPKRDisplay(surgeAmount)
    }
  }
}

/**
 * Calculate fares for all vehicle types
 * @param {Object} params - Calculation parameters
 * @returns {Object} Fares for all vehicle types
 */
export const calculateAllFares = (params) => {
  const vehicleTypes = Object.keys(VEHICLE_CONFIGS)
  const fares = {}
  
  vehicleTypes.forEach(vehicleType => {
    try {
      fares[vehicleType] = calculateFare({ ...params, vehicleType })
    } catch (error) {
      console.error(`Failed to calculate fare for ${vehicleType}:`, error)
      fares[vehicleType] = {
        error: error.message,
        vehicleType,
        vehicleConfig: VEHICLE_CONFIGS[vehicleType]
      }
    }
  })
  
  return fares
}

/**
 * Get vehicle configuration
 * @param {string} vehicleType - Vehicle type
 * @returns {Object} Vehicle configuration
 */
export const getVehicleConfig = (vehicleType) => {
  return VEHICLE_CONFIGS[vehicleType] || null
}

/**
 * Get all vehicle configurations
 * @returns {Object} All vehicle configurations
 */
export const getAllVehicleConfigs = () => {
  return { ...VEHICLE_CONFIGS }
}

/**
 * Update fuel price (for admin/dynamic pricing)
 * @param {number} newPrice - New fuel price per liter
 * @returns {number} Updated fuel price
 */
export const updateFuelPrice = (newPrice) => {
  if (typeof newPrice !== 'number' || newPrice <= 0) {
    throw new Error('Invalid fuel price')
  }
  
  // In a real app, this would update a global state or database
  console.log(`Fuel price updated to PKR ${newPrice}/L`)
  return newPrice
}

/**
 * Get current pricing configuration
 * @returns {Object} Pricing configuration
 */
export const getPricingConfig = () => {
  return { ...PRICING_CONFIG }
}

/**
 * Estimate fare range for a distance
 * @param {number} distanceKm - Distance in kilometers
 * @param {Object} options - Options
 * @returns {Object} Fare range estimation
 */
export const estimateFareRange = (distanceKm, options = {}) => {
  const { fuelPrice = DEFAULT_FUEL_PRICE } = options
  
  const fares = calculateAllFares({
    distanceKm,
    fuelPrice,
    includeSurge: false // Base fare without surge
  })
  
  const totals = Object.values(fares)
    .filter(fare => !fare.error)
    .map(fare => fare.breakdown.total)
  
  if (totals.length === 0) {
    return { min: 0, max: 0, error: 'No valid fares calculated' }
  }
  
  return {
    min: Math.min(...totals),
    max: Math.max(...totals),
    fares
  }
}

/**
 * Validate fare calculation parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result
 */
export const validateFareParams = (params) => {
  const errors = []
  
  if (!params.distanceKm || params.distanceKm <= 0) {
    errors.push('Distance must be greater than 0')
  }
  
  if (params.distanceKm > 1000) {
    errors.push('Distance too large (max 1000 km)')
  }
  
  if (params.vehicleType && !VEHICLE_CONFIGS[params.vehicleType]) {
    errors.push(`Invalid vehicle type: ${params.vehicleType}`)
  }
  
  if (params.fuelPrice && (params.fuelPrice <= 0 || params.fuelPrice > 1000)) {
    errors.push('Invalid fuel price')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export default {
  calculateFare,
  calculateAllFares,
  getVehicleConfig,
  getAllVehicleConfigs,
  updateFuelPrice,
  getPricingConfig,
  estimateFareRange,
  validateFareParams,
  VEHICLE_CONFIGS,
  DEFAULT_FUEL_PRICE
}