import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
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

// Component to handle map auto-centering and bounds
const MapController = ({ pickup, drop }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !pickup) return;

    // If both pickup and drop exist, fit bounds
    if (drop && pickup.lat !== drop.lat && pickup.lon !== drop.lon) {
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lon],
        [drop.lat, drop.lon]
      ]);
      map.fitBounds(bounds, { 
        padding: [40, 40],
        maxZoom: 16
      });
    } else {
      // Center on pickup only
      map.setView([pickup.lat, pickup.lon], Math.max(map.getZoom(), 15));
    }
  }, [map, pickup, drop]);

  return null;
};

const LiveMap = ({ pickup = null, drop = null, className = '' }) => {
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Memoize icons to prevent recreation on every render
  const pickupIcon = useMemo(() => createCustomIcon('pickup'), []);
  const dropIcon = useMemo(() => createCustomIcon('drop'), []);

  // Validate coordinates
  const isValidCoords = useCallback((coords) => {
    return coords && 
           typeof coords.lat === 'number' && 
           typeof coords.lon === 'number' && 
           !isNaN(coords.lat) && 
           !isNaN(coords.lon) &&
           coords.lat >= -90 && coords.lat <= 90 &&
           coords.lon >= -180 && coords.lon <= 180;
  }, []);

  const validPickup = useMemo(() => isValidCoords(pickup), [pickup, isValidCoords]);
  const validDrop = useMemo(() => isValidCoords(drop), [drop, isValidCoords]);

  // Calculate initial center and zoom
  const { initialCenter, initialZoom } = useMemo(() => {
    if (validPickup) {
      return {
        initialCenter: [pickup.lat, pickup.lon],
        initialZoom: 15
      };
    }
    // Default to Lahore, Pakistan
    return {
      initialCenter: [31.5204, 74.3587],
      initialZoom: 12
    };
  }, [validPickup, pickup]);

  // Recenter function
  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (validPickup && validDrop) {
      // Fit bounds to include both markers
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lon],
        [drop.lat, drop.lon]
      ]);
      map.fitBounds(bounds, { 
        padding: [40, 40],
        maxZoom: 16,
        animate: true,
        duration: 0.8
      });
    } else if (validPickup) {
      // Center on pickup
      map.setView([pickup.lat, pickup.lon], Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 0.8
      });
    }
  }, [validPickup, validDrop, pickup, drop]);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className={`map-container ${className}`}>
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DA6FF] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        attributionControl={true}
        className="leaflet-map"
        ref={mapRef}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
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
              <div className="text-center p-2">
                <div className="font-semibold text-[#4DA6FF] flex items-center gap-2 justify-center mb-2">
                  <span>📍</span>
                  <span>Pickup Location</span>
                </div>
                {pickup.label && (
                  <div className="text-sm text-gray-700 mb-2">
                    {pickup.label}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {pickup.lat.toFixed(6)}, {pickup.lon.toFixed(6)}
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
              <div className="text-center p-2">
                <div className="font-semibold text-red-600 flex items-center gap-2 justify-center mb-2">
                  <span>🏁</span>
                  <span>Drop Location</span>
                </div>
                {drop.label && (
                  <div className="text-sm text-gray-700 mb-2">
                    {drop.label}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {drop.lat.toFixed(6)}, {drop.lon.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        <MapController pickup={pickup} drop={drop} />
      </MapContainer>
      
      {/* Status indicator */}
      {validPickup && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-[400]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Live tracking
            </span>
          </div>
        </div>
      )}

      {/* Recenter button */}
      {(validPickup || validDrop) && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 bg-[#4DA6FF] hover:bg-[#4DA6FF]/90 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-[400] focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:ring-offset-2"
          aria-label="Recenter map"
          title="Recenter map"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
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