/**
 * UserLocationFetcher.jsx - User Location Detection and Geocoding Hook
 * 
 * A comprehensive React hook for fetching user's current location using the
 * browser's Geolocation API and converting coordinates to human-readable addresses
 * via OpenStreetMap Nominatim. Designed for the Sawari ride-hailing platform.
 * 
 * Key Features:
 * - Browser Geolocation API integration with permission handling
 * - OpenStreetMap Nominatim reverse geocoding
 * - Request cancellation and timeout management
 * - Comprehensive error handling with user-friendly messages
 * - Loading states and permission status tracking
 * - Optimized for mobile and desktop compatibility
 * 
 * Usage:
 * ```jsx
 * const {
 *   coords, address, error, isLoading, permission,
 *   getLocation, cancelRequest
 * } = useUserLocationFetcher();
 * 
 * // Trigger location fetch
 * await getLocation();
 * ```
 * 
 * @returns {Object} Hook interface with location data and control functions
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for user location detection and address resolution
 * 
 * Combines browser geolocation with reverse geocoding to provide
 * complete location information for ride-hailing services.
 */
const useUserLocationFetcher = () => {
  // State management for location data
  const [coords, setCoords] = useState(null); // GPS coordinates {latitude, longitude}
  const [address, setAddress] = useState(null); // Human-readable address string
  const [error, setError] = useState(null); // Error message for failed requests
  const [source, setSource] = useState(null); // Data source identifier (e.g., 'OpenStreetMap')
  const [isLoading, setIsLoading] = useState(false); // Loading state for location requests
  const [permission, setPermission] = useState('prompt'); // Geolocation permission status

  // Ref for request cancellation
  const abortControllerRef = useRef(null); // AbortController for cancelling ongoing requests

  /**
   * Reverse Geocoding Function
   * 
   * Converts GPS coordinates to human-readable address using OpenStreetMap Nominatim.
   * Includes localization support and graceful error handling.
   * 
   * @param {number} latitude - GPS latitude coordinate
   * @param {number} longitude - GPS longitude coordinate
   * @returns {Promise<string>} Human-readable address or fallback message
   */
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      // Construct Nominatim API URL for reverse geocoding
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      // Make API request with cancellation and localization support
      const response = await fetch(url, {
        signal: abortControllerRef.current?.signal, // Enable request cancellation
        headers: {
          'Accept-Language': navigator.language || 'en', // Localize address results
        }
      });

      if (!response.ok) throw new Error('Failed to fetch address');
      
      const data = await response.json();
      // Return formatted address or fallback message
      return data.display_name || 'Address information not available';
    } catch (err) {
      console.warn('Geocoding error:', err);
      // Return graceful fallback for geocoding failures
      return 'Location detected, but address details unavailable';
    }
  };

  /**
   * Main Location Fetching Function
   * 
   * Requests user's current location using browser Geolocation API,
   * then performs reverse geocoding to get human-readable address.
   * Handles permissions, errors, and loading states comprehensively.
   * 
   * @returns {Promise<void>} Resolves when location fetch is complete
   */
  const getLocation = useCallback(async () => {
    // Reset all state for fresh location request
    setError(null);
    setIsLoading(true);
    setCoords(null);
    setAddress(null);
    setSource(null);

    // Initialize request cancellation controller
    abortControllerRef.current = new AbortController();

    try {
      // Verify browser geolocation support
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request current position with optimized settings
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000, // 10 second timeout
          maximumAge: 300000, // Accept 5-minute cached position
          enableHighAccuracy: false // Prioritize speed over precision
        });
      });

      // Extract coordinates from geolocation result
      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });

      // Perform reverse geocoding (non-blocking on errors)
      const addressResult = await getAddressFromCoords(latitude, longitude);
      setAddress(addressResult);
      setSource('OpenStreetMap'); // Mark data source

      setPermission('granted'); // Update permission status
    } catch (err) {
      // Skip error handling for cancelled requests
      if (err.name === 'AbortError') return;
      
      console.error('Location error:', err);
      
      // Provide user-friendly error messages based on error type
      if (err.code === 1) { // PERMISSION_DENIED
        setError('Location access was denied. Please enable location permissions in your browser settings.');
        setPermission('denied');
      } else if (err.code === 2) { // POSITION_UNAVAILABLE
        setError('Cannot access location services. Please check your device settings and ensure location services are enabled.');
      } else if (err.code === 3) { // TIMEOUT
        setError('Location request timed out. Please check your internet connection and try again.');
      } else {
        setError('Unable to determine your location. Please try again later.');
      }
    } finally {
      // Reset loading state regardless of success/failure
      setIsLoading(false);
    }
  }, []);

  /**
   * Request Cancellation Function
   * 
   * Cancels any ongoing location or geocoding requests.
   * Useful for component cleanup or user-initiated cancellation.
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Cancel ongoing requests
    }
    setIsLoading(false); // Reset loading state
  }, []);

  // Return hook interface
  return {
    coords, // Object|null - GPS coordinates {latitude, longitude}
    address, // string|null - Human-readable address
    error, // string|null - Error message for failed requests
    source, // string|null - Data source identifier (e.g., 'OpenStreetMap')
    isLoading, // boolean - Loading state for location requests
    permission, // string - Geolocation permission status ('prompt'|'granted'|'denied')
    getLocation, // Function - Trigger location fetch
    cancelRequest // Function - Cancel ongoing requests
  };
};

export default useUserLocationFetcher;