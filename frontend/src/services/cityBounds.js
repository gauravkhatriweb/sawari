/**
 * cityBounds.js - City Bounding Box Service
 * 
 * Provides functionality to retrieve precise bounding boxes for Pakistani cities
 * using the LocationIQ Search API. Used for implementing city-scoped location
 * search with viewbox parameters.
 * 
 * Key Features:
 * - Fetches precise city boundaries from LocationIQ
 * - Caches bounding boxes for performance
 * - Handles API rate limiting and errors
 * - Provides fallback radius-based bounds
 * - Optimized for Pakistani cities
 */

const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const cityBoundsCache = new Map();

/**
 * Get bounding box for a city using LocationIQ Search API
 * 
 * @param {string} cityName - Name of the city
 * @param {Object} fallbackCoords - Fallback coordinates {lat, lon} if API fails
 * @returns {Promise<Object|null>} Bounding box object or null if failed
 */
export const getCityBounds = async (cityName, fallbackCoords = null) => {
  if (!API_KEY) {
    console.warn('LocationIQ API key not configured for city bounds');
    return generateFallbackBounds(fallbackCoords);
  }

  if (!cityName || typeof cityName !== 'string') {
    console.warn('Invalid city name provided:', cityName);
    return generateFallbackBounds(fallbackCoords);
  }

  // Check cache first
  const cacheKey = cityName.toLowerCase().trim();
  const cached = cityBoundsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.bounds;
  }

  try {
    // Query LocationIQ for city bounding box
    const query = encodeURIComponent(`${cityName}, Pakistan`);
    const url = `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${query}&format=json&limit=1&addressdetails=1&extratags=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Sawari.pro/1.0'
      }
    });

    if (response.status === 429) {
      console.warn('LocationIQ rate limit exceeded for city bounds');
      return generateFallbackBounds(fallbackCoords);
    }

    if (!response.ok) {
      throw new Error(`LocationIQ API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn('No results found for city:', cityName);
      return generateFallbackBounds(fallbackCoords);
    }

    const result = data[0];
    
    // Extract bounding box from API response
    // LocationIQ returns boundingbox as [south, north, west, east]
    if (result.boundingbox && result.boundingbox.length === 4) {
      const [south, north, west, east] = result.boundingbox.map(parseFloat);
      
      const bounds = {
        south,
        north,
        west,
        east,
        viewbox: `${west},${south},${east},${north}`, // Format for LocationIQ viewbox parameter
        center: {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        },
        source: 'locationiq'
      };

      // Cache the result
      cityBoundsCache.set(cacheKey, {
        bounds,
        timestamp: Date.now()
      });

      return bounds;
    } else {
      console.warn('Invalid bounding box data from LocationIQ:', result);
      return generateFallbackBounds(fallbackCoords);
    }
  } catch (error) {
    console.warn('Failed to fetch city bounds:', error);
    return generateFallbackBounds(fallbackCoords);
  }
};

/**
 * Generate fallback bounding box using radius around coordinates
 * 
 * @param {Object} coords - Center coordinates {lat, lon}
 * @param {number} radiusKm - Radius in kilometers (default: 30km)
 * @returns {Object|null} Fallback bounding box or null
 */
const generateFallbackBounds = (coords, radiusKm = 30) => {
  if (!coords || !coords.lat || !coords.lon) {
    return null;
  }

  const { lat, lon } = coords;
  
  // Approximate degrees per kilometer (varies by latitude)
  const kmPerDegreeLat = 111; // Roughly constant
  const kmPerDegreeLon = 111 * Math.cos(lat * Math.PI / 180); // Varies by latitude
  
  const deltaLat = radiusKm / kmPerDegreeLat;
  const deltaLon = radiusKm / kmPerDegreeLon;
  
  const south = lat - deltaLat;
  const north = lat + deltaLat;
  const west = lon - deltaLon;
  const east = lon + deltaLon;
  
  return {
    south,
    north,
    west,
    east,
    viewbox: `${west},${south},${east},${north}`,
    center: { lat, lon },
    source: 'fallback',
    radius: radiusKm
  };
};

/**
 * Clear the city bounds cache
 */
export const clearCityBoundsCache = () => {
  cityBoundsCache.clear();
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
  return {
    size: cityBoundsCache.size,
    entries: Array.from(cityBoundsCache.keys())
  };
};

/**
 * Predefined bounding boxes for major Pakistani cities
 * Used as fallback when API is unavailable
 */
export const CITY_BOUNDS_FALLBACK = {
  'karachi': {
    south: 24.7136,
    north: 25.0700,
    west: 66.9036,
    east: 67.2847,
    viewbox: '66.9036,24.7136,67.2847,25.0700',
    center: { lat: 24.8607, lon: 67.0011 },
    source: 'predefined'
  },
  'lahore': {
    south: 31.4504,
    north: 31.6340,
    west: 74.2034,
    east: 74.4662,
    viewbox: '74.2034,31.4504,74.4662,31.6340',
    center: { lat: 31.5204, lon: 74.3587 },
    source: 'predefined'
  },
  'islamabad': {
    south: 33.5651,
    north: 33.7294,
    west: 72.9745,
    east: 73.1911,
    viewbox: '72.9745,33.5651,73.1911,33.7294',
    center: { lat: 33.6844, lon: 73.0479 },
    source: 'predefined'
  },
  'rawalpindi': {
    south: 33.5651,
    north: 33.7294,
    west: 72.9745,
    east: 73.1911,
    viewbox: '72.9745,33.5651,73.1911,33.7294',
    center: { lat: 33.5972, lon: 73.0479 },
    source: 'predefined'
  },
  'faisalabad': {
    south: 31.3648,
    north: 31.4504,
    west: 73.0169,
    east: 73.1356,
    viewbox: '73.0169,31.3648,73.1356,31.4504',
    center: { lat: 31.4504, lon: 73.1350 },
    source: 'predefined'
  },
  'multan': {
    south: 30.1575,
    north: 30.2081,
    west: 71.4249,
    east: 71.5249,
    viewbox: '71.4249,30.1575,71.5249,30.2081',
    center: { lat: 30.1575, lon: 71.5249 },
    source: 'predefined'
  },
  'peshawar': {
    south: 33.9320,
    north: 34.0151,
    west: 71.4687,
    east: 71.6134,
    viewbox: '71.4687,33.9320,71.6134,34.0151',
    center: { lat: 33.9909, lon: 71.5609 },
    source: 'predefined'
  },
  'quetta': {
    south: 30.1798,
    north: 30.2274,
    west: 66.9478,
    east: 67.0362,
    viewbox: '66.9478,30.1798,67.0362,30.2274',
    center: { lat: 30.1798, lon: 66.9750 },
    source: 'predefined'
  }
};

/**
 * Get predefined bounds for a city
 * 
 * @param {string} cityName - Name of the city
 * @returns {Object|null} Predefined bounds or null
 */
export const getPredefinedCityBounds = (cityName) => {
  if (!cityName || typeof cityName !== 'string') {
    return null;
  }
  
  const normalizedName = cityName.toLowerCase().trim();
  return CITY_BOUNDS_FALLBACK[normalizedName] || null;
};