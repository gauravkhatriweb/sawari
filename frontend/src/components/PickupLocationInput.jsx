import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cache for reverse geocoding results
const geocodeCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce hook
const useDebounce = (callback, delay) => {
  const debounceRef = useRef();

  const debouncedCallback = useCallback(
    (...args) => {
      return new Promise((resolve, reject) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(async () => {
          try {
            const result = await callback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Helper function to format address
const formatAddress = (addressData) => {
  if (!addressData) return 'Address not available';
  
  const parts = [];
  
  // Add street/road
  if (addressData.road || addressData.name) {
    parts.push(addressData.road || addressData.name);
  }
  
  // Add area/neighbourhood
  if (addressData.neighbourhood || addressData.suburb) {
    parts.push(addressData.neighbourhood || addressData.suburb);
  }
  
  // Add city
  if (addressData.city || addressData.town) {
    parts.push(addressData.city || addressData.town);
  }
  
  // Add province/state
  if (addressData.state) {
    parts.push(addressData.state);
  }
  
  return parts.filter(Boolean).join(', ') || addressData.display_name || 'Current location';
};

// Helper function to extract city from address
const extractCity = (addressData) => {
  if (!addressData) return null;
  return addressData.city || addressData.town || addressData.village || null;
};

// Helper function to check if location is in Pakistan
const isInPakistan = (addressData) => {
  if (!addressData) return false;
  const country = addressData.country?.toLowerCase();
  return country === 'pakistan' || country === 'pk';
};

const PickupLocationInput = ({
  onLocationSelect,
  onValidationError,
  className = '',
  disabled = false,
  userCity = null, // User's current city for validation
  autoFocus = false,
  // Accept location data from parent component
  coords = { lat: null, lon: null },
  locationLoading = false,
  locationError = null,
  currentAddress = null,
  getCurrentPosition // Function to get current position
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [cachedAddress, setCachedAddress] = useState(null);
  
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // LocationIQ API configuration
  const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  // Enhanced reverse geocoding with caching and debouncing
  const reverseGeocode = useCallback(async (lat, lon) => {
    if (!API_KEY) {
      console.warn('LocationIQ API key not configured');
      return null;
    }

    // Validate coordinates before making API call
    if (!lat || !lon || lat === null || lon === null) {
      console.warn('Invalid coordinates provided to reverseGeocode:', { lat, lon });
      return null;
    }

    // Check cache first
    const cacheKey = `${lat?.toFixed(6) || 'N/A'},${lon?.toFixed(6) || 'N/A'}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsReverseGeocoding(true);
      
      const url = `https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${lat}&lon=${lon}&format=json&addressdetails=1&normalizeaddress=1&accept-language=en`;
      
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Sawari.pro/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`LocationIQ API error: ${response.status}`);
      }

      const data = await response.json();
      
      const addressData = {
        display_name: data.display_name,
        road: data.address?.road,
        name: data.address?.name,
        neighbourhood: data.address?.neighbourhood || data.address?.suburb,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
        postcode: data.address?.postcode,
        raw: data
      };

      // Cache the result
      geocodeCache.set(cacheKey, {
        data: addressData,
        timestamp: Date.now()
      });

      return addressData;
    } catch (error) {
      if (error.name === 'AbortError') {
        return null;
      }
      console.warn('Reverse geocoding failed:', error);
      return null;
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [API_KEY]);

  // Debounced reverse geocoding
  const debouncedReverseGeocode = useDebounce(reverseGeocode, 500);

  // Validate location against Pakistan and city restrictions
  const validateLocation = useCallback((addressData, coordinates) => {
    if (!addressData) {
      return { isValid: true, error: null };
    }

    // Check if location is in Pakistan
    if (!isInPakistan(addressData)) {
      return {
        isValid: false,
        error: {
          type: 'country',
          message: 'Sawari operates only in Pakistan. Please choose a location inside Pakistan.'
        }
      };
    }

    // Check city restriction if userCity is provided
    if (userCity) {
      const locationCity = extractCity(addressData);
      if (locationCity && locationCity.toLowerCase() !== userCity.toLowerCase()) {
        return {
          isValid: false,
          error: {
            type: 'city',
            message: `We currently support rides within ${userCity}. Choose a pickup inside ${userCity}.`
          }
        };
      }
    }

    return { isValid: true, error: null };
  }, [userCity]);

  // Handle coordinates change and reverse geocoding
  useEffect(() => {
    if (coords && coords.lat && coords.lon && !isEditing) {
      debouncedReverseGeocode(coords.lat, coords.lon).then((addressData) => {
        if (addressData) {
          setCachedAddress(addressData);
          
          // Validate the location
          const validation = validateLocation(addressData, coords);
          
          if (validation.isValid) {
            setValidationError(null);
            // Notify parent component
            if (onLocationSelect) {
              onLocationSelect({
                lat: coords.lat,
                lon: coords.lon,
                address: addressData,
                formatted: formatAddress(addressData)
              });
            }
          } else {
            setValidationError(validation.error);
            if (onValidationError) {
              onValidationError(validation.error);
            }
          }
        }
      });
    }
  }, [coords, isEditing, debouncedReverseGeocode, validateLocation, onLocationSelect, onValidationError]);

  // Handle manual location search
  const handleManualSearch = useCallback(async (query) => {
    if (!API_KEY || !query.trim() || query.length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        key: API_KEY,
        q: query,
        limit: '5',
        format: 'json',
        addressdetails: '1',
        countrycodes: 'pk', // Restrict to Pakistan
        dedupe: '1'
      });
      
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?${params}`,
        {
          headers: {
            'User-Agent': 'Sawari.pro/1.0',
            'Accept-Language': 'en'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map(item => ({
        id: item.place_id,
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: {
          display_name: item.display_name,
          road: item.address?.road,
          name: item.address?.name,
          neighbourhood: item.address?.neighbourhood || item.address?.suburb,
          city: item.address?.city || item.address?.town || item.address?.village,
          state: item.address?.state,
          country: item.address?.country || 'Pakistan',
          postcode: item.address?.postcode
        }
      }));
    } catch (error) {
      console.error('Manual search error:', error);
      return [];
    }
  }, [API_KEY]);

  // Handle edit mode toggle
  const handleEditToggle = useCallback(() => {
    if (disabled) return;
    
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Entering edit mode
      setManualValue(cachedAddress ? formatAddress(cachedAddress) : '');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Exiting edit mode
      setManualValue('');
    }
  }, [isEditing, disabled, cachedAddress]);

  // Handle location permission request
  const handleRequestLocation = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Determine display state and content
  const displayState = useMemo(() => {
    if (isEditing) {
      return { mode: 'editing', content: manualValue };
    }
    
    if (locationLoading || isReverseGeocoding) {
      return { mode: 'loading', content: 'Current location — fetching...' };
    }
    
    if (locationError) {
      if (locationError.includes('denied') || locationError.includes('permission')) {
        return { mode: 'permission-denied', content: 'Location access denied' };
      }
      return { mode: 'error', content: 'Unable to get location' };
    }
    
    if (validationError) {
      return { mode: 'validation-error', content: formatAddress(cachedAddress) || 'Invalid location' };
    }
    
    if (cachedAddress) {
      return { mode: 'success', content: formatAddress(cachedAddress) };
    }
    
    if (currentAddress) {
      return { mode: 'success', content: currentAddress.label || formatAddress(currentAddress) };
    }
    
    return { mode: 'initial', content: 'Tap to set pickup location' };
  }, [isEditing, manualValue, locationLoading, isReverseGeocoding, locationError, validationError, cachedAddress, currentAddress]);

  // Update cached address when currentAddress prop changes
  useEffect(() => {
    if (currentAddress && !isEditing) {
      setCachedAddress(currentAddress);
    }
  }, [currentAddress, isEditing]);

  // Auto focus effect
  useEffect(() => {
    if (autoFocus && isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, isEditing]);

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium font-inter text-theme-secondary mb-2">
        Pickup Location
      </label>
      
      {/* Input Container */}
      <div className="relative">
        {isEditing ? (
          // Editable input mode
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="Search for pickup location..."
              disabled={disabled}
              className={`
                w-full px-4 py-4 pr-20 text-base font-inter
                glass-bg backdrop-theme
                glass-border
                rounded-2xl shadow-theme-sm
                text-theme-primary placeholder-theme-subtle
                focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${validationError ? 'border-error/50 focus:border-error focus:ring-error/30' : ''}
              `}
              style={{ fontSize: '16px', minHeight: '56px' }}
            />
            
            {/* Edit mode action buttons */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setManualValue('');
                }}
                className="p-2 text-theme-subtle hover:text-theme-secondary transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-theme-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                aria-label="Cancel edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // Readonly display mode
          <div className={`
            relative w-full px-4 py-4 pr-16 text-base font-inter
            glass-bg backdrop-theme
            glass-border
            rounded-2xl shadow-theme-sm
            text-theme-primary
            transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-primary/30'}
            ${validationError ? 'border-error/50' : ''}
          `}
          style={{ minHeight: '56px' }}
          onClick={!disabled ? handleEditToggle : undefined}
          >
            <div className="flex items-center min-h-[24px]">
              {displayState.mode === 'loading' && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-brand-primary animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-theme-subtle animate-pulse">{displayState.content}</span>
                </div>
              )}
              
              {displayState.mode === 'success' && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-theme-primary">{displayState.content}</span>
                </div>
              )}
              
              {displayState.mode === 'validation-error' && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-error">{displayState.content}</span>
                </div>
              )}
              
              {(displayState.mode === 'permission-denied' || displayState.mode === 'error') && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-warning">{displayState.content}</span>
                </div>
              )}
              
              {displayState.mode === 'initial' && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-theme-subtle animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-theme-subtle">{displayState.content}</span>
                </div>
              )}
            </div>
            
            {/* Edit icon */}
            {!disabled && displayState.mode !== 'loading' && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditToggle();
                  }}
                  className="p-2 text-theme-subtle hover:text-theme-secondary transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-theme-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  aria-label="Edit pickup location"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Validation Error Message */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-3 p-4 bg-error/10 border border-error/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium font-inter text-error mb-1">
                  {validationError.type === 'country' ? 'Location Outside Pakistan' : 'City Restriction'}
                </p>
                <p className="text-sm font-inter text-error/80">
                  {validationError.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Permission Denied CTA */}
      <AnimatePresence>
        {displayState.mode === 'permission-denied' && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-3 p-4 bg-warning/10 border border-warning/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium font-inter text-warning mb-2">
                  Location Access Needed
                </p>
                <p className="text-sm font-inter text-warning/80 mb-3">
                  To automatically detect your pickup location, please enable location permissions in your browser settings.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleRequestLocation}
                    className="px-4 py-2 bg-warning/20 text-warning rounded-xl text-sm font-medium font-inter hover:bg-warning/30 transition-colors min-h-[40px] focus:outline-none focus:ring-2 focus:ring-warning/30"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-theme-surface text-theme-primary rounded-xl text-sm font-medium font-inter hover:bg-theme-surface-elevated transition-colors min-h-[40px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    Enter Manually
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Helper Text */}
      {!validationError && displayState.mode === 'success' && (
        <p className="mt-2 text-xs font-inter text-theme-subtle">
          Tap the edit icon to change your pickup location
        </p>
      )}
    </div>
  );
};

export default PickupLocationInput;