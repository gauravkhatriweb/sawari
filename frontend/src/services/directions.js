/**
 * directions.js - LocationIQ Directions API Service
 * 
 * Comprehensive service for fetching driving directions with multiple route alternatives.
 * Handles polyline decoding, route caching, error handling, and graceful fallbacks.
 * 
 * Key Features:
 * - LocationIQ Directions API integration with alternatives
 * - Polyline encoding/decoding for route geometry
 * - In-memory caching with automatic cleanup
 * - Exponential backoff retry mechanism
 * - Request deduplication and AbortController support
 * - Graceful fallback to Haversine distance calculation
 * - Pakistan geographic boundary validation
 * 
 * Usage:
 * ```javascript
 * import { getDirections, clearDirectionsCache } from './directions.js';
 * 
 * const routes = await getDirections(
 *   { lat: 24.8607, lon: 67.0011 }, // Pickup
 *   { lat: 24.9056, lon: 67.0822 }  // Drop
 * );
 * 
 * console.log(`Found ${routes.length} route options`);
 * ```
 */

import { calculateHaversineDistance, isLocationInPakistan } from './locationiq.js';

// API Configuration
const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const BASE_URL = 'https://us1.locationiq.com/v1';
const REQUEST_TIMEOUT = 15000; // 15 seconds for directions API
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000]; // Exponential backoff

// Caching Configuration
const directionsCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for directions
const MAX_CACHE_SIZE = 50;

// Request Deduplication
const pendingDirectionsRequests = new Map();

/**
 * Polyline Decoder
 * Decodes Google's polyline encoding format to lat/lng coordinates
 * 
 * @param {string} encoded - Encoded polyline string
 * @returns {Array<Array<number>>} Array of [lat, lng] coordinate pairs
 */
export const decodePolyline = (encoded) => {
  if (!encoded || typeof encoded !== 'string') {
    return [];
  }

  const points = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    
    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    // Decode longitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};

/**
 * Validate coordinates for directions API
 * @param {Object} coords - Coordinate object with lat and lon
 * @returns {boolean} True if valid
 */
const validateCoordinates = (coords) => {
  return (
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lon === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lon) &&
    coords.lat >= -90 && coords.lat <= 90 &&
    coords.lon >= -180 && coords.lon <= 180
  );
};

/**
 * Generate cache key for directions requests
 * @param {Object} pickup - Pickup coordinates
 * @param {Object} drop - Drop coordinates
 * @returns {string} Cache key
 */
const generateDirectionsCacheKey = (pickup, drop) => {
  const p1 = `${pickup.lat.toFixed(4)},${pickup.lon.toFixed(4)}`;
  const p2 = `${drop.lat.toFixed(4)},${drop.lon.toFixed(4)}`;
  return `directions:${p1}-${p2}`;
};

/**
 * Clean expired cache entries
 */
const cleanExpiredDirectionsCache = () => {
  const now = Date.now();
  for (const [key, entry] of directionsCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      directionsCache.delete(key);
    }
  }
  
  // Limit cache size
  if (directionsCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(directionsCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => directionsCache.delete(key));
  }
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Result of the function
 */
const retryWithBackoff = async (fn, maxRetries = MAX_RETRIES) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.name === 'AbortError' || 
          error.message?.includes('401') || 
          error.message?.includes('403') ||
          error.message?.includes('Invalid API key')) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      console.log(`Directions API retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms delay`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Create fallback route using Haversine distance
 * @param {Object} pickup - Pickup coordinates
 * @param {Object} drop - Drop coordinates
 * @returns {Object} Fallback route object
 */
const createFallbackRoute = (pickup, drop) => {
  const distance = calculateHaversineDistance(pickup.lat, pickup.lon, drop.lat, drop.lon);
  const duration = Math.round((distance / 25) * 60); // Assume 25 km/h average speed
  
  return {
    id: 'fallback',
    geometry: [[pickup.lat, pickup.lon], [drop.lat, drop.lon]], // Straight line
    distance: Math.round(distance * 1000), // Convert to meters
    duration: duration * 60, // Convert to seconds
    summary: `Estimated ${distance.toFixed(1)} km`,
    isFallback: true,
    legs: [{
      steps: [{
        instruction: `Head towards destination (${distance.toFixed(1)} km estimated)`,
        distance: Math.round(distance * 1000),
        duration: duration * 60
      }]
    }]
  };
};

/**
 * Fetch directions from LocationIQ Directions API
 * 
 * @param {Object} pickup - Pickup coordinates {lat, lon}
 * @param {Object} drop - Drop coordinates {lat, lon}
 * @param {Object} options - Additional options
 * @param {AbortSignal} options.signal - AbortController signal
 * @param {boolean} options.alternatives - Whether to fetch alternative routes
 * @returns {Promise<Array>} Array of route objects
 */
export const getDirections = async (pickup, drop, options = {}) => {
  // Validate inputs
  if (!validateCoordinates(pickup) || !validateCoordinates(drop)) {
    throw new Error('Invalid pickup or drop coordinates');
  }

  // Check if locations are in Pakistan
  if (!isLocationInPakistan(pickup.lat, pickup.lon) || !isLocationInPakistan(drop.lat, drop.lon)) {
    console.warn('One or both locations are outside Pakistan, using fallback route');
    return [createFallbackRoute(pickup, drop)];
  }

  // Check API key
  if (!API_KEY) {
    console.warn('LocationIQ API key not configured, using fallback route');
    return [createFallbackRoute(pickup, drop)];
  }

  const { signal, alternatives = true } = options;
  const cacheKey = generateDirectionsCacheKey(pickup, drop);
  
  // Check cache first
  cleanExpiredDirectionsCache();
  const cached = directionsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached directions');
    return cached.data;
  }

  // Check for pending request to avoid duplicates
  if (pendingDirectionsRequests.has(cacheKey)) {
    console.log('Waiting for pending directions request');
    return await pendingDirectionsRequests.get(cacheKey);
  }

  // Create the request promise
  const requestPromise = retryWithBackoff(async () => {
    // Build API URL - note the coordinate order: longitude,latitude
    const url = `${BASE_URL}/directions/driving/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}`;
    
    const params = new URLSearchParams({
      key: API_KEY,
      steps: 'true',
      alternatives: alternatives ? '3' : '0', // Get up to 3 alternatives
      geometries: 'polyline',
      overview: 'full',
      continue_straight: 'default'
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      signal,
      headers: {
        'User-Agent': 'Sawari App (sawari.pk)',
        'Referer': window.location.origin,
      },
      timeout: REQUEST_TIMEOUT
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No route found between the selected locations');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key or access denied');
      } else {
        throw new Error(`Directions API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error('No routes found in API response');
    }

    // Process routes
    const processedRoutes = data.routes.map((route, index) => {
      const geometry = route.geometry ? decodePolyline(route.geometry) : [];
      
      return {
        id: `route-${index}`,
        geometry,
        distance: route.distance || 0, // Distance in meters
        duration: route.duration || 0, // Duration in seconds
        summary: route.legs?.[0]?.summary || `Route ${index + 1}`,
        legs: route.legs || [],
        isFallback: false
      };
    });

    // Validate that we have at least one valid route
    const validRoutes = processedRoutes.filter(route => 
      route.geometry && route.geometry.length > 0 && route.distance > 0
    );

    if (validRoutes.length === 0) {
      throw new Error('No valid routes found in API response');
    }

    return validRoutes;
  });

  // Store pending request
  pendingDirectionsRequests.set(cacheKey, requestPromise);

  try {
    const routes = await requestPromise;
    
    // Cache the result
    directionsCache.set(cacheKey, {
      data: routes,
      timestamp: Date.now()
    });

    return routes;
  } catch (error) {
    console.error('Directions API error:', error);
    
    // Return fallback route on error
    const fallbackRoute = createFallbackRoute(pickup, drop);
    console.log('Using fallback route due to API error');
    
    return [fallbackRoute];
  } finally {
    // Clean up pending request
    pendingDirectionsRequests.delete(cacheKey);
  }
};

/**
 * Clear directions cache
 * Useful for testing or when user wants fresh data
 */
export const clearDirectionsCache = () => {
  directionsCache.clear();
  console.log('Directions cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getDirectionsCacheStats = () => {
  return {
    size: directionsCache.size,
    maxSize: MAX_CACHE_SIZE,
    cacheDuration: CACHE_DURATION,
    pendingRequests: pendingDirectionsRequests.size
  };
};

/**
 * Check if directions service is available
 * @returns {boolean} True if service is available
 */
export const isDirectionsServiceAvailable = () => {
  return Boolean(API_KEY);
};

/**
 * Format route duration for display
 * @param {number} durationSeconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatRouteDuration = (durationSeconds) => {
  if (!durationSeconds || durationSeconds < 0) return '0 min';
  
  const minutes = Math.round(durationSeconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Format route distance for display
 * @param {number} distanceMeters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatRouteDistance = (distanceMeters) => {
  if (!distanceMeters || distanceMeters < 0) return '0 km';
  
  const kilometers = distanceMeters / 1000;
  
  if (kilometers < 1) {
    return `${Math.round(distanceMeters)} m`;
  }
  
  return `${kilometers.toFixed(1)} km`;
};

export default {
  getDirections,
  clearDirectionsCache,
  getDirectionsCacheStats,
  isDirectionsServiceAvailable,
  formatRouteDuration,
  formatRouteDistance,
  decodePolyline
};