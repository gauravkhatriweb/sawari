/**
 * LiveMap.jsx - Interactive Map Component with Multi-Route Display
 * 
 * A comprehensive map component built with React Leaflet for displaying
 * pickup/drop locations with multiple route visualization and automatic bounds fitting.
 * 
 * Key Features:
 * - Interactive map with custom markers
 * - Multiple route polylines with different styling (selected vs alternatives)
 * - Route selection with hover effects and popups
 * - Automatic bounds fitting with smooth animations
 * - Responsive design with mobile-optimized controls
 * - Glassmorphism UI elements with recenter button
 * - Loading states and error handling
 * 
 * Dependencies:
 * - react-leaflet: Map components and hooks
 * - leaflet: Core mapping library
 * - MapStyles.css: Custom styling for map elements
 * 
 * Usage:
 * ```jsx
 * <LiveMap
 *   pickup={{ lat: 24.8607, lng: 67.0011, address: "Karachi" }}
 *   drop={{ lat: 24.9056, lng: 67.0822, address: "Clifton" }}
 *   routes={[
 *     { id: 'route-0', geometry: [...], distance: 5000, duration: 900, summary: 'Main route' },
 *     { id: 'route-1', geometry: [...], distance: 5500, duration: 1000, summary: 'Alternative' }
 *   ]}
 *   selectedRouteId="route-0"
 *   onRouteSelect={(routeId) => console.log('Route selected:', routeId)}
 *   onMapReady={() => console.log('Map loaded')}
 * />
 * ```
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
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
 * @param {Array} routes - Array of route objects with geometry
 * @param {string} selectedRouteId - ID of the currently selected route
 * @param {boolean} shouldRecenter - Flag to trigger map recentering
 */
const MapController = ({ pickup, drop, routes, selectedRouteId, shouldRecenter }) => {
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
      const selectedRoute = routes?.find(route => route.id === selectedRouteId) || routes?.[0];
      if (selectedRoute?.geometry && selectedRoute.geometry.length > 0) {
        // If we have a route polyline, fit bounds to include the entire route
        const bounds = L.latLngBounds(selectedRoute.geometry);
        map.fitBounds(bounds, { 
          padding: [40, 40],
          animate: true,
          duration: 1.0,
          easeLinearity: 0.25,
          maxZoom: 16
        });
      } else {
        // Fallback to fitting bounds between pickup and drop
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lng || pickup.lon],
          [drop.lat, drop.lng || drop.lon]
        ]);
        map.fitBounds(bounds, { 
          padding: [40, 40],
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
  }, [map, pickup, drop, routes, selectedRouteId]);

  // Manual recenter functionality
  useEffect(() => {
    if (!map || !shouldRecenter) return;

    if (pickup && drop) {
      // If we have a route polyline, fit bounds to include the entire route
      const selectedRoute = routes?.find(route => route.id === selectedRouteId) || routes?.[0];
      if (selectedRoute?.geometry && selectedRoute.geometry.length > 0) {
        const bounds = L.latLngBounds(selectedRoute.geometry);
        map.fitBounds(bounds, { 
          padding: [40, 40],
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25
        });
      } else {
        // Fallback to fitting bounds between pickup and drop
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lng],
          [drop.lat, drop.lng]
        ]);
        map.fitBounds(bounds, { 
          padding: [40, 40],
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25
        });
      }
    } else if (pickup) {
      // Center on pickup location with smooth animation
      map.setView([pickup.lat, pickup.lng], 15, {
        animate: true,
        duration: 0.6
      });
    }
  }, [map, pickup, drop, routes, selectedRouteId, shouldRecenter]);

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
const LiveMap = ({ 
  pickup = null, 
  drop = null, 
  routes = [], 
  selectedRouteId = null,
  onRouteSelect,
  className = '', 
  onMapReady,
  style = {} 
}) => {
  // Refs for map and marker instances
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  
  // State management
  const [mapReady, setMapReady] = useState(false); // Track map initialization
  const [recenterTrigger, setRecenterTrigger] = useState(0); // Trigger for recentering
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const isLoading = !mapReady; // Loading state derived from map readiness

  // Memoize icons to prevent recreation on every render for performance
  const pickupIcon = useMemo(() => createCustomIcon('pickup'), []);
  const dropIcon = useMemo(() => createCustomIcon('drop'), []);

  /**
   * Validate coordinate objects for proper lat/lng values
   * @param {Object} coords - Coordinate object with lat and lng/lon properties
   * @returns {boolean} True if coordinates are valid
   */
  const isValidCoords = useCallback((coords) => {
    if (!coords) return false;
    
    const lat = coords.lat;
    const lng = coords.lng || coords.lon; // Support both lng and lon properties
    
    return typeof lat === 'number' && 
            typeof lng === 'number' && 
            !isNaN(lat) && 
            !isNaN(lng) &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180;
   }, []);

  // Memoized validation results for performance
  const validPickup = useMemo(() => isValidCoords(pickup), [pickup, isValidCoords]);
  const validDrop = useMemo(() => isValidCoords(drop), [drop, isValidCoords]);
  const hasValidRoutes = useMemo(() => routes && Array.isArray(routes) && routes.length > 0, [routes]);
  const selectedRoute = useMemo(() => routes.find(route => route.id === selectedRouteId) || routes[0], [routes, selectedRouteId]);

  /**
   * Calculate initial map center and zoom level based on available data
   * Prioritizes routes, then pickup/drop locations, defaults to Karachi if none available
   */
  const { center, zoom } = useMemo(() => {
    // If we have valid routes, use the selected route's bounds
    if (hasValidRoutes && selectedRoute && selectedRoute.geometry && selectedRoute.geometry.length > 0) {
      const bounds = L.latLngBounds(selectedRoute.geometry);
      return {
        center: bounds.getCenter(),
        zoom: 13
      };
    }
    
    // If we have both pickup and drop, center between them
    if (validPickup && validDrop) {
      const centerLat = (pickup.lat + drop.lat) / 2;
      const centerLng = ((pickup.lng || pickup.lon) + (drop.lng || drop.lon)) / 2;
      return {
        center: [centerLat, centerLng],
        zoom: 12
      };
    }
    
    // If we have only pickup, center on it
    if (pickup?.lat && (pickup?.lng || pickup?.lon)) {
      return {
        center: [pickup.lat, pickup.lng || pickup.lon],
        zoom: 15 // Close zoom for specific location
      };
    }
    
    // If we have only drop, center on it
    if (validDrop) {
      return {
        center: [drop.lat, drop.lng || drop.lon],
        zoom: 15
      };
    }
    
    // Default to Karachi, Pakistan
    return {
      center: [24.8607, 67.0011], // Karachi, Pakistan coordinates
      zoom: 11 // City-level zoom
    };
  }, [pickup?.lat, pickup?.lng, pickup?.lon, drop?.lat, drop?.lng, drop?.lon, hasValidRoutes, selectedRoute, validPickup, validDrop]);

  // Handle recenter functionality
  const handleRecenter = useCallback(() => {
    setRecenterTrigger(prev => prev + 1);
  }, []);

  // Process routes for rendering
  const processedRoutes = useMemo(() => {
    if (!hasValidRoutes) {
      return [];
    }

    return routes.map(route => {
      let geometry = [];
      
      // Process route geometry
      if (route.geometry && Array.isArray(route.geometry) && route.geometry.length > 0) {
        // If geometry is already an array of [lat, lng] coordinates, use it directly
        if (route.geometry.every(point => Array.isArray(point) && point.length === 2)) {
          geometry = route.geometry;
        }
        // If geometry is an array of coordinate objects, convert to [lat, lng] format
        else if (route.geometry.every(point => point && typeof point.lat === 'number' && typeof point.lng === 'number')) {
          geometry = route.geometry.map(point => [point.lat, point.lng]);
        }
      }
      // If geometry is an encoded polyline string, decode it
      else if (typeof route.geometry === 'string') {
        try {
          geometry = decodePolyline(route.geometry);
        } catch (error) {
          console.error('Error decoding polyline for route:', route.id, error);
          geometry = [];
        }
      }

      return {
        ...route,
        geometry,
        isSelected: route.id === selectedRouteId,
        isHovered: route.id === hoveredRouteId
      };
    }).filter(route => route.geometry.length > 0);
  }, [routes, selectedRouteId, hoveredRouteId, hasValidRoutes]);

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
    <motion.div 
      className={`relative map-container ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
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
            position={[pickup.lat, pickup.lng || pickup.lon]} 
            icon={pickupIcon}
            ref={pickupMarkerRef}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-center p-2 glass-bg backdrop-theme rounded-lg">
                <div className="font-semibold text-brand-primary flex items-center gap-2 justify-center mb-2">
                  <span>📍</span>
                  <span>Pickup</span>
                </div>
                {pickup.label && (
                  <div className="text-sm text-theme-secondary mb-2">
                    {pickup.label}
                  </div>
                )}
                <div className="text-xs text-theme-tertiary">
                  {pickup.lat?.toFixed(6) || 'N/A'}, {(pickup.lng || pickup.lon)?.toFixed(6) || 'N/A'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drop Marker */}
        {validDrop && (
          <Marker 
            position={[drop.lat, drop.lng || drop.lon]} 
            icon={dropIcon}
            ref={dropMarkerRef}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-center p-2 glass-bg backdrop-theme rounded-lg">
                <div className="font-semibold text-red-600 flex items-center gap-2 justify-center mb-2">
                  <span>🏁</span>
                  <span>Drop</span>
                </div>
                {drop.label && (
                  <div className="text-sm text-theme-secondary mb-2">
                    {drop.label}
                  </div>
                )}
                <div className="text-xs text-theme-tertiary">
                  {drop.lat?.toFixed(6) || 'N/A'}, {(drop.lng || drop.lon)?.toFixed(6) || 'N/A'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polylines */}
        {processedRoutes.map(route => {
          const isSelected = route.isSelected;
          const isHovered = route.isHovered;
          
          return (
            <Polyline
              key={route.id}
              positions={route.geometry}
              pathOptions={{
                color: isSelected ? '#1a73e8' : '#6b7280',
                weight: isSelected ? 6 : 3,
                opacity: isSelected ? 0.95 : 0.45,
                smoothFactor: 1.5,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: isSelected ? null : '8, 4',
                fillOpacity: 0
              }}
              eventHandlers={{
                mouseover: () => setHoveredRouteId(route.id),
                mouseout: () => setHoveredRouteId(null),
                click: () => onRouteSelect && onRouteSelect(route.id)
              }}
            >
              <Popup>
                <div className="text-center p-2 glass-bg backdrop-theme rounded-lg">
                  <div className="font-semibold text-brand-primary mb-2">
                    {route.summary || `Route ${route.id}`}
                  </div>
                  {route.distance && (
                    <div className="text-sm text-theme-secondary mb-1">
                      Distance: {(route.distance / 1000).toFixed(1)} km
                    </div>
                  )}
                  {route.duration && (
                    <div className="text-sm text-theme-secondary">
                      Duration: {Math.round(route.duration / 60)} min
                    </div>
                  )}
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Map Controller for centering and bounds */}
        <MapController 
          pickup={pickup} 
          drop={drop} 
          routes={routes}
          selectedRouteId={selectedRouteId}
          shouldRecenter={recenterTrigger > 0} 
        />
      </MapContainer>
      
      {/* Status indicator */}
      <motion.div 
        className="absolute top-4 left-4 z-[1000] pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="glass-bg backdrop-theme rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              animate={isLoading ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={isLoading ? { duration: 1, repeat: Infinity } : {}}
            />
            <span className="text-sm font-medium text-theme-primary">
              {isLoading ? 'Loading map...' : hasValidRoutes ? `${routes.length} route${routes.length > 1 ? 's' : ''} found` : 'Map ready'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Recenter button - floating bottom-right with high z-index */}
      <AnimatePresence>
        {(validPickup || validDrop || hasValidRoutes) && (
          <motion.div 
            className="absolute bottom-4 right-4 z-[1000]"
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <motion.button
              onClick={handleRecenter}
              className="glass-bg backdrop-theme rounded-full p-3 shadow-lg group"
              title="Recenter to route"
              disabled={!hasValidRoutes && !validPickup && !validDrop}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg 
                className="w-5 h-5 text-theme-primary group-hover:text-brand-primary transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" 
                />
              </motion.svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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
      </motion.div>
   );
};

export default LiveMap;