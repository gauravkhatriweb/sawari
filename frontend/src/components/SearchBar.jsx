import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom debounce hook
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

const SearchBar = ({ 
  mode = 'drop', // 'pickup' | 'drop'
  placeholder,
  onLocationSelect,
  disabled = false,
  className = '',
  initialValue = ''
}) => {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Default placeholders based on mode
  const defaultPlaceholder = mode === 'pickup' 
    ? 'Search pickup location...' 
    : 'Where are you going?';

  const displayPlaceholder = placeholder || defaultPlaceholder;

  // Debounced search function
  const debouncedSearch = useDebounce(async (query) => {
    if (!query.trim() || query.length < 3) {
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
      url.searchParams.set('limit', '5');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('q', query);
      
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
        type: item.type || 'location'
      }));

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
  }, 400);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setValue(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Emit selection event
    if (onLocationSelect) {
      onLocationSelect({
        label: suggestion.label,
        lat: suggestion.lat,
        lon: suggestion.lon,
        address: suggestion.address
      });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
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
  };

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

  // Icon based on mode
  const Icon = mode === 'pickup' ? (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={displayPlaceholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-12 py-3 
            bg-white/10 backdrop-blur-md
            border border-white/20 rounded-xl
            text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          `}
          aria-label={displayPlaceholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Loading/Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <svg className="w-5 h-5 text-[#4DA6FF] animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : value ? (
            <button
              onClick={() => {
                setValue('');
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 z-[1000] mt-2"
          >
            <div className="bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
              {error ? (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Search Error</span>
                  </div>
                  <p className="text-xs text-red-300">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      debouncedSearch(value);
                    }}
                    className="mt-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : suggestions.length === 0 && !isLoading && value.length >= 3 ? (
                <div className="p-4 text-center text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm">No locations found</p>
                  <p className="text-xs opacity-70">Try a different search term</p>
                </div>
              ) : (
                <ul role="listbox" aria-label="Location suggestions">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      role="option"
                      aria-selected={index === selectedIndex}
                      className={`
                        px-4 py-3 cursor-pointer transition-colors border-b border-white/10 last:border-b-0
                        ${index === selectedIndex 
                          ? 'bg-[#4DA6FF]/20 text-white' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }
                      `}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {suggestion.label}
                          </p>
                          {suggestion.type && (
                            <p className="text-xs opacity-70 capitalize">
                              {suggestion.type}
                            </p>
                          )}
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

export default SearchBar;