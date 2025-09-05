/**
 * LocationIQ Autocomplete API Service
 * Provides address search functionality with debouncing, error handling, and request cancellation
 */

// Configuration
const LOCATIONIQ_CONFIG = {
  baseUrl: 'https://api.locationiq.com/v1/autocomplete',
  apiKey: import.meta.env.VITE_LOCATIONIQ_API_KEY || '',
  timeout: 5000,
  retryAttempts: 1,
  debounceDelay: 300,
  minQueryLength: 2,
  maxResults: 5
};

// Request cancellation controller
let currentController = null;

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Cancel any ongoing autocomplete request
 */
function cancelCurrentRequest() {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

/**
 * Validate query parameters
 * @param {string} query - Search query
 * @returns {Object} Validation result
 */
function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Query must be a non-empty string' };
  }
  
  if (query.trim().length < LOCATIONIQ_CONFIG.minQueryLength) {
    return { isValid: false, error: `Query must be at least ${LOCATIONIQ_CONFIG.minQueryLength} characters` };
  }
  
  return { isValid: true };
}

/**
 * Check if LocationIQ API is available
 * @returns {boolean} True if API key is configured
 */
function isLocationIQAutocompleteAvailable() {
  return Boolean(LOCATIONIQ_CONFIG.apiKey);
}

/**
 * Build autocomplete API URL
 * @param {string} query - Search query
 * @returns {string} Complete API URL
 */
function buildAutocompleteUrl(query) {
  const params = new URLSearchParams({
    key: LOCATIONIQ_CONFIG.apiKey,
    q: query.trim(),
    limit: LOCATIONIQ_CONFIG.maxResults,
    dedupe: 1,
    countrycodes: 'pk',
    normalizeaddress: 1,
    format: 'json'
  });
  
  return `${LOCATIONIQ_CONFIG.baseUrl}?${params.toString()}`;
}

/**
 * Parse LocationIQ autocomplete response
 * @param {Array} results - Raw API results
 * @returns {Array} Formatted results
 */
function parseAutocompleteResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map((result, index) => ({
    id: `${result.place_id || index}`,
    displayPlace: result.display_place || result.name || 'Unknown Location',
    displayAddress: result.display_address || result.display_name || '',
    displayName: result.display_name || '',
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    placeId: result.place_id,
    type: result.type || 'unknown',
    importance: result.importance || 0,
    raw: result
  })).filter(result => !isNaN(result.lat) && !isNaN(result.lon));
}

/**
 * Make autocomplete API request with retry logic
 * @param {string} query - Search query
 * @param {number} attempt - Current attempt number
 * @returns {Promise<Array>} Autocomplete results
 */
async function makeAutocompleteRequest(query, attempt = 1) {
  // Cancel any previous request
  cancelCurrentRequest();
  
  // Create new abort controller
  currentController = new AbortController();
  
  const url = buildAutocompleteUrl(query);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Sawari-App/1.0'
      },
      signal: currentController.signal,
      timeout: LOCATIONIQ_CONFIG.timeout
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('INVALID_API_KEY');
      } else if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      } else if (response.status === 404) {
        return []; // No results found
      } else {
        throw new Error(`HTTP_ERROR_${response.status}`);
      }
    }
    
    const data = await response.json();
    return parseAutocompleteResults(data);
    
  } catch (error) {
    // Handle abort signal
    if (error.name === 'AbortError') {
      throw new Error('REQUEST_CANCELLED');
    }
    
    // Retry logic for certain errors
    if (attempt < LOCATIONIQ_CONFIG.retryAttempts && 
        (error.message === 'RATE_LIMIT_EXCEEDED' || error.message.startsWith('HTTP_ERROR_5'))) {
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      return makeAutocompleteRequest(query, attempt + 1);
    }
    
    throw error;
  }
}

/**
 * Search for addresses using LocationIQ Autocomplete API
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results with success/error status
 */
async function searchAddresses(query) {
  try {
    // Validate input
    const validation = validateQuery(query);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        results: []
      };
    }
    
    // Check if API is available
    if (!isLocationIQAutocompleteAvailable()) {
      return {
        success: false,
        error: 'Location service unavailable',
        results: []
      };
    }
    
    // Make API request
    const results = await makeAutocompleteRequest(query);
    
    return {
      success: true,
      results,
      query: query.trim()
    };
    
  } catch (error) {
    let errorMessage = 'Failed to search addresses';
    
    switch (error.message) {
      case 'INVALID_API_KEY':
        errorMessage = 'Location service unavailable';
        break;
      case 'RATE_LIMIT_EXCEEDED':
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 'REQUEST_CANCELLED':
        errorMessage = 'Search cancelled';
        break;
      default:
        errorMessage = 'Failed to search addresses';
    }
    
    return {
      success: false,
      error: errorMessage,
      results: []
    };
  }
}

/**
 * Create debounced search function
 * @param {Function} callback - Callback function to handle results
 * @returns {Function} Debounced search function
 */
function createDebouncedSearch(callback) {
  return debounce(async (query) => {
    const result = await searchAddresses(query);
    callback(result);
  }, LOCATIONIQ_CONFIG.debounceDelay);
}

/**
 * Get service configuration
 * @returns {Object} Current configuration
 */
function getAutocompleteConfig() {
  return {
    ...LOCATIONIQ_CONFIG,
    apiKey: LOCATIONIQ_CONFIG.apiKey ? '[CONFIGURED]' : '[NOT_CONFIGURED]'
  };
}

/**
 * Get service status
 * @returns {Object} Service status information
 */
function getAutocompleteServiceStatus() {
  return {
    available: isLocationIQAutocompleteAvailable(),
    configured: Boolean(LOCATIONIQ_CONFIG.apiKey),
    minQueryLength: LOCATIONIQ_CONFIG.minQueryLength,
    debounceDelay: LOCATIONIQ_CONFIG.debounceDelay,
    maxResults: LOCATIONIQ_CONFIG.maxResults
  };
}

// Export functions
export {
  searchAddresses,
  createDebouncedSearch,
  cancelCurrentRequest,
  isLocationIQAutocompleteAvailable,
  getAutocompleteConfig,
  getAutocompleteServiceStatus,
  validateQuery
};

export default {
  searchAddresses,
  createDebouncedSearch,
  cancelCurrentRequest,
  isLocationIQAutocompleteAvailable,
  getAutocompleteConfig,
  getAutocompleteServiceStatus,
  validateQuery
};