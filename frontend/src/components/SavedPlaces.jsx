/**
 * SavedPlaces.jsx - Saved Places Selection Component
 * 
 * A flexible component for displaying and selecting from saved places in the Sawari platform.
 * Provides quick access to frequently used locations like Home, Work, and University.
 * Supports both compact and full display modes for different UI contexts.
 * 
 * Key Features:
 * - Pre-defined saved places (Home, Work, University)
 * - Compact and full display modes
 * - Karachi-based default coordinates
 * - Responsive grid layout
 * - Hover effects and accessibility support
 * - Coordinate display for reference
 * - Click handlers for place selection
 * 
 * Display Modes:
 * - Compact: Horizontal button layout for space-constrained areas
 * - Full: Grid layout with coordinates and detailed information
 * 
 * Usage:
 * ```jsx
 * // Full mode
 * <SavedPlaces
 *   onSelect={(place) => setSelectedLocation(place)}
 * />
 * 
 * // Compact mode
 * <SavedPlaces
 *   onSelect={(place) => setSelectedLocation(place)}
 *   compact={true}
 * />
 * ```
 */

import React from 'react'

// Default saved places with Karachi coordinates
const defaults = [
  { id: 'home', name: 'Home', lat: 24.906, lon: 67.082 }, // Karachi residential area
  { id: 'work', name: 'Work', lat: 24.867, lon: 67.030 }, // Karachi business district
  { id: 'fav1', name: 'University', lat: 24.930, lon: 67.120 }, // University area
]

/**
 * SavedPlaces Component
 * 
 * Displays saved places in either compact or full mode with selection functionality.
 * 
 * @param {Function} onSelect - Callback when a place is selected
 * @param {boolean} compact - Whether to use compact horizontal layout
 */
const SavedPlaces = ({ onSelect, compact = false }) => {
  // Compact mode: horizontal button layout
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {defaults.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect?.(p)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
            aria-label={`Select saved place ${p.name}`}
          >
            {p.name}
          </button>
        ))}
      </div>
    )
  }

  // Full mode: grid layout with coordinates
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      {/* Section header */}
      <h4 className="font-semibold">Saved places</h4>
      
      {/* Places grid */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {defaults.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect?.(p)}
            className="rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Select ${p.name} at coordinates ${p.lat}, ${p.lon}`}
          >
            {/* Place name */}
            <div className="font-semibold">{p.name}</div>
            {/* Coordinates display */}
            <div className="text-xs text-gray-600">
              ({p.lat?.toFixed(3) || 'N/A'}, {p.lon?.toFixed(3) || 'N/A'})
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SavedPlaces