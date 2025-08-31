import { useState, useEffect } from 'react';

export const useReverseGeocode = (coords, shouldFetch = true) => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reverse geocoding function using Nominatim
  const reverseGeocode = async (latitude, longitude, signal) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      const response = await fetch(url, {
        signal,
        headers: {
          'Accept-Language': navigator.language || 'en',
        }
      });

      if (!response.ok) throw new Error('Failed to fetch address');
      
      const data = await response.json();
      return data.display_name || 'Address information not available';
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('Geocoding error:', err);
      throw new Error('Unable to fetch address');
    }
  };

  useEffect(() => {
    // Create a new AbortController for each request
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchAddress = async () => {
      if (!coords || !coords.latitude || !coords.longitude || !shouldFetch) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch address using reverse geocoding
        const result = await reverseGeocode(coords.latitude, coords.longitude, signal);
        
        if (result && !signal.aborted) {
          setAddress(result);
        }
      } catch (err) {
        if (!signal.aborted && err.name !== 'AbortError') {
          console.error('Reverse geocode error:', err);
          setError(err);
          setAddress(null);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Debounce the fetchAddress call to prevent excessive requests
    const timeoutId = setTimeout(() => {
      fetchAddress();
    }, 300);

    // Cleanup function to cancel the timeout and abort the request
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [coords, shouldFetch]);

  return { address, loading, error };
};