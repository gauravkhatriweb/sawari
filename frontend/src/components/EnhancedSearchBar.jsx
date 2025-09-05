import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced debounce hook with cleanup
const useDebounce = (callback, delay) => {
  const debounceRef = useRef();

  const debouncedCallback = useCallback(
    (...args) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => callback(...args), delay);
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

const EnhancedSearchBar = ({ 
  mode = 'drop', // 'pickup' | 'drop'
  placeholder,
  onLocationSelect,
  disabled = false,
  className = '',
  initialValue = '',
  value: externalValue,
  onChange: externalOnChange,
  onFocus,
  onBlur,
  autoFocus = false,
  showCurrentLocationButton = false,
  onRequestCurrentLocation,
  errorHandler, // From LocationErrorHandler
  userCity = null // Current user's city for biased search
}) => {
  const [internalValue, setInternalValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
  // Use external value if provided, otherwise use internal state
  const value = typeof externalValue !== 'undefined' ? externalValue : internalValue;
  
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update internal value when external value changes
  useEffect(() => {
    if (typeof externalValue !== 'undefined') {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Enhanced placeholders with loading states
  const displayPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    
    if (mode === 'pickup') {
      if (isLoading) return 'Detecting location...';
      return 'Enter pickup location';
    }
    
    return 'Where are you going?';
  }, [mode, placeholder, isLoading]);

  // LocationIQ API configuration
  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1';
  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [1000, 2000]; // ms

  // Debounced search function with LocationIQ and retry logic (300ms for better UX)
  const debouncedSearch = useDebounce(async (query, retryCount = 0) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (!LOCATIONIQ_API_KEY) {
      setError('LocationIQ API key not configured');
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      // Build search query with city bias for drop mode
      let searchQuery = query;
      if (mode === 'drop' && userCity && !query.toLowerCase().includes(userCity.toLowerCase())) {
        searchQuery = `${query}, ${userCity}, Pakistan`;
      }
      
      const params = new URLSearchParams({
        key: LOCATIONIQ_API_KEY,
        q: searchQuery,
        limit: '6', // Reduced to top 6 as requested
        format: 'json',
        addressdetails: '1',
        countrycodes: 'pk',
        dedupe: '1'
      });
      
      // Add viewbox for city-biased search if userCity is available
      if (mode === 'drop' && userCity) {
        // Karachi viewbox coordinates (approximate)
        if (userCity.toLowerCase().includes('karachi')) {
          params.append('viewbox', '66.9,25.3,67.3,24.7'); // Karachi bounds
          params.append('bounded', '1');
        }
        // Add more cities as needed
      }
      
      const response = await fetch(
        `${LOCATIONIQ_BASE_URL}/search.php?${params}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'User-Agent': 'Sawari App (sawari.pk)',
            'Referer': window.location.origin,
            'Accept-Language': navigator.language || 'en',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 429 && retryCount < MAX_RETRIES) {
          // Rate limit hit, retry with delay
          setTimeout(() => {
            debouncedSearch(query, retryCount + 1);
          }, RETRY_DELAYS[retryCount]);
          return;
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      const formattedSuggestions = data
        .filter(item => {
          // For drop mode, filter to current city only
          if (mode === 'drop' && userCity) {
            const itemCity = item.address?.city || item.address?.town || item.address?.village || '';
            return itemCity.toLowerCase().includes(userCity.toLowerCase()) || 
                   item.display_name.toLowerCase().includes(userCity.toLowerCase());
          }
          return true;
        })
        .map(item => {
          const address = {
            name: item.address?.name || item.address?.house_number || '',
            road: item.address?.road || '',
            neighbourhood: item.address?.neighbourhood || item.address?.suburb || '',
            city: item.address?.city || item.address?.town || item.address?.village || '',
            state: item.address?.state || '',
            country: item.address?.country || 'Pakistan'
          };
          
          // Create enhanced label with city context for ambiguous names
          let enhancedLabel = item.display_name;
          if (mode === 'drop' && userCity && address.city) {
            const mainName = item.display_name.split(',')[0];
            if (mainName.length < 15) { // Likely a venue/landmark name
              enhancedLabel = `${mainName} (${address.city})`;
            }
          }
          
          return {
            id: item.place_id,
            label: item.display_name,
            enhancedLabel,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            address,
            type: item.type || 'location',
            importance: item.importance || 0,
            raw: item
          };
        })
        .sort((a, b) => {
          // Prioritize by locality match and importance
          if (mode === 'drop' && userCity) {
            const aInCity = a.address.city.toLowerCase().includes(userCity.toLowerCase());
            const bInCity = b.address.city.toLowerCase().includes(userCity.toLowerCase());
            if (aInCity && !bInCity) return -1;
            if (!aInCity && bInCity) return 1;
          }
          return b.importance - a.importance;
        });
        
      // Limit to top 6 suggestions
      const limitedSuggestions = formattedSuggestions.slice(0, 6);

      setSuggestions(limitedSuggestions);
      setIsOpen(limitedSuggestions.length > 0);
      setSelectedIndex(-1);

    } catch (err) {
      if (err.name === 'AbortError') return;
      
      console.error('LocationIQ search error:', err);
      
      // Report error to error handler if available
      if (errorHandler) {
        errorHandler.reportError(err);
      } else {
        // Fallback to local error handling
        if (err.message.includes('429')) {
          setError('Too many requests. Please wait a moment and try again.');
        } else if (err.message.includes('Network')) {
          setError('Network error. Please check your connection.');
        } else {
          setError(err.message || 'Unable to search locations. Please try again.');
        }
      }
      
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, 300); // Reduced to 300ms as requested

  // Enhanced input change handler
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    
    // Update appropriate state
    if (typeof externalValue !== 'undefined' && externalOnChange) {
      externalOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    
    // Trigger search
    debouncedSearch(newValue);
  }, [externalValue, externalOnChange, debouncedSearch]);

  // Enhanced suggestion selection
  const handleSelectSuggestion = useCallback((suggestion) => {
    const newValue = suggestion.label;
    
    // Update appropriate state
    if (typeof externalValue !== 'undefined' && externalOnChange) {
      externalOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Haptic feedback on mobile
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(25);
    }
    
    // Emit selection event
    if (onLocationSelect) {
      onLocationSelect({
        label: suggestion.label,
        lat: suggestion.lat,
        lon: suggestion.lon,
        address: suggestion.address,
        type: suggestion.type
      });
    }
  }, [externalValue, externalOnChange, onLocationSelect]);

  // Enhanced keyboard navigation with scroll management
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
          // Scroll selected option into view
          setTimeout(() => {
            const selectedElement = document.getElementById(`suggestion-${newIndex}`);
            if (selectedElement) {
              selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }, 0);
          return newIndex;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
          // Scroll selected option into view
          setTimeout(() => {
            const selectedElement = document.getElementById(`suggestion-${newIndex}`);
            if (selectedElement) {
              selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }, 0);
          return newIndex;
        });
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
        
      case 'Tab':
        // Allow tab to close dropdown and move focus
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, suggestions, selectedIndex, handleSelectSuggestion]);

  // Enhanced focus handlers
  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
    if (onFocus) {
      onFocus(e);
    }
  }, [suggestions.length, onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    // Delay closing to allow for clicks on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
    
    if (onBlur) {
      onBlur(e);
    }
  }, [onBlur]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Enhanced icons
  const Icon = mode === 'pickup' ? (
    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {Icon}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={disabled ? 'Search unavailable offline' : displayPlaceholder}
          disabled={disabled}
          className={`
            w-full pl-12 pr-16 py-4 text-lg font-inter
            glass-bg backdrop-theme
            glass-border rounded-2xl
            text-theme-primary placeholder-theme-subtle
            focus:outline-none focus:ring-4 focus:ring-brand-primary/30 focus:border-brand-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 ease-out
            shadow-theme-md hover:shadow-theme-lg
            font-medium
            ${isFocused ? 'shadow-theme-lg border-brand-primary' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error/30' : ''}
            ${disabled ? 'glass-bg/50 glass-border/40' : ''}
          `}
          style={{ fontSize: '18px', minHeight: '56px' }}
          aria-label={disabled ? 'Search unavailable offline' : displayPlaceholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-owns={isOpen ? 'location-suggestions' : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          role="combobox"
        />

        {/* Action buttons */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {showCurrentLocationButton && mode === 'pickup' && (
            <button
              onClick={onRequestCurrentLocation}
              disabled={disabled}
              className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              aria-label="Use current location"
              title="Use current location"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          
          {isLoading ? (
            <div className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : value ? (
            <button
              onClick={() => {
                if (typeof externalValue !== 'undefined' && externalOnChange) {
                  externalOnChange('');
                } else {
                  setInternalValue('');
                }
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-2 text-theme-subtle hover:text-theme-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-theme-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Enhanced Dropdown with Fixed Positioning */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute top-full left-0 right-0 z-[9999] mt-3"
            style={{ 
              position: 'absolute',
              // Ensure dropdown doesn't go off-screen on mobile
              maxWidth: '100vw',
              left: 'max(0px, 50% - 50vw)',
              right: 'max(0px, 50% - 50vw)'
            }}
          >
            <div 
              className="glass-card overflow-hidden search-dropdown-scrollbar"
              style={{ 
                maxHeight: 'min(320px, 40vh)', // Responsive height for mobile
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
              onWheel={(e) => {
                // Prevent page scroll when dropdown is scrolling
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight;
                
                // Only prevent default if we're not at the boundaries
                if (!((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom))) {
                  e.stopPropagation();
                }
              }}
              onTouchStart={(e) => {
                // Store initial touch position for better scroll handling
                e.currentTarget.dataset.touchStartY = e.touches[0].clientY;
              }}
              onTouchMove={(e) => {
                const container = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = container;
                const touchStartY = parseFloat(container.dataset.touchStartY || '0');
                const touchCurrentY = e.touches[0].clientY;
                const deltaY = touchStartY - touchCurrentY;
                
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight;
                
                // Prevent page scroll only when scrolling within bounds
                if (!((deltaY < 0 && isAtTop) || (deltaY > 0 && isAtBottom))) {
                  e.stopPropagation();
                }
              }}
            >
              {error ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 text-error mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-semibold font-poppins">Search Error</span>
                  </div>
                  <p className="text-sm text-error/80 mb-4 font-inter">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      debouncedSearch(value);
                    }}
                    className="px-6 py-3 bg-error/10 text-error rounded-xl text-sm font-semibold font-inter hover:bg-error/20 transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-error/30"
                  >
                    Try Again
                  </button>
                </div>
              ) : suggestions.length === 0 && !isLoading && value.length >= 2 ? (
                <div className="p-6 text-center text-theme-subtle">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-semibold font-poppins mb-2">No locations found</p>
                  <p className="text-sm opacity-70 font-inter mb-4">Try a different search term</p>
                  
                  {mode === 'drop' && (
                    <div className="mt-4">
                      <p className="text-sm font-medium font-inter mb-3 text-theme-primary">Don't know the exact address?</p>
                      <div className="space-y-2">
                        {[
                          { name: 'Shopping Mall', icon: '🏬' },
                          { name: 'Airport', icon: '✈️' },
                          { name: 'Train Station', icon: '🚂' },
                          { name: 'Hospital', icon: '🏥' },
                          { name: 'University', icon: '🎓' },
                          { name: 'Market', icon: '🛒' }
                        ].map((landmark) => (
                          <button
                            key={landmark.name}
                            onClick={() => {
                              const newValue = `${landmark.name} near me`;
                              if (typeof externalValue !== 'undefined' && externalOnChange) {
                                externalOnChange(newValue);
                              } else {
                                setInternalValue(newValue);
                              }
                              debouncedSearch(newValue);
                            }}
                            className="w-full px-3 py-2 text-left text-sm bg-theme-surface-elevated hover:bg-brand-primary/10 rounded-lg transition-colors flex items-center gap-2 font-inter"
                          >
                            <span className="text-base">{landmark.icon}</span>
                            <span>Find {landmark.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ul 
                  role="listbox" 
                  aria-label="Location suggestions"
                  id="location-suggestions"
                  className="divide-y divide-theme-border-light"
                >
                  {suggestions.map((suggestion, index) => {
                    const mainName = suggestion.enhancedLabel || suggestion.label.split(',')[0];
                    const addressParts = suggestion.label.split(',').slice(1);
                    const area = suggestion.address.neighbourhood || suggestion.address.road || '';
                    const landmark = addressParts.length > 0 ? addressParts[0].trim() : '';
                    
                    return (
                      <li
                        key={suggestion.id}
                        id={`suggestion-${index}`}
                        role="option"
                        aria-selected={index === selectedIndex}
                        tabIndex={-1}
                        className={`
                          px-4 py-3 cursor-pointer transition-all duration-200 min-h-[64px] flex items-center
                          focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-inset
                          ${
                            index === selectedIndex 
                              ? 'bg-brand-primary/10 text-brand-primary' 
                              : 'text-theme-primary hover:bg-theme-surface-elevated'
                          }
                        `}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold font-poppins truncate mb-1">
                              {mainName}
                            </p>
                            {(area || landmark) && (
                              <p className="text-xs opacity-60 font-inter truncate">
                                {area && landmark ? `${area} • ${landmark}` : area || landmark}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearchBar;