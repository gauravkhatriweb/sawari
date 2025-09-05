import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../../components/GlassCard'

const OnlineToggle = ({ isOnline, onChange, disabled = false }) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingState, setPendingState] = useState(null)

  const handleToggleClick = () => {
    if (disabled || isLoading) return
    
    const newState = !isOnline
    setPendingState(newState)
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    setShowConfirmation(false)
    setIsLoading(true)
    
    try {
      // Call parent's onChange callback
      await onChange(pendingState)
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setIsLoading(false)
      setPendingState(null)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setPendingState(null)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggleClick()
    }
  }

  return (
    <>
      {/* Toggle Switch */}
      <div className='flex items-center gap-4'>
        <button
          onClick={handleToggleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          aria-pressed={isOnline}
          aria-label={isOnline ? 'Go offline' : 'Go online'}
          className={`
            relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-transparent
            ${isOnline 
              ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' 
              : 'bg-white/20 border border-white/30'
            }
            ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          `}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`
              inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 flex items-center justify-center
              ${isOnline ? 'translate-x-8' : 'translate-x-1'}
            `}
          >
            {isLoading ? (
              <svg className='w-3 h-3 animate-spin text-gray-600' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
            ) : (
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            )}
          </motion.div>
        </button>
        
        <div className='flex flex-col'>
          <span className='text-white font-medium text-lg'>
            {isLoading ? 'Switching...' : (isOnline ? 'Go Offline' : 'Go Online')}
          </span>
          <span className='text-white/60 text-sm'>
            {isOnline ? 'Stop receiving ride requests' : 'Start receiving ride requests'}
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={handleCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className='w-full max-w-md'
            >
              <GlassCard padding='xl'>
                <div className='text-center'>
                  <div className='text-4xl mb-4'>
                    {pendingState ? '🟢' : '🔴'}
                  </div>
                  <h3 className='text-xl font-bold text-white mb-2'>
                    Are you sure?
                  </h3>
                  <p className='text-white/80 mb-6'>
                    {pendingState 
                      ? 'You will start receiving ride requests from nearby passengers.'
                      : 'You will stop receiving new ride requests. Any active rides will continue.'
                    }
                  </p>
                  
                  <div className='flex gap-3'>
                    <button
                      onClick={handleCancel}
                      className='flex-1 py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`
                        flex-1 py-3 px-4 rounded-lg font-medium transition-colors
                        ${pendingState 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        }
                      `}
                    >
                      {pendingState ? 'Go Online' : 'Go Offline'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default OnlineToggle