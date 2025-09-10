/**
 * rideApi.js - Ride Booking API Service
 * 
 * A comprehensive service for handling ride booking operations with the Sawari backend.
 * Provides functions for creating rides, fetching ride history, and managing ride status.
 * Includes proper error handling, authentication, and data validation.
 * 
 * Key Features:
 * - Ride creation and booking
 * - Passenger ride history retrieval
 * - Active ride management
 * - Ride cancellation and rating
 * - Proper authentication handling
 * - Comprehensive error handling
 * - Request/response data validation
 * 
 * Usage:
 * ```javascript
 * import { createRide, getPassengerRides } from './rideApi.js';
 * 
 * // Create a new ride booking
 * const ride = await createRide({
 *   pickupLocation: { address: '...', coordinates: [lng, lat] },
 *   dropLocation: { address: '...', coordinates: [lng, lat] },
 *   fare: 268,
 *   distance: 5.2,
 *   duration: 15,
 *   paymentMethod: 'cash'
 * });
 * ```
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const RIDES_ENDPOINT = `${API_BASE_URL}/api/rides`

/**
 * Get authentication token from localStorage or cookies
 * @returns {string|null} JWT token or null if not found
 */
const getAuthToken = () => {
  // Try to get token from sawari_auth in localStorage or sessionStorage
  try {
    const authData = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      if (parsed.token) return parsed.token
    }
  } catch (error) {
    console.warn('Error parsing auth data:', error)
  }
  
  // Fallback to legacy token storage
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
  if (token) return token
  
  // Fallback to cookies if localStorage doesn't have token
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

/**
 * Create HTTP headers with authentication
 * @returns {Object} Headers object with Content-Type and Authorization
 */
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Handle API response and extract data
 * @param {Response} response - Fetch response object
 * @returns {Object} Parsed response data
 * @throws {Error} If response is not ok or contains errors
 */
const handleResponse = async (response) => {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }
  
  if (!data.success) {
    throw new Error(data.message || 'API request failed')
  }
  
  return data
}

/**
 * Validate ride data before sending to API
 * @param {Object} rideData - Ride booking data
 * @throws {Error} If validation fails
 */
const validateRideData = (rideData) => {
  const required = ['pickupLocation', 'dropLocation', 'fare', 'distance', 'duration', 'paymentMethod']
  
  for (const field of required) {
    if (!rideData[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  
  // Validate pickup location
  if (!rideData.pickupLocation.address || !rideData.pickupLocation.coordinates) {
    throw new Error('Pickup location must include address and coordinates')
  }
  
  // Validate drop location
  if (!rideData.dropLocation.address || !rideData.dropLocation.coordinates) {
    throw new Error('Drop location must include address and coordinates')
  }
  
  // Validate coordinates format
  const validateCoords = (coords, location) => {
    if (!Array.isArray(coords) || coords.length !== 2) {
      throw new Error(`${location} coordinates must be an array of [longitude, latitude]`)
    }
    if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
      throw new Error(`${location} coordinates must be numbers`)
    }
  }
  
  validateCoords(rideData.pickupLocation.coordinates, 'Pickup')
  validateCoords(rideData.dropLocation.coordinates, 'Drop')
  
  // Validate numeric fields
  if (typeof rideData.fare !== 'number' || rideData.fare <= 0) {
    throw new Error('Fare must be a positive number')
  }
  
  if (typeof rideData.distance !== 'number' || rideData.distance <= 0) {
    throw new Error('Distance must be a positive number')
  }
  
  if (typeof rideData.duration !== 'number' || rideData.duration <= 0 || !Number.isInteger(rideData.duration)) {
    throw new Error('Duration must be a positive integer')
  }
  
  // Validate payment method
  const validPaymentMethods = ['cash', 'wallet', 'card']
  if (!validPaymentMethods.includes(rideData.paymentMethod)) {
    throw new Error('Payment method must be one of: cash, wallet, card')
  }
}

/**
 * Create a new ride booking
 * @param {Object} rideData - Ride booking details
 * @param {Object} rideData.pickupLocation - Pickup location with address and coordinates
 * @param {Object} rideData.dropLocation - Drop location with address and coordinates
 * @param {number} rideData.fare - Total fare amount
 * @param {number} rideData.distance - Distance in kilometers
 * @param {number} rideData.duration - Duration in minutes
 * @param {string} rideData.paymentMethod - Payment method (cash, wallet, card)
 * @param {string} [rideData.vehicleType] - Vehicle type preference
 * @param {string} [rideData.notes] - Additional notes for the ride
 * @returns {Promise<Object>} Created ride object
 */
export const createRide = async (rideData) => {
  try {
    // Validate input data
    validateRideData(rideData)
    
    // Prepare ride data for API
    const apiData = {
      pickupLocation: {
        type: 'Point',
        coordinates: rideData.pickupLocation.coordinates,
        address: rideData.pickupLocation.address,
        city: rideData.pickupLocation.city || 'Not specified'
      },
      dropLocation: {
        type: 'Point',
        coordinates: rideData.dropLocation.coordinates,
        address: rideData.dropLocation.address,
        city: rideData.dropLocation.city || 'Not specified'
      },
      fare: rideData.fare,
      distance: rideData.distance,
      duration: rideData.duration,
      paymentMethod: rideData.paymentMethod,
      vehicleType: rideData.vehicleType || 'bike',
      notes: rideData.notes || ''
    }
    
    const response = await fetch(RIDES_ENDPOINT, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(apiData)
    })
    
    const result = await handleResponse(response)
    return result.data
    
  } catch (error) {
    console.error('Error creating ride:', error)
    throw new Error(`Failed to create ride: ${error.message}`)
  }
}

/**
 * Get passenger's ride history
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=10] - Number of rides per page
 * @param {string} [options.status] - Filter by ride status
 * @returns {Promise<Object>} Rides data with pagination info
 */
export const getPassengerRides = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams()
    
    if (options.page) queryParams.append('page', options.page)
    if (options.limit) queryParams.append('limit', options.limit)
    if (options.status) queryParams.append('status', options.status)
    
    const url = `${RIDES_ENDPOINT}/passenger${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders()
    })
    
    const result = await handleResponse(response)
    return result.data
    
  } catch (error) {
    console.error('Error fetching passenger rides:', error)
    throw new Error(`Failed to fetch rides: ${error.message}`)
  }
}

/**
 * Get passenger's active ride
 * @returns {Promise<Object|null>} Active ride object or null if no active ride
 */
export const getActivePassengerRide = async () => {
  try {
    const response = await fetch(`${RIDES_ENDPOINT}/passenger/active`, {
      method: 'GET',
      headers: createHeaders()
    })
    
    const result = await handleResponse(response)
    return result.data
    
  } catch (error) {
    console.error('Error fetching active ride:', error)
    throw new Error(`Failed to fetch active ride: ${error.message}`)
  }
}

/**
 * Get ride details by ID
 * @param {string} rideId - Ride ID
 * @returns {Promise<Object>} Ride details
 */
export const getRideById = async (rideId) => {
  try {
    if (!rideId) {
      throw new Error('Ride ID is required')
    }
    
    const response = await fetch(`${RIDES_ENDPOINT}/${rideId}`, {
      method: 'GET',
      headers: createHeaders()
    })
    
    const result = await handleResponse(response)
    return result.data
    
  } catch (error) {
    console.error('Error fetching ride details:', error)
    throw new Error(`Failed to fetch ride details: ${error.message}`)
  }
}

/**
 * Cancel a ride
 * @param {string} rideId - Ride ID to cancel
 * @param {string} [reason] - Cancellation reason
 * @returns {Promise<Object>} Updated ride object
 */
export const cancelRide = async (rideId, reason = '') => {
  try {
    if (!rideId) {
      throw new Error('Ride ID is required')
    }
    
    const response = await fetch(`${RIDES_ENDPOINT}/${rideId}/cancel`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ reason })
    })
    
    const result = await handleResponse(response)
    return result.data
    
  } catch (error) {
    console.error('Error cancelling ride:', error)
    throw new Error(`Failed to cancel ride: ${error.message}`)
  }
}

/**
 * Rate a completed ride
 * @param {string} rideId - Ride ID to rate
 * @param {number} rating - Rating from 1 to 5
 * @param {string} [comment] - Optional comment
 * @returns {Promise<Object>} Updated ride object
 */
export const rateRide = async (rideId, rating, comment = '') => {
  try {
    if (!rideId) {
      throw new Error('Ride ID is required')
    }
    
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error('Rating must be an integer between 1 and 5')
    }
    
    const response = await fetch(`${RIDES_ENDPOINT}/${rideId}/rate`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ rating, comment })
    })
    
    const result = await handleResponse(response)
    return result.data
    
  } catch (error) {
    console.error('Error rating ride:', error)
    throw new Error(`Failed to rate ride: ${error.message}`)
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!getAuthToken()
}

/**
 * Get API service status
 * @returns {Object} Service status information
 */
export const getServiceStatus = () => {
  return {
    baseUrl: API_BASE_URL,
    authenticated: isAuthenticated(),
    timestamp: new Date().toISOString()
  }
}

export default {
  createRide,
  getPassengerRides,
  getActivePassengerRide,
  getRideById,
  cancelRide,
  rateRide,
  isAuthenticated,
  getServiceStatus
}