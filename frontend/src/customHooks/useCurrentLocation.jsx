/**
 * useCurrentLocation.jsx - Geolocation Hook with LocationIQ Integration
 * 
 * A comprehensive React hook for handling user location detection with automatic
 * reverse geocoding using the LocationIQ API. Provides real-time location tracking,
 * permission management, and robust error handling for the Sawari ride-hailing platform.
 * 
 * Key Features:
 * - GPS location detection with high accuracy
 * - Automatic reverse geocoding to human-readable addresses
 * - Real-time location watching with position updates
 * - Permission state management (granted/denied/prompt)
 * - Retry logic with exponential backoff for API failures
 * - Request cancellation and cleanup
 * - Pakistan-focused address formatting
 * 
 * LocationIQ Integration:
 * - Converts GPS coordinates to formatted addresses
 * - Handles rate limiting with automatic retries
 * - Provides fallback for failed geocoding requests
 * - Optimized for Pakistani locations and addresses
 * 
 * Usage:
 * ```jsx
 * const { coords, loading, error, address, getCurrentPosition } = useCurrentLocation();
 * 
 * // Get current position once
 * await getCurrentPosition();
 * 
 * // Start continuous watching
 * startWatching();
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for geolocation with reverse geocoding
 * 
 * @param {Object} options - Geolocation API options (enableHighAccuracy, timeout, etc.)
 * @returns {Object} Location state and control functions
 */
