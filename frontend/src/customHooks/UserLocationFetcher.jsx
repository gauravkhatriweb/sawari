import { useState, useCallback, useRef } from 'react';

const useUserLocationFetcher = () => {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState('prompt');

  const abortControllerRef = useRef(null);

  // Get address from coordinates using Nominatim
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      const response = await fetch(url, {
        signal: abortControllerRef.current?.signal,
        headers: {
          'Accept-Language': navigator.language || 'en',
        }
      });

      if (!response.ok) throw new Error('Failed to fetch address');
      
      const data = await response.json();
      return data.display_name || 'Address information not available';
    } catch (err) {
      console.warn('Geocoding error:', err);
      return 'Location detected, but address details unavailable';
    }
  };

  // Main function to get user location
  const getLocation = useCallback(async () => {
    // Reset state
    setError(null);
    setIsLoading(true);
    setCoords(null);
    setAddress(null);
    setSource(null);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Get current position with a simpler approach
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 300000,
          enableHighAccuracy: false // Set to false for better compatibility
        });
      });

      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });

      // Try to get address (but don't block on errors)
      const addressResult = await getAddressFromCoords(latitude, longitude);
      setAddress(addressResult);
      setSource('OpenStreetMap');

      setPermission('granted');
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      console.error('Location error:', err);
      
      // Handle specific error cases with simpler messages
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
      setIsLoading(false);
    }
  }, []);

  // Cancel any ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  return {
    coords,
    address,
    error,
    source,
    isLoading,
    permission,
    getLocation,
    cancelRequest
  };
};

export default useUserLocationFetcher;