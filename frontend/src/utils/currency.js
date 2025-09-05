/**
 * Currency formatting utilities for PKR (Pakistani Rupee)
 */

/**
 * Format a number as PKR currency with consistent styling
 * @param {number|string} amount - The amount to format
 * @param {object} options - Formatting options
 * @param {boolean} options.showSymbol - Whether to show PKR symbol (default: true)
 * @param {boolean} options.useCommas - Whether to use thousand separators (default: true)
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted currency string
 */
export const formatPKR = (amount, options = {}) => {
  const {
    showSymbol = true,
    useCommas = true,
    decimals = 0
  } = options

  // Convert to number and handle invalid inputs
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return showSymbol ? 'PKR 0' : '0'

  // Format the number
  let formatted = numAmount.toFixed(decimals)
  
  if (useCommas) {
    // Add thousand separators
    formatted = numAmount.toLocaleString('en-PK', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  return showSymbol ? `PKR ${formatted}` : formatted
}

/**
 * Format PKR for display in UI components
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency with PKR prefix and commas
 */
export const formatPKRDisplay = (amount) => {
  return formatPKR(amount, { showSymbol: true, useCommas: true, decimals: 0 })
}

/**
 * Format PKR for calculations (no symbol, no commas)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency without symbol
 */
export const formatPKRValue = (amount) => {
  return formatPKR(amount, { showSymbol: false, useCommas: false, decimals: 0 })
}

/**
 * Format PKR with decimals for precise calculations
 * @param {number|string} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency with decimals
 */
export const formatPKRPrecise = (amount, decimals = 2) => {
  return formatPKR(amount, { showSymbol: true, useCommas: true, decimals })
}

/**
 * Parse PKR string back to number
 * @param {string} pkrString - PKR formatted string (e.g., "PKR 1,500")
 * @returns {number} Parsed number value
 */
export const parsePKR = (pkrString) => {
  if (typeof pkrString !== 'string') return 0
  
  // Remove PKR prefix and commas, then parse
  const cleanString = pkrString.replace(/PKR\s?|,/g, '').trim()
  const parsed = parseFloat(cleanString)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Validate if a PKR amount is valid
 * @param {number|string} amount - Amount to validate
 * @param {object} options - Validation options
 * @param {number} options.min - Minimum allowed value (default: 0)
 * @param {number} options.max - Maximum allowed value (default: Infinity)
 * @returns {boolean} Whether the amount is valid
 */
export const isValidPKRAmount = (amount, options = {}) => {
  const { min = 0, max = Infinity } = options
  
  const numAmount = typeof amount === 'string' ? parsePKR(amount) : amount
  
  return !isNaN(numAmount) && numAmount >= min && numAmount <= max
}

/**
 * Format PKR for different contexts
 */
export const PKRFormatter = {
  // For display in cards, lists, etc.
  display: formatPKRDisplay,
  
  // For form inputs and calculations
  value: formatPKRValue,
  
  // For precise financial calculations
  precise: formatPKRPrecise,
  
  // Parse back to number
  parse: parsePKR,
  
  // Validate amount
  validate: isValidPKRAmount
}

export default PKRFormatter