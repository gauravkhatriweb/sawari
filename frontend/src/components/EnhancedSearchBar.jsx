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
  onRequestCurrentLocation
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

  // Debounced search function with better error handling
  const debouncedSearch = useDebounce(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
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

      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '8');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('q', query);
      url.searchParams.set('countrycodes', 'pk'); // Focus on Pakistan
      
      const response = await fetch(url.toString(), {
        signal: abortControllerRef.current.signal,
        headers: {
          'User-Agent': 'Sawari App (sawari.pk)',
          'Referer': window.location.origin,
          'Accept-Language': navigator.language || 'en',
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      const formattedSuggestions = data.map(item => ({
        id: item.place_id,
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.address || null,
        type: item.type || 'location',
        importance: item.importance || 0
      })).sort((a, b) => b.importance - a.importance); // Sort by importance

      setSuggestions(formattedSuggestions);
      setIsOpen(formattedSuggestions.length > 0);
      setSelectedIndex(-1);

    } catch (err) {
      if (err.name === 'AbortError') return;
      
      console.error('Search error:', err);
      setError(err.message);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, 350);

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

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
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
          placeholder={displayPlaceholder}
          disabled={disabled}
          className={`
            w-full pl-12 pr-16 py-4 text-lg
            bg-white/95 backdrop-blur-xl
            border-2 border-gray-200/80 rounded-2xl
            text-gray-900 placeholder-gray-500
            focus:outline-none focus:ring-4 focus:ring-[#4DA6FF]/30 focus:border-[#4DA6FF]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 ease-out
            shadow-lg hover:shadow-xl
            font-medium
            ${isFocused ? 'shadow-xl border-[#4DA6FF]' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : ''}
          `}
          style={{ fontSize: '18px', minHeight: '56px' }}
          aria-label={displayPlaceholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Action buttons */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {showCurrentLocationButton && mode === 'pickup' && (
            <button
              onClick={onRequestCurrentLocation}
              disabled={disabled}
              className="p-2 bg-[#4DA6FF]/10 text-[#4DA6FF] rounded-xl hover:bg-[#4DA6FF]/20 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              <svg className="w-5 h-5 text-[#4DA6FF] animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Enhanced Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute top-full left-0 right-0 z-[1000] mt-3"
          >
            <div className="bg-white/98 backdrop-blur-xl border-2 border-gray-200/80 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
              {error ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 text-red-500 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-semibold">Search Error</span>
                  </div>
                  <p className="text-sm text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      debouncedSearch(value);
                    }}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors min-h-[44px]"
                  >
                    Try Again
                  </button>
                </div>
              ) : suggestions.length === 0 && !isLoading && value.length >= 2 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-semibold mb-2">No locations found</p>
                  <p className="text-sm opacity-70">Try a different search term</p>
                </div>
              ) : (
                <ul role="listbox" aria-label="Location suggestions" className="divide-y divide-gray-100">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      role="option"
                      aria-selected={index === selectedIndex}
                      className={`
                        px-4 py-4 cursor-pointer transition-all duration-200 min-h-[60px] flex items-center
                        ${index === selectedIndex 
                          ? 'bg-[#4DA6FF]/10 text-[#4DA6FF]' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate mb-1">
                            {suggestion.label.split(',')[0]}
                          </p>
                          <p className="text-sm opacity-70 truncate">
                            {suggestion.label.split(',').slice(1).join(',').trim()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </li>
                  ))}
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