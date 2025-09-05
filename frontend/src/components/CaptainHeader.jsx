/**
 * CaptainHeader.jsx - Captain Dashboard Header Component
 * 
 * A comprehensive header component for the captain dashboard in the Sawari platform.
 * Displays captain profile information, online status toggle, notifications, and statistics.
 * Features smooth animations, responsive design, and real-time status updates.
 * 
 * Key Features:
 * - Captain profile display with avatar and initials fallback
 * - Online/offline status toggle with loading states
 * - Real-time notification system with badge counts
 * - Captain statistics (rating, total rides, years active)
 * - Account verification status indicator
 * - Responsive design for mobile and desktop
 * - Smooth animations using Framer Motion
 * - Glassmorphism styling effects
 * 
 * Captain Information Displayed:
 * - Profile picture or initials
 * - Name and verification status
 * - Star rating with visual indicators
 * - Total rides completed
 * - Years of service
 * - Current online status
 * 
 * Usage:
 * ```jsx
 * <CaptainHeader
 *   captain={captainData}
 *   isOnline={onlineStatus}
 *   notificationCount={unreadCount}
 *   notifications={notificationsList}
 *   onToggleOnline={() => toggleOnlineStatus()}
 *   onNotificationClick={() => openNotifications()}
 * />
 * ```
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * CaptainHeader Component
 * 
 * Main header component for captain dashboard with profile, status, and notifications.
 * 
 * @param {Object} captain - Captain profile data
 * @param {boolean} isOnline - Current online status
 * @param {number} notificationCount - Number of unread notifications
 * @param {boolean} showNotifications - Whether notifications panel is visible
 * @param {Array} notifications - List of notifications
 * @param {Function} onNotificationClick - Callback for notification bell click
 * @param {Function} onClearNotifications - Callback for clearing notifications
 * @param {Function} onToggleOnline - Callback for online status toggle
 * @param {boolean} statusLoading - Whether status change is in progress
 */
const CaptainHeader = ({
  captain = {},
  isOnline = false,
  notificationCount = 0,
  showNotifications = false,
  notifications = [],
  onNotificationClick = () => {},
  onClearNotifications = () => {},
  onToggleOnline = () => {},
  statusLoading = false
}) => {
  // Destructure captain data with defaults
  const {
    firstname = 'Captain',
    lastname = '',
    rating = 5.0,
    profilePic = null,
    totalRides = 0,
    yearsActive = 0,
    isAccountVerified = false
  } = captain

  /**
   * Generate initials from captain's first and last name
   * Used as fallback when profile picture is not available
   * @returns {string} Capitalized initials (e.g., "JD" for John Doe)
   */
  const getInitials = () => {
    const first = firstname?.charAt(0)?.toUpperCase() || 'C'
    const last = lastname?.charAt(0)?.toUpperCase() || ''
    return first + last
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6'
    >
      <div className='flex items-center gap-3 sm:gap-4'>
        {/* Captain Profile Avatar */}
        <div className='relative'>
          <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-card flex items-center justify-center border-2 glass-border shadow-lg'>
            {profilePic ? (
              <img 
                src={`http://localhost:3000${profilePic}`}
                alt='Captain Profile'
                className='w-full h-full object-cover'
              />
            ) : (
              <span className='text-lg sm:text-2xl font-bold text-white'>
                {getInitials()}
              </span>
            )}
          </div>
          
          {/* Verification Badge - Meta-style blue tick */}
          {isAccountVerified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className='absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-theme-base shadow-lg'
              style={{
                background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)'
              }}
            >
              <svg 
                className='w-3 h-3 sm:w-4 sm:h-4 text-white' 
                fill='currentColor' 
                viewBox='0 0 20 20'
                aria-label='Verified account'
              >
                <path 
                  fillRule='evenodd' 
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' 
                  clipRule='evenodd' 
                />
              </svg>
            </motion.div>
          )}
          
          {/* Online Status Indicator */}
          <div className={`absolute ${isAccountVerified ? '-bottom-1 -left-1' : '-bottom-1 -right-1'} w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-theme-base flex items-center justify-center transition-all duration-300 ${
            isOnline ? 'bg-green-500 shadow-green-400/50 shadow-lg' : 'bg-gray-500'
          }`}>
            <span className='text-xs'>
              {isOnline ? '✓' : '○'}
            </span>
          </div>
        </div>

        {/* Captain Info */}
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-lg sm:text-xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Welcome, {firstname}!
            </h1>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <div className='flex items-center gap-1'>
              <span className='text-yellow-400'>⭐</span>
              <span className='text-xs sm:text-sm text-gray-300 font-medium'>
                {rating.toFixed(1)}
              </span>
            </div>
            <span className='text-xs text-gray-500'>•</span>
            <span className='text-xs sm:text-sm text-gray-300'>
              {totalRides} rides
            </span>
            {yearsActive > 0 && (
              <>
                <span className='text-xs text-gray-500'>•</span>
                <span className='text-xs sm:text-sm text-gray-300'>
                  {yearsActive} years
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications & Online Toggle */}
      <div className='flex items-center gap-3 justify-between sm:justify-end'>
        {/* Online Toggle Button */}
        <button
          onClick={onToggleOnline}
          disabled={statusLoading}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            isOnline 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
          } ${statusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {statusLoading ? (
            <svg className='w-4 h-4 animate-spin' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
          ) : (
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-gray-400'
            }`} />
          )}
          <span className='hidden sm:inline'>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </button>

        {/* Notifications Bell */}
        <div className='relative'>
          <button
            onClick={onNotificationClick}
            className='relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg border border-white/10'
            aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
          >
            <span className='text-lg sm:text-xl'>🔔</span>
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className='absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full text-xs sm:text-sm flex items-center justify-center text-white font-bold shadow-lg'
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </motion.span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className='absolute right-0 top-12 sm:top-14 w-72 sm:w-80 rounded-xl bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 shadow-xl z-50'
              >
                <div className='p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-lg font-semibold text-white'>Notifications</h3>
                    {notificationCount > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className='text-xs text-blue-400 hover:text-blue-300 transition-colors'
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  
                  {notifications.length > 0 ? (
                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className='p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors'
                        >
                          <div className='flex items-start gap-3'>
                            <span className='text-lg flex-shrink-0'>{notification.icon}</span>
                            <div className='flex-1 min-w-0'>
                              <h4 className='text-sm font-medium text-white truncate'>
                                {notification.title}
                              </h4>
                              <p className='text-xs text-gray-300 mt-1 line-clamp-2'>
                                {notification.message}
                              </p>
                              <span className='text-xs text-gray-400 mt-1 block'>
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-6'>
                      <span className='text-4xl block mb-2'>🔕</span>
                      <p className='text-gray-400 text-sm'>No notifications</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default CaptainHeader