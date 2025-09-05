/**
 * FareBreakdownCard.jsx - Fare Breakdown Display Component
 * 
 * A component that displays a detailed breakdown of ride fare calculations,
 * including base fare, distance charges, time charges, and total estimate.
 * Features clean formatting with PKR currency display and responsive design.
 * 
 * Key Features:
 * - Detailed fare breakdown with itemized charges
 * - PKR currency formatting with proper symbols
 * - Clean, card-based design with borders and spacing
 * - Responsive layout with proper typography
 * - Disclaimer text for estimate accuracy
 * - Conditional rendering based on fare data availability
 * 
 * Usage:
 * ```jsx
 * <FareBreakdownCard
 *   fare={{
 *     base: 50,
 *     perKm: 15,
 *     perMin: 2,
 *     distanceKm: 5.2,
 *     durationMin: 12,
 *     total: 152
 *   }}
 * />
 * ```
 */

import React from 'react'
import { formatPKRDisplay } from '../utils/currency'

/**
 * Row Component - Internal component for displaying label-value pairs
 * @param {string} label - The label text to display
 * @param {string} value - The formatted value to display
 * @param {boolean} strong - Whether to apply bold styling
 * @returns {JSX.Element} Formatted row with label and value
 */
const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between py-1">
    <span className={`text-sm ${strong ? 'font-semibold' : 'text-gray-600'}`}>{label}</span>
    <span className={`text-sm ${strong ? 'font-semibold' : 'text-gray-800'}`}>{value}</span>
  </div>
)

/**
 * FareBreakdownCard Component
 * 
 * Displays a comprehensive breakdown of ride fare calculations with itemized charges.
 * Returns null if no fare data is provided for graceful handling.
 * 
 * @param {Object} fare - Fare calculation object
 * @param {number} fare.base - Base fare amount in PKR
 * @param {number} fare.perKm - Rate per kilometer in PKR
 * @param {number} fare.perMin - Rate per minute in PKR
 * @param {number} fare.distanceKm - Total distance in kilometers
 * @param {number} fare.durationMin - Total duration in minutes
 * @param {number} fare.total - Total calculated fare in PKR
 * @returns {JSX.Element|null} Fare breakdown card or null if no fare data
 */
const FareBreakdownCard = ({ fare }) => {
  // Return null if no fare data is provided
  if (!fare) return null
  
  // Destructure fare object for easier access
  const { base, perKm, perMin, distanceKm, durationMin, total } = fare
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <h4 className="font-semibold mb-2">Fare estimate</h4>
      <Row label="Base fare" value={formatPKRDisplay(base)} />
      <Row label={`Per km x ${distanceKm} km`} value={formatPKRDisplay(perKm * distanceKm)} />
      <Row label={`Per min x ${durationMin} min`} value={formatPKRDisplay(perMin * durationMin)} />
      <div className="h-px bg-gray-200 my-2" />
      <Row label="Estimated total" value={formatPKRDisplay(total)} strong />
      <p className="text-[12px] text-gray-500 mt-1">Prices may vary due to traffic and demand. This is a demo estimate.</p>
    </div>
  )
}

export default FareBreakdownCard