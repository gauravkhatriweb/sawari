/**
 * useReverseGeocode.jsx - OpenStreetMap Nominatim Reverse Geocoding Hook
 * 
 * A React hook for converting GPS coordinates to human-readable addresses using
 * the OpenStreetMap Nominatim API. Provides debounced geocoding with automatic
 * request cancellation and error handling for the Sawari platform.
 * 
 * Key Features:
 * - OpenStreetMap Nominatim API integration (free alternative to LocationIQ)
 * - Debounced requests to prevent excessive API calls
 * - Automatic request cancellation for cleanup
 * - Flexible coordinate input format support
 * - Localized address results based on browser language
 * - Conditional fetching with shouldFetch parameter
 * 
 * Usage:
 * ```jsx
 * const { address, loading, error } = useReverseGeocode(
 *   { lat: 24.8607, lon: 67.0011 }, // Karachi coordinates
 *   true // shouldFetch
 * );
 * ```
 * 
 * @param {Object} coords - Coordinate object with lat/lon or latitude/longitude
 * @param {boolean} shouldFetch - Whether to perform geocoding (default: true)
 * @returns {Object} Hook state with address, loading, and error
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook for reverse geocoding using OpenStreetMap Nominatim
 * 
 * @param {Object} coords - GPS coordinates in {lat, lon} or {latitude, longitude} format
 * @param {boolean} shouldFetch - Control flag to enable/disable geocoding requests
 * @returns {Object} State object containing address, loading status, and error
 */
export const useReverseGeocode = (coords, shouldFetch = true) => {
  // State management for geocoding results
  const [address, setAddress] = useState(null); // Human-readable address string
  const [loading, setLoading] = useState(false); // Loading state for API requests
  const [error, setError] = useState(null); // Error object for failed requests

  /**
   * Reverse Geocoding Function
   * 
   * Converts GPS coordinates to address using OpenStreetMap Nominatim API.
   * Includes proper error handling and request cancellation support.
   * 
   * @param {number} latitude - GPS latitude coordinate
   * @param {number} longitude - GPS longitude coordinate
   * @param {AbortSignal} signal - AbortController signal for request cancellation
   * @returns {Promise<string>} Human-readable address string
   */
  const reverseGeocode = async (latitude, longitude, signal) => {
    try {
      // Construct Nominatim API URL with address details
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      // Make API request with localization and cancellation support
      const response = await fetch(url, {
        signal, // Enable request cancellation
        headers: {
          'Accept-Language': navigator.language || 'en', // Localize results
        }
      });

      if (!response.ok) throw new Error('Failed to fetch address');
      
      const data = await response.json();
      // Return formatted address or fallback message
      return data.display_name || 'Address information not available';
    } catch (err) {
      // Re-throw abort errors to handle cancellation properly
      if (err.name === 'AbortError') throw err;
      console.warn('Geocoding error:', err);
      throw new Error('Unable to fetch address');
    }
  };

  /**
   * Geocoding Effect
   * 
   * Handles coordinate changes and triggers geocoding requests with debouncing.
   * Automatically cancels previous requests when coordinates change.
   */
  useEffect(() => {
    // Create AbortController for request cancellation
    const controller = new AbortController();
    const signal = controller.signal;

    /**
     * Fetch Address Function
     * 
     * Internal function to perform the actual geocoding request.
     * Handles coordinate normalization and error management.
     */
    const fetchAddress = async () => {
      // Normalize coordinate format - support both naming conventions
      const latitude = coords?.latitude ?? coords?.lat;
      const longitude = coords?.longitude ?? coords?.lon;

      // Skip geocoding if coordinates are missing or fetching is disabled
      if (!latitude || !longitude || !shouldFetch) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Perform reverse geocoding API call
        const result = await reverseGeocode(latitude, longitude, signal);
        
        // Update state only if request wasn't cancelled
        if (result && !signal.aborted) {
          setAddress(result);
        }
      } catch (err) {
        // Handle errors only if request wasn't cancelled
        if (!signal.aborted && err.name !== 'AbortError') {
          console.error('Reverse geocode error:', err);
          setError(err);
          setAddress(null);
        }
      } finally {
        // Reset loading state if request wasn't cancelled
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Debounce geocoding requests to prevent API spam
    const timeoutId = setTimeout(() => {
      fetchAddress();
    }, 300); // 300ms delay

    // Cleanup: cancel timeout and abort ongoing requests
    return () => {
      clearTimeout(timeoutId); // Cancel debounce timer
      controller.abort(); // Cancel API request
    };
  }, [coords, shouldFetch]);

  // Return hook interface
  return {
    address, // string|null - Human-readable address or null
    loading, // boolean - Loading state for geocoding request
    error   // Error|null - Error object if geocoding failed
  };
};