/**
 * SchedulePicker.jsx - Ride Scheduling Component
 * 
 * A simple and intuitive component for scheduling rides in the Sawari platform.
 * Allows users to choose between immediate booking ("Now") or schedule for a specific
 * date and time using a datetime-local input.
 * 
 * Key Features:
 * - Immediate booking option ("Now" button)
 * - Date and time picker for future rides
 * - Responsive design with consistent styling
 * - Accessibility support with screen reader labels
 * - Clean visual feedback for selected options
 * - Controlled component pattern
 * 
 * Usage:
 * ```jsx
 * <SchedulePicker
 *   value={scheduledDateTime} // null for "Now", ISO string for scheduled
 *   onChange={(dateTime) => setScheduledDateTime(dateTime)}
 * />
 * ```
 * 
 * @param {string|null} value - Selected datetime (ISO string) or null for "Now"
 * @param {Function} onChange - Callback when schedule selection changes
 */

import React from 'react'

/**
 * SchedulePicker Component
 * 
 * Provides options for immediate or scheduled ride booking with datetime selection.
 */
const SchedulePicker = ({ value, onChange }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      {/* Section header */}
      <h4 className="font-semibold">Schedule</h4>
      
      <div className="mt-2 flex items-center gap-2">
        {/* "Now" button - highlighted when selected (value is null) */}
        <button
          className={`px-3 py-2 rounded-lg border ${
            !value ? 'border-[#4DA6FF]' : 'border-gray-200'
          }`}
          onClick={() => onChange?.(null)}
          aria-pressed={!value}
        >
          Now
        </button>
        
        {/* Date and time picker for scheduled rides */}
        <label className="flex-1">
          <span className="sr-only">Pick date and time</span>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg border border-gray-200"
            onChange={(e) => onChange?.(e.target.value)}
            value={value || ''}
            min={new Date().toISOString().slice(0, 16)} // Prevent past dates
          />
        </label>
      </div>
    </div>
  )
}

export default SchedulePicker