/**
 * locationiq.js - LocationIQ API Service for Route Calculation
 * 
 * A comprehensive service for calculating route distances, durations, and directions
 * using the LocationIQ Directions API. Provides intelligent fallback mechanisms,
 * caching, and Pakistan-specific geographic restrictions for the Sawari platform.
 * 
 * Key Features:
 * - LocationIQ Directions API integration with multiple vehicle types
 * - Intelligent caching system with automatic cleanup
 * - Haversine distance calculation as fallback
 * - Pakistan geographic boundary validation
 * - Request deduplication and retry mechanisms
 * - Comprehensive error handling with user-friendly messages
 * - Batch processing for multiple destinations
 * - Performance optimizations with request timeouts
 * 
 * Supported Vehicle Types:
 * - driving: Car/taxi routes with traffic considerations
 * - cycling: Bicycle-friendly routes
 * - walking: Pedestrian routes
 * 
 * Usage:
 * ```javascript
 * import { getRouteDistance, isLocationInPakistan } from './locationiq.js';
 * 
 * // Calculate route distance
 * const route = await getRouteDistance(
 *   { lat: 24.8607, lon: 67.0011 }, // Karachi
 *   { lat: 31.5204, lon: 74.3587 }  // Lahore
 * );
 * 
 * console.log(`Distance: ${route.distance} km, Duration: ${route.duration} min`);
 * ```
 */

/**
 * Haversine Distance Calculation
 * 
 * Calculates the great-circle distance between two points on Earth using
 * the Haversine formula. Used as a fallback when LocationIQ API is unavailable.
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lon1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lon2 - Longitude of second point in decimal degrees
 * @returns {number} Distance in kilometers
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  
  // Convert latitude and longitude differences to radians
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  // Haversine formula calculation
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

// LocationIQ API Configuration
const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY // API key from environment
const BASE_URL = 'https://us1.locationiq.com/v1' // LocationIQ API base URL
const MAX_RETRIES = 3 // Maximum retry attempts for failed requests
const RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff delays in milliseconds
const REQUEST_TIMEOUT = 10000 // Request timeout in milliseconds (10 seconds)

// Caching System Configuration
const routeCache = new Map() // In-memory cache for route calculations
const CACHE_DURATION = 5 * 60 * 1000 // Cache expiration time (5 minutes)
const MAX_CACHE_SIZE = 100 // Maximum number of cached entries

// Request Deduplication System
const pendingRequests = new Map() // Track pending requests to prevent duplicates

/**
 * Coordinate Validation Function
 * 
 * Validates that latitude and longitude values are valid numbers
 * within the acceptable range for geographic coordinates.
 * 
 * @param {number} lat - Latitude value to validate
 * @param {number} lon - Longitude value to validate
 * @returns {boolean} True if coordinates are valid, false otherwise
 */
const validateCoordinates = (lat, lon) => {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' && 
    !isNaN(lat) && 
    !isNaN(lon) &&
    lat >= -90 && lat <= 90 &&     // Valid latitude range
    lon >= -180 && lon <= 180      // Valid longitude range
  )
}

/**
 * Pakistan Geographic Boundary Validation
 * 
 * Checks if given coordinates fall within Pakistan's approximate
 * geographic boundaries. Used to restrict service to Pakistan only.
 * 
 * @param {number} lat - Latitude coordinate to check
 * @param {number} lon - Longitude coordinate to check
 * @returns {boolean} True if coordinates are within Pakistan bounds
 */
const isWithinPakistan = (lat, lon) => {
  // Pakistan approximate geographic boundaries
  const PAKISTAN_BOUNDS = {
    north: 37.1,  // Northern border (near Afghanistan/China)
    south: 23.6,  // Southern border (Arabian Sea)
    east: 77.8,   // Eastern border (near India)
    west: 60.9    // Western border (near Iran/Afghanistan)
  }
  
  return (
    lat >= PAKISTAN_BOUNDS.south &&
    lat <= PAKISTAN_BOUNDS.north &&
    lon >= PAKISTAN_BOUNDS.west &&
    lon <= PAKISTAN_BOUNDS.east
  )
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function
 */
const retryWithBackoff = async (fn, maxRetries = 2, baseDelay = 1000) => {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain errors
      if (error.name === 'AbortError' || 
          error.message?.includes('401') || 
          error.message?.includes('403') ||
          error.message?.includes('Invalid response')) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms delay`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Generate cache key for route requests
 * @param {Object} pickup - Pickup coordinates
 * @param {Object} drop - Drop coordinates
 * @param {string} vehicle - Vehicle type
 * @returns {string} Cache key
 */
const generateCacheKey = (pickup, drop, vehicle = 'driving') => {
  const p1 = `${pickup.lat.toFixed(4)},${pickup.lon.toFixed(4)}`
  const p2 = `${drop.lat.toFixed(4)},${drop.lon.toFixed(4)}`
  return `${vehicle}:${p1}-${p2}`
}

/**
 * Clean expired cache entries
 */
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, entry] of routeCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      routeCache.delete(key)
    }
  }
  
  // Limit cache size
  if (routeCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(routeCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE)
    toDelete.forEach(([key]) => routeCache.delete(key))
  }
}

/**
 * Get route distance and duration using LocationIQ Directions API
 * @param {Object} pickup - Pickup coordinates {lat, lon}
 * @param {Object} drop - Drop coordinates {lat, lon}
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Route information with distance, duration, and fallback status
 */
export const getRouteDistance = async (pickup, drop, options = {}) => {
  const {
    vehicle = 'driving', // driving, walking, cycling
    retryCount = 0,
    abortSignal = null
  } = options

  // Validate input coordinates
  if (!validateCoordinates(pickup.lat, pickup.lon)) {
    throw new Error('Invalid pickup coordinates')
  }
  
  if (!validateCoordinates(drop.lat, drop.lon)) {
    throw new Error('Invalid drop coordinates')
  }

  // Check if both locations are within Pakistan
  if (!isWithinPakistan(pickup.lat, pickup.lon) || !isWithinPakistan(drop.lat, drop.lon)) {
    throw new Error('Service only available within Pakistan')
  }

  // Generate cache key
  const cacheKey = generateCacheKey(pickup, drop, vehicle)
  
  // Clean expired cache entries periodically
  cleanExpiredCache()
  
  // Check cache first
  const cachedResult = routeCache.get(cacheKey)
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
    console.log('Returning cached route result')
    return { ...cachedResult.data, cached: true }
  }
  
  // Check for pending request to avoid duplicate API calls
  if (pendingRequests.has(cacheKey)) {
    console.log('Waiting for pending request')
    return await pendingRequests.get(cacheKey)
  }

  // Calculate haversine distance as fallback
  const haversineDistance = calculateHaversineDistance(
    pickup.lat, pickup.lon, drop.lat, drop.lon
  )

  // If no API key, return haversine calculation
  if (!API_KEY) {
    console.warn('LocationIQ API key not configured, using haversine distance')
    const fallbackResult = {
      distance: Math.round(haversineDistance * 100) / 100, // Round to 2 decimal places
      duration: Math.round((haversineDistance / 25) * 60), // Assume 25 km/h average speed
      polyline: null,
      steps: [],
      fallback: true,
      method: 'haversine',
      success: false
    }
    
    // Cache the fallback result
    routeCache.set(cacheKey, {
      data: fallbackResult,
      timestamp: Date.now()
    })
    
    return fallbackResult
  }

  // Create a promise for this request and store it to prevent duplicates
  const requestPromise = (async () => {
    try {
      // Use retry mechanism for API call
      const data = await retryWithBackoff(async () => {
        // Build directions API URL using the exact format specified
        const coordinates = `${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}`
        const params = new URLSearchParams({
          key: API_KEY,
          steps: 'true',
          alternatives: 'true',
          geometries: 'polyline',
          overview: 'full'
        })

        const url = `${BASE_URL}/directions/${vehicle}/${coordinates}?${params}`

        // Create request with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
        
        try {
          // Use provided abort signal if available
          if (abortSignal) {
            abortSignal.addEventListener('abort', () => controller.abort())
          }

          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Sawari.pro/1.0'
            }
          })

          if (!response.ok) {
            throw new Error(`LocationIQ Directions API error: ${response.status} ${response.statusText}`)
          }

          return await response.json()
        } finally {
          clearTimeout(timeoutId)
        }
      }, 2, 1000) // Max 2 retries with 1 second base delay

      // Validate response structure
      if (!data.routes || !data.routes[0]) {
        throw new Error('Invalid response from LocationIQ Directions API')
      }

      const route = data.routes[0]
      const distanceKm = route.distance / 1000 // Convert meters to kilometers
      const durationMin = route.duration / 60 // Convert seconds to minutes

      const apiResult = {
        distance: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
        duration: Math.round(durationMin),
        polyline: route.geometry, // Polyline string for map display
        steps: route.legs?.[0]?.steps || [], // Step-by-step navigation
        fallback: false,
        method: 'locationiq_directions',
        success: true,
        raw: data // Keep raw response for debugging
      }

      // Cache the successful result
      routeCache.set(cacheKey, {
        data: apiResult,
        timestamp: Date.now()
      })

      return apiResult
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey)
    }
  })()
  
  // Store the promise to prevent duplicate requests
  pendingRequests.set(cacheKey, requestPromise)
  
  try {
    return await requestPromise

  } catch (error) {
    // Handle abort errors
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled')
    }

    // Enhanced error categorization
    let errorType = 'unknown'
    let userMessage = 'Unable to calculate route'
    
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      errorType = 'rate_limit'
      userMessage = 'Too many requests. Please wait a moment and try again.'
    } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      errorType = 'network'
      userMessage = 'Network connection issue. Using estimated distance.'
    } else if (error.message?.includes('timeout')) {
      errorType = 'timeout'
      userMessage = 'Request timed out. Using estimated distance.'
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      errorType = 'auth'
      userMessage = 'Service temporarily unavailable. Using estimated distance.'
    } else if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
      errorType = 'server'
      userMessage = 'Service temporarily down. Using estimated distance.'
    }

    console.warn(`LocationIQ Directions API failed (${errorType}), falling back to haversine:`, error.message)

    // Return enhanced haversine calculation as fallback
    const fallbackResult = {
      distance: Math.round(haversineDistance * 100) / 100,
      duration: Math.round((haversineDistance / 25) * 60), // Assume 25 km/h average speed
      polyline: null,
      steps: [],
      fallback: true,
      method: 'haversine_fallback',
      success: false,
      error: error.message,
      errorType,
      userMessage,
      timestamp: new Date().toISOString()
    }
    
    // Cache the fallback result for non-cancelled requests
    if (errorType !== 'cancelled') {
      routeCache.set(cacheKey, {
        data: fallbackResult,
        timestamp: Date.now()
      })
    }
    
    return fallbackResult
  }
}

/**
 * Get multiple route options (if available)
 * @param {Object} pickup - Pickup coordinates
 * @param {Object} drop - Drop coordinates
 * @param {Array} vehicles - Array of vehicle types ['driving', 'cycling']
 * @returns {Promise<Object>} Routes for different vehicle types
 */
export const getMultipleRoutes = async (pickup, drop, vehicles = ['driving']) => {
  const routes = {}
  const errors = {}

  // Get routes for each vehicle type
  const promises = vehicles.map(async (vehicle) => {
    try {
      const route = await getRouteDistance(pickup, drop, { vehicle })
      routes[vehicle] = route
    } catch (error) {
      errors[vehicle] = error.message
    }
  })

  await Promise.allSettled(promises)

  return {
    routes,
    errors: Object.keys(errors).length > 0 ? errors : null
  }
}

/**
 * Batch distance calculation for multiple destinations
 * @param {Object} pickup - Pickup coordinates
 * @param {Array} destinations - Array of destination coordinates
 * @returns {Promise<Array>} Array of route information
 */
export const getBatchDistances = async (pickup, destinations) => {
  const results = []
  
  for (const destination of destinations) {
    try {
      const route = await getRouteDistance(pickup, destination)
      results.push({
        destination,
        ...route,
        success: true
      })
    } catch (error) {
      results.push({
        destination,
        error: error.message,
        success: false
      })
    }
  }
  
  return results
}

/**
 * Estimate travel time based on distance and vehicle type
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} vehicle - Vehicle type
 * @returns {number} Estimated duration in minutes
 */
export const estimateTravelTime = (distanceKm, vehicle = 'driving') => {
  const avgSpeeds = {
    driving: 25, // km/h in city traffic
    cycling: 15,
    walking: 5
  }
  
  const speed = avgSpeeds[vehicle] || avgSpeeds.driving
  return Math.round((distanceKm / speed) * 60)
}

/**
 * Check if LocationIQ service is available
 * @returns {boolean} Service availability status
 */
export const isLocationIQAvailable = () => {
  return Boolean(API_KEY)
}

/**
 * Get service status and configuration
 * @returns {Object} Service status information
 */
export const getServiceStatus = () => {
  return {
    apiKeyConfigured: Boolean(API_KEY),
    baseUrl: BASE_URL,
    maxRetries: MAX_RETRIES,
    requestTimeout: REQUEST_TIMEOUT,
    supportedVehicles: ['driving', 'cycling', 'walking']
  }
}

export {
  isWithinPakistan as isLocationInPakistan,
  calculateHaversineDistance
}