const useCurrentLocation = (options = {}) => {
  // Location state management
  const [coords, setCoords] = useState({ lat: null, lon: null }); // GPS coordinates
  const [loading, setLoading] = useState(false); // Loading state for location requests
  const [error, setError] = useState(null); // Error messages from geolocation or API
  const [address, setAddress] = useState(null); // Reverse geocoded address object
  const [userCity, setUserCity] = useState(null); // Extracted city name for search scoping
  const [permission, setPermission] = useState('prompt'); // Permission status: 'granted', 'denied', 'prompt'
  
  // Refs for managing geolocation watching and API requests
  const watchIdRef = useRef(null); // Geolocation watch ID for cleanup
  const isWatchingRef = useRef(false); // Track if currently watching position
  const abortControllerRef = useRef(null); // For cancelling ongoing API requests
  
  // LocationIQ API configuration for reverse geocoding
  const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  const MAX_RETRIES = 3; // Maximum retry attempts for failed API calls
  const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff delays in milliseconds

  /**
   * Reverse Geocoding Function
   * 
   * Converts GPS coordinates to human-readable addresses using LocationIQ API.
   * Includes retry logic with exponential backoff for handling rate limits and
   * temporary API failures. Optimized for Pakistani addresses.
   * 
   * @param {number} lat - Latitude coordinate
   * @param {number} lon - Longitude coordinate
   * @param {number} retryCount - Current retry attempt (for internal use)
   * @returns {Promise<Object|null>} Formatted address object or null if failed
   */
  const reverseGeocode = useCallback(async (lat, lon, retryCount = 0) => {
    if (!API_KEY) {
      console.warn('LocationIQ API key not configured, skipping reverse geocoding');
      return null;
    }

    // Validate coordinates before making API call
    if (!lat || !lon || lat === null || lon === null) {
      console.warn('Invalid coordinates provided to reverseGeocode:', { lat, lon });
      return null;
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const url = `https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${lat}&lon=${lon}&format=json&addressdetails=1&normalizeaddress=1&accept-language=en`;
      
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Sawari.pro/1.0'
        }
      });

      if (response.status === 429 && retryCount < MAX_RETRIES) {
        // Rate limit exceeded, retry with exponential backoff
        const delay = RETRY_DELAYS[retryCount];
        await new Promise(resolve => setTimeout(resolve, delay));
        return reverseGeocode(lat, lon, retryCount + 1);
      }

      if (!response.ok) {
        throw new Error(`LocationIQ API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract city with fallback priority: city → town → village → county → state
      const extractedCity = data.address?.city || 
                           data.address?.town || 
                           data.address?.village || 
                           data.address?.county || 
                           data.address?.state || '';

      // Parse LocationIQ response to standardized address format
      const parsedAddress = {
        label: data.display_name || 'Address not available', // Full formatted address
        city: extractedCity, // Extracted city name with fallbacks
        state: data.address?.state || '', // State/province
        country: data.address?.country || '', // Country name
        postcode: data.address?.postcode || '', // Postal code
        raw: data // Original API response for debugging
      };

      return parsedAddress;
    } catch (error) {
      if (error.name === 'AbortError') {
        return null; // Request was cancelled
      }
      
      console.warn('Reverse geocoding failed:', error);
      
      // Fallback to coordinate display when geocoding fails
      return {
        label: `Location (${lat?.toFixed(6) || 'N/A'}, ${lon?.toFixed(6) || 'N/A'})`,
        city: '',
        state: '',
        country: '',
        postcode: '',
        error: error.message
      };
    }
  }, [API_KEY]);

  /**
   * Geolocation Success Handler
   * 
   * Processes successful geolocation results, updates coordinates state,
   * and triggers reverse geocoding to get human-readable address.
   * 
   * @param {GeolocationPosition} position - Browser geolocation position object
   */
  const handleSuccess = useCallback(async (position) => {
    const { latitude, longitude } = position.coords;
    setCoords({ lat: latitude, lon: longitude });
    setError(null);
    setPermission('granted');
    
    // Perform reverse geocoding to get readable address
    try {
      const addressResult = await reverseGeocode(latitude, longitude);
      setAddress(addressResult);
      
      // Extract and cache user city for search scoping
      if (addressResult?.city) {
        setUserCity(addressResult.city);
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      // Provide fallback address with coordinates
      setAddress({
        label: `GPS Location (${latitude?.toFixed(6) || 'N/A'}, ${longitude?.toFixed(6) || 'N/A'})`,
        city: '',
        state: '',
        country: '',
        postcode: '',
        error: 'Address lookup failed'
      });
      setUserCity(null);
    } finally {
      setLoading(false);
    }
  }, [reverseGeocode]);

  /**
   * Geolocation Error Handler
   * 
   * Handles various geolocation errors and updates state accordingly.
   * Provides user-friendly error messages for different failure scenarios.
   * 
   * @param {GeolocationPositionError} error - Browser geolocation error object
   */
  const handleError = useCallback((error) => {
    setLoading(false);
    setCoords({ lat: null, lon: null });
    setAddress(null);
    setUserCity(null);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError('Location access denied by user');
        setPermission('denied');
        break;
      case error.POSITION_UNAVAILABLE:
        setError('Location information unavailable');
        break;
      case error.TIMEOUT:
        setError('Location request timed out');
        break;
      default:
        setError('An unknown error occurred while retrieving location');
        break;
    }
  }, []);

  /**
   * Start Continuous Location Watching
   * 
   * Begins continuous monitoring of user location with automatic updates.
   * Useful for real-time tracking during rides or when user is moving.
   * 
   * @returns {number|undefined} Watch ID for manual cleanup if needed
   */
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    // Clear any existing watch before starting new one
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLoading(true);
    setError(null);
    
    // Start watching position with high accuracy settings
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true, // Use GPS for better accuracy
        timeout: 15000, // 15 second timeout for each position request
        maximumAge: 30000, // Accept cached position up to 30 seconds old
        ...options // Allow custom options to override defaults
      }
    );

    return watchIdRef.current;
  }, [handleSuccess, handleError, options]);

  /**
   * Stop Location Watching
   * 
   * Stops continuous location monitoring and cleans up resources.
   * Should be called when location tracking is no longer needed.
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLoading(false);
  }, []);

  /**
   * Get Current Position (One-time)
   * 
   * Retrieves the user's current location once without continuous monitoring.
   * Returns a Promise that resolves with the position or rejects with an error.
   * 
   * @returns {Promise<GeolocationPosition>} Promise resolving to position object
   */
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported');
        setError(error.message);
        setLoading(false);
        reject(error);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position);
          resolve(position);
        },
        (error) => {
          handleError(error);
          reject(error);
        },
        {
          enableHighAccuracy: true, // Use GPS for best accuracy
          timeout: 10000, // 10 second timeout for single request
          maximumAge: 60000, // Accept cached position up to 1 minute old
          ...options // Allow custom options to override defaults
        }
      );
    });
  }, [handleSuccess, handleError, options]);

  /**
   * Retry Location Request
   * 
   * Manually retry getting the current position. Useful when initial
   * location request fails and user wants to try again.
   */
  const retry = useCallback(() => {
    setError(null);
    setAddress(null);
    getCurrentPosition();
  }, [getCurrentPosition]);

  /**
   * Cleanup Effect
   * 
   * Ensures proper cleanup of geolocation watching and API requests
   * when the component unmounts or hook is no longer used.
   */
  useEffect(() => {
    return () => {
      // Cancel any ongoing API requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Stop location watching
      stopWatching();
    };
  }, [stopWatching]);

  // Return hook interface with state and control functions
  return {
    coords,              // { lat: number, lon: number } - Current GPS coordinates
    loading,             // boolean - Loading state for location requests
    error,               // string|null - Error message if location request failed
    address,             // object|null - Reverse geocoded address information
    userCity,            // string|null - Extracted city name for search scoping
    permission,          // string - Permission status: 'granted', 'denied', 'prompt'
    getCurrentPosition,  // function - Get current position once
    startWatching,       // function - Start continuous location monitoring
    stopWatching,        // function - Stop location monitoring
    retry               // function - Retry failed location request
  };
};

export default useCurrentLocation;