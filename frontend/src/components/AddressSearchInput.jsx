/**
 * AddressSearchInput Component
 * Reusable autocomplete input for address search with LocationIQ integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createDebouncedSearch, cancelCurrentRequest } from '../services/locationiqAutocomplete';

const AddressSearchInput = ({
  placeholder = "Search for an address...",
  value = "",
  onLocationSelect,
  onInputChange,
  disabled = false,
  className = "",
  icon = null,
  label = "",
  error = "",
  required = false,
  id = ""
}) => {
  // State management
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Refs
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const suggestionRefs = useRef([]);
  const containerRef = useRef(null);
  
  // Create debounced search function
  const debouncedSearch = useCallback(
    createDebouncedSearch((result) => {
      setIsLoading(false);
      
      if (result.success) {
        setSuggestions(result.results);
        setSearchError("");
        setIsDropdownOpen(result.results.length > 0);
      } else {
        setSuggestions([]);
        setSearchError(result.error);
        setIsDropdownOpen(false);
      }
    }),
    []
  );
  
  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    // Call parent onChange if provided
    if (onInputChange) {
      onInputChange(newValue);
    }
    
    // Clear previous results and errors
    setSuggestions([]);
    setSearchError("");
    
    // If input is empty or too short, close dropdown
    if (newValue.trim().length < 2) {
      setIsDropdownOpen(false);
      setIsLoading(false);
      cancelCurrentRequest();
      return;
    }
    
    // Start loading and search
    setIsLoading(true);
    debouncedSearch(newValue);
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.displayName);
    setIsDropdownOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setSearchError("");
    
    // Call parent callback with selected location
    if (onLocationSelect) {
      onLocationSelect({
        address: suggestion.displayName,
        displayPlace: suggestion.displayPlace,
        displayAddress: suggestion.displayAddress,
        lat: suggestion.lat,
        lon: suggestion.lon,
        placeId: suggestion.placeId,
        type: suggestion.type
      });
    }
    
    // Blur input to close mobile keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;
    
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
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        if (inputRef.current) {
          inputRef.current.blur();
        }
        break;
        
      default:
        break;
    }
  };
  
  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsDropdownOpen(true);
    }
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);
  
  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelCurrentRequest();
    };
  }, []);
  
  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white mb-2 font-inter">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-white/60">
              {icon}
            </div>
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`
            w-full px-3 py-3 rounded-xl shadow-lg backdrop-blur-md font-inter
            bg-white/10 border border-white/20 text-white placeholder-white/60
            focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50
            hover:bg-white/15 hover:border-white/30
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-400/60 focus:ring-red-400/50 focus:border-red-400/50 bg-red-500/10' : ''}
            ${disabled ? 'bg-white/5 cursor-not-allowed opacity-50' : ''}
            transition-all duration-300 ease-out
          `}
        />
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-400 font-inter">{error}</p>
      )}
      
      {/* Search Error */}
      {searchError && (
        <p className="mt-2 text-sm text-orange-400 font-inter">{searchError}</p>
      )}
      
      {/* Dropdown */}
      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className="
            absolute z-50 w-full mt-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl
            max-h-60 overflow-y-auto
            transform transition-all duration-200 ease-out
            origin-top scale-100 opacity-100
          "
        >
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  ref={el => suggestionRefs.current[index] = el}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`
                    px-4 py-3 cursor-pointer transition-all duration-200
                    ${selectedIndex === index 
                      ? 'bg-brand-primary/20 text-white border-l-2 border-brand-primary' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm leading-5 font-inter">
                      {suggestion.displayPlace}
                    </span>
                    {suggestion.displayAddress && (
                      <span className="text-xs text-white/60 leading-4 mt-0.5 font-inter">
                        {suggestion.displayAddress}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-white/60 font-inter">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSearchInput;