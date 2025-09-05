/**
 * LiveMap.jsx - Interactive Map Component
 * 
 * A comprehensive map component built with React Leaflet for displaying pickup/drop locations,
 * route visualization, and real-time map interactions. Features custom markers, route polylines,
 * automatic bounds fitting, and responsive design.
 * 
 * Key Features:
 * - Interactive map with zoom and pan controls
 * - Custom pickup and drop-off markers with glassmorphism styling
 * - Route polyline visualization with smooth animations
 * - Automatic map bounds adjustment for optimal viewing
 * - Responsive design with mobile-friendly controls
 * - Real-time location updates and recentering
 * - Custom marker icons with gradient backgrounds
 * - Popup information display for locations
 * 
 * Dependencies:
 * - react-leaflet: Map rendering and components
 * - leaflet: Core mapping functionality
 * - Custom MapStyles.css for enhanced styling
 * 
 * Usage:
 * ```jsx
 * <LiveMap
 *   pickup={{ lat: 24.8607, lng: 67.0011, address: "Karachi" }}
 *   drop={{ lat: 24.9056, lng: 67.0822, address: "Clifton" }}
 *   routePolyline={[[24.8607, 67.0011], [24.9056, 67.0822]]}
 *   className="custom-map-class"
 * />
 * ```
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';

// Fix for default Leaflet markers in React environment
// This resolves the issue where default marker icons don't load properly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map container styles with responsive design
const mapContainerStyles = {
  width: '100%',
  height: '70vh',
  minHeight: '320px',
  borderRadius: '12px',
  overflow: 'hidden'
};

// Note: Responsive height media queries are handled via CSS classes in MapStyles.css

/**
 * Create custom marker icons with glassmorphism styling
 * @param {string} type - Type of marker ('pickup' or 'drop')
 * @returns {L.DivIcon} Leaflet div icon with custom styling
 */
const createCustomIcon = (type = 'pickup') => {
  const config = {
    pickup: {
      gradient: 'linear-gradient(135deg, #4DA6FF, #1D4ED8)',
      emoji: '📍',
      shadow: '0 4px 12px rgba(77, 166, 255, 0.4)'
    },
    drop: {
      gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
      emoji: '🏁',
      shadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
    }
  };
  
  const { gradient, emoji, shadow } = config[type] || config.pickup;
  
  return L.divIcon({
    html: `<div style="
      background: ${gradient};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: ${shadow};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
      position: relative;
    ">${emoji}</div>`,
    className: `custom-marker-${type}`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

/**
 * MapController Component
 * 
 * Internal component that handles map viewport control, automatic bounds fitting,
 * and recentering logic. Uses the useMap hook to access the Leaflet map instance.
 * 
 * @param {Object} pickup - Pickup location with lat, lng, and address
 * @param {Object} drop - Drop-off location with lat, lng, and address
 * @param {Array} routePolyline - Array of coordinate pairs for route visualization
 * @param {boolean} shouldRecenter - Flag to trigger map recentering
 */
const MapController = ({ pickup, drop, routePolyline, shouldRecenter }) => {
  const map = useMap(); // Access to Leaflet map instance
  const pickupMarkerRef = useRef(null); // Reference to pickup marker
  const dropMarkerRef = useRef(null); // Reference to drop marker
  const [hasAutoZoomed, setHasAutoZoomed] = useState(false); // Track auto-zoom state

  /**
   * Auto-zoom effect when both pickup and drop locations are available
   * Automatically adjusts map bounds to show both locations optimally
   */
  useEffect(() => {
    if (!map || !pickup || !drop) {
      setHasAutoZoomed(false);
      return;
    }

    // Auto-zoom to show both points when they're both available
    const performAutoZoom = () => {
      if (routePolyline && routePolyline.length > 0) {
        // If we have a route polyline, fit bounds to include the entire route
        const bounds = L.latLngBounds(routePolyline);
        map.fitBounds(bounds, { 
          padding: [60, 60],
          animate: true,
          duration: 1.0,
          easeLinearity: 0.25,
          maxZoom: 16
        });
      } else {
        // Fallback to fitting bounds between pickup and drop
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lon],
          [drop.lat, drop.lon]
        ]);
        map.fitBounds(bounds, { 
          padding: [50, 50],
          animate: true,
          duration: 1.0,
          easeLinearity: 0.25,
          maxZoom: 16
        });
      }
      setHasAutoZoomed(true);
    };

    // Perform auto-zoom with a slight delay to ensure smooth UX
    const timeoutId = setTimeout(performAutoZoom, 300);
    return () => clearTimeout(timeoutId);
  }, [map, pickup, drop, routePolyline]);

  // Manual recenter functionality
  useEffect(() => {
    if (!map || !shouldRecenter) return;

    if (pickup && drop) {
      // If we have a route polyline, fit bounds to include the entire route
      if (routePolyline && routePolyline.length > 0) {
        const bounds = L.latLngBounds(routePolyline);
        map.fitBounds(bounds, { 
          padding: [60, 60],
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25
        });
      } else {
        // Fallback to fitting bounds between pickup and drop
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lon],
          [drop.lat, drop.lon]
        ]);
        map.fitBounds(bounds, { 
          padding: [50, 50],
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25
        });
      }
    } else if (pickup) {
      // Center on pickup location with smooth animation
      map.setView([pickup.lat, pickup.lon], 15, {
        animate: true,
        duration: 0.6
      });
    }
  }, [map, pickup, drop, routePolyline, shouldRecenter]);

  // Enhanced gesture handling for mobile
  useEffect(() => {
    if (!map) return;

    // Improve touch handling for mobile devices
    map.options.tap = true;
    map.options.tapTolerance = 15;
    map.options.touchZoom = true;
    map.options.bounceAtZoomLimits = false;
    
    // Set reasonable zoom limits
    map.setMinZoom(10);
    map.setMaxZoom(18);

    return () => {
      // Cleanup if needed
    };
  }, [map]);

  return null;
};

/**
 * LiveMap Component
 * 
 * Main map component that renders an interactive Leaflet map with pickup/drop markers,
 * route visualization, and automatic viewport management.
 * 
 * @param {Object|null} pickup - Pickup location object with lat, lon, and address properties
 * @param {Object|null} drop - Drop-off location object with lat, lon, and address properties
 * @param {Array|null} routePolyline - Array of [lat, lng] coordinate pairs for route visualization
 * @param {string} className - Additional CSS classes for styling
 * @returns {JSX.Element} Rendered map component
 */
const LiveMap = ({ pickup = null, drop = null, routePolyline = null, className = '' }) => {
  // Refs for map and marker instances
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  
  // State management
  const [mapReady, setMapReady] = useState(false); // Track map initialization
  const [recenterTrigger, setRecenterTrigger] = useState(0); // Trigger for recentering
  const isLoading = !mapReady; // Loading state derived from map readiness

  // Memoize icons to prevent recreation on every render for performance
  const pickupIcon = useMemo(() => createCustomIcon('pickup'), []);
  const dropIcon = useMemo(() => createCustomIcon('drop'), []);

  /**
   * Validate coordinate objects for proper lat/lon values
   * @param {Object} coords - Coordinate object with lat and lon properties
   * @returns {boolean} True if coordinates are valid
   */
  const isValidCoords = useCallback((coords) => {
    return coords && 
           typeof coords.lat === 'number' && 
           typeof coords.lon === 'number' && 
           !isNaN(coords.lat) && 
           !isNaN(coords.lon) &&
           coords.lat >= -90 && coords.lat <= 90 &&
           coords.lon >= -180 && coords.lon <= 180;
  }, []);

  // Memoized validation results for performance
  const validPickup = useMemo(() => isValidCoords(pickup), [pickup, isValidCoords]);
  const validDrop = useMemo(() => isValidCoords(drop), [drop, isValidCoords]);

  /**
   * Calculate initial map center and zoom level based on pickup location
   * Defaults to Lahore, Pakistan if no pickup location is provided
   */
  const { center, zoom } = useMemo(() => {
    if (pickup?.lat && pickup?.lon) {
      return {
        center: [pickup.lat, pickup.lon],
        zoom: 15 // Close zoom for specific location
      };
    }
    // Default to a general location if no pickup
    return {
      center: [31.5204, 74.3587], // Lahore, Pakistan coordinates
      zoom: 12 // City-level zoom
    };
  }, [pickup?.lat, pickup?.lon]);

  // Recenter function
  const handleRecenter = () => {
    setRecenterTrigger(prev => prev + 1);
  };

  // Process polyline data
  const processedPolyline = useMemo(() => {
    if (!routePolyline) return null;
    
    // If it's already an array of coordinates, use it directly
    if (Array.isArray(routePolyline) && routePolyline.length > 0) {
      return routePolyline;
    }
    
    // If it's an encoded polyline string, decode it
    if (typeof routePolyline === 'string') {
      try {
        // Simple polyline decoding (you might want to use a proper library like @mapbox/polyline)
        return decodePolyline(routePolyline);
      } catch (error) {
        console.warn('Failed to decode polyline:', error);
        return null;
      }
    }
    
    return null;
  }, [routePolyline]);

  // Simple polyline decoder (basic implementation)
  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
  };

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full glass-card rounded-xl flex items-center justify-center">
        <div className="flex items-center gap-3 text-theme-secondary">
          <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-inter animate-pulse">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative map-container ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={mapContainerStyles}
        className="w-full h-full rounded-lg z-0"
        zoomControl={true}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        attributionControl={true}
        tap={true}
        tapTolerance={15}
        bounceAtZoomLimits={false}
        minZoom={10}
        maxZoom={18}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        ref={mapRef}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          setMapReady(true);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {/* Pickup Marker */}
        {validPickup && (
          <Marker 
            position={[pickup.lat, pickup.lon]} 
            icon={pickupIcon}
            ref={pickupMarkerRef}
          >
            <Popup>
              <div className="text-center p-2 glass-bg backdrop-theme rounded-lg">
                <div className="font-semibold text-brand-primary flex items-center gap-2 justify-center mb-2">
                  <span>📍</span>
                  <span>Pickup Location</span>
                </div>
                {pickup.label && (
                  <div className="text-sm text-theme-secondary mb-2">
                    {pickup.label}
                  </div>
                )}
                <div className="text-xs text-theme-tertiary">
                  {pickup.lat?.toFixed(6) || 'N/A'}, {pickup.lon?.toFixed(6) || 'N/A'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drop Marker */}
        {validDrop && (
          <Marker 
            position={[drop.lat, drop.lon]} 
            icon={dropIcon}
            ref={dropMarkerRef}
          >
            <Popup>
              <div className="text-center p-2 glass-bg backdrop-theme rounded-lg">
                <div className="font-semibold text-red-600 flex items-center gap-2 justify-center mb-2">
                  <span>🏁</span>
                  <span>Drop Location</span>
                </div>
                {drop.label && (
                  <div className="text-sm text-theme-secondary mb-2">
                    {drop.label}
                  </div>
                )}
                <div className="text-xs text-theme-tertiary">
                  {drop.lat?.toFixed(6) || 'N/A'}, {drop.lon?.toFixed(6) || 'N/A'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {processedPolyline && processedPolyline.length > 0 && (
          <Polyline
            positions={processedPolyline}
            pathOptions={{
              color: '#4DA6FF',
              weight: 5,
              opacity: 0.9,
              smoothFactor: 1.5,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: null,
              fillOpacity: 0
            }}
          />
        )}

        {/* Map Controller for centering and bounds */}
        <MapController 
          pickup={pickup} 
          drop={drop} 
          routePolyline={processedPolyline}
          shouldRecenter={recenterTrigger > 0} 
        />
      </MapContainer>
      
      {/* Status indicator */}
      {validPickup && (
        <div className="absolute top-4 right-4 glass-card px-3 py-2 z-[400]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-theme-primary">
              Live tracking
            </span>
          </div>
        </div>
      )}

      {/* Recenter button - floating bottom-right with high z-index */}
      {(validPickup || validDrop) && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 glass-bg backdrop-theme hover:glass-hover-bg text-theme-primary p-4 rounded-full glass-shadow glass-border transition-all duration-200 z-[1001] group min-w-[48px] min-h-[48px] flex items-center justify-center"
          title="Recenter map"
          aria-label="Recenter map to show all markers"
        >
          <svg 
            className="w-6 h-6 group-hover:scale-110 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>
      )}

      {/* No location fallback */}
      {!validPickup && !validDrop && (
        <div className="absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center z-[300]">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Location Available</h3>
            <p className="text-gray-600 text-sm">Enable location access to see the map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;