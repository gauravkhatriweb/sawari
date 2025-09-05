import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPinIcon, PhoneIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import GlassCard from '../../components/GlassCard'
import RideStepper, { useRideStepper } from './RideStepper'
import { formatPKRDisplay } from '../../utils/currency'

const ActiveRidePanel = ({ 
  isOnline, 
  onGoOnline, 
  rideState = 'waiting', // 'waiting', 'assigned', 'onTrip', 'completed'
  onStateChange,
  rideData = null 
}) => {
  const [tripTimer, setTripTimer] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reportType, setReportType] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  
  // Define ride steps for stepper
  const getRideSteps = () => {
    if (rideState === 'assigned') {
      return [
        {
          title: 'Navigate to Pickup',
          description: 'Drive to passenger pickup location',
          actionLabel: 'Start Navigation',
          content: ({ onComplete, isLoading }) => (
            <div className='space-y-4'>
              <div className='flex items-center space-x-3 p-3 bg-white/5 rounded-lg'>
                <MapPinIcon className='w-5 h-5 text-brand-blue' />
                <div>
                  <p className='text-white font-medium'>{rideData?.pickup || 'Pickup Location'}</p>
                  <p className='text-white/60 text-sm'>ETA: 5 minutes</p>
                </div>
              </div>
              <button
                onClick={onComplete}
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-brand-blue to-brand-pink text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50'
              >
                {isLoading ? 'Starting Navigation...' : '🧭 Start Navigation'}
              </button>
            </div>
          )
        },
        {
          title: 'Arrive at Pickup',
          description: 'Confirm arrival and contact passenger',
          actionLabel: 'Confirm Arrival',
          content: ({ onComplete, isLoading }) => (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <button className='flex items-center justify-center space-x-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors'>
                  <PhoneIcon className='w-5 h-5 text-green-400' />
                  <span className='text-white text-sm'>Call</span>
                </button>
                <button className='flex items-center justify-center space-x-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors'>
                  <ChatBubbleLeftIcon className='w-5 h-5 text-blue-400' />
                  <span className='text-white text-sm'>Message</span>
                </button>
              </div>
              <button
                onClick={onComplete}
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50'
              >
                {isLoading ? 'Confirming...' : '✅ I\'ve Arrived'}
              </button>
            </div>
          )
        },
        {
          title: 'Start Trip',
          description: 'Passenger is in the vehicle, begin the trip',
          actionLabel: 'Start Trip',
          content: ({ onComplete, isLoading }) => (
            <div className='space-y-4'>
              <div className='p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg'>
                <p className='text-yellow-200 text-sm'>⚠️ Ensure passenger is safely seated before starting</p>
              </div>
              <button
                onClick={() => {
                  onComplete();
                  onStateChange('onTrip');
                }}
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-brand-blue to-brand-pink text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50'
              >
                {isLoading ? 'Starting Trip...' : '🚗 Start Trip'}
              </button>
            </div>
          )
        }
      ];
    }
    
    if (rideState === 'onTrip') {
      return [
        {
          title: 'Navigate to Destination',
          description: 'Drive to passenger drop-off location',
          actionLabel: 'Continue Navigation',
          content: ({ onComplete, isLoading }) => (
            <div className='space-y-4'>
              <div className='flex items-center space-x-3 p-3 bg-white/5 rounded-lg'>
                <MapPinIcon className='w-5 h-5 text-brand-pink' />
                <div>
                  <p className='text-white font-medium'>{rideData?.destination || 'Destination'}</p>
                  <p className='text-white/60 text-sm'>ETA: 12 minutes</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <button className='flex items-center justify-center space-x-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors'>
                  <PhoneIcon className='w-5 h-5 text-green-400' />
                  <span className='text-white text-sm'>Call</span>
                </button>
                <button className='flex items-center justify-center space-x-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors'>
                  <ChatBubbleLeftIcon className='w-5 h-5 text-blue-400' />
                  <span className='text-white text-sm'>Message</span>
                </button>
              </div>
              <button
                onClick={onComplete}
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-brand-blue to-brand-pink text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50'
              >
                {isLoading ? 'Navigating...' : '🧭 Continue to Destination'}
              </button>
            </div>
          )
        },
        {
          title: 'Arrive at Destination',
          description: 'Safely complete the trip',
          actionLabel: 'End Trip',
          content: ({ onComplete, isLoading }) => (
            <div className='space-y-4'>
              <div className='p-3 bg-green-500/20 border border-green-500/30 rounded-lg'>
                <p className='text-green-200 text-sm'>🎯 You\'ve arrived at the destination</p>
              </div>
              <button
                onClick={() => {
                  onComplete();
                  onStateChange('completed');
                }}
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50'
              >
                {isLoading ? 'Ending Trip...' : '🏁 End Trip'}
              </button>
            </div>
          )
        }
      ];
    }
    
    return [];
  };

  // Stepper for ride progression
  const {
    currentStep,
    goToStep,
    nextStep,
    completeStep,
    resetStepper,
    updateSteps
  } = useRideStepper(getRideSteps());

  // Update steps when ride state changes
  useEffect(() => {
    updateSteps(getRideSteps());
    resetStepper();
  }, [rideState]);

  // Trip timer for onTrip state
  useEffect(() => {
    let interval = null
    if (rideState === 'onTrip') {
      interval = setInterval(() => {
        setTripTimer(prev => prev + 1)
      }, 1000)
    } else {
      setTripTimer(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [rideState])

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle state transitions
  const handleStateTransition = async (newState, delay = 1000) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, delay))
    setIsLoading(false)
    onStateChange?.(newState)
  }

  // Report Issue Modal
  const ReportModal = () => (
    <AnimatePresence>
      {showReportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-4">Report an Issue</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                🚗 Vehicle Problem
              </button>
              <button className="w-full text-left p-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                👤 Passenger Issue
              </button>
              <button className="w-full text-left p-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                📍 Navigation Problem
              </button>
              <button className="w-full text-left p-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                🆘 Emergency
              </button>
            </div>
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full mt-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Waiting State - Captain is offline or online but no ride
  const WaitingState = () => (
    <motion.div
      key="waiting"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="text-4xl mb-4">🚗</div>
      <h3 className="text-xl font-bold text-white mb-2">
        {isOnline ? 'Waiting for Ride Requests' : 'You are Offline'}
      </h3>
      <p className="text-white/70 mb-6">
        {isOnline 
          ? 'Stay online to receive ride requests from nearby passengers.'
          : 'Go online to start receiving ride requests and earn money.'
        }
      </p>
      {!isOnline && (
        <button
          onClick={onGoOnline}
          disabled={isLoading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
        >
          {isLoading ? 'Going Online...' : '🟢 Go Online'}
        </button>
      )}
    </motion.div>
  )

  // Assigned State - Ride assigned, navigate to pickup
  const AssignedState = () => (
    <motion.div
      key="assigned"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Ride Assigned</h3>
        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
          Pickup
        </span>
      </div>
      
      {/* Passenger Card */}
      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {rideData?.passenger?.name?.charAt(0) || 'P'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold">{rideData?.passenger?.name || 'Passenger'}</h4>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-white/80 text-sm">{rideData?.passenger?.rating || '4.8'}</span>
            </div>
          </div>
        </div>
        
        {/* Trip Details */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-2 bg-white/5 rounded">
            <span className="text-white/60 text-sm">Destination:</span>
            <span className="text-white font-medium text-sm">{rideData?.dropoff?.address || 'DHA Phase 5'}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/5 rounded">
            <span className="text-white/60 text-sm">Fare:</span>
            <span className="text-white font-medium text-sm">{formatPKRDisplay(rideData?.fare || 450)}</span>
          </div>
        </div>
      </div>
      
      {/* Progressive Stepper */}
      <RideStepper
        steps={getRideSteps()}
        currentStep={currentStep}
        onStepComplete={(stepIndex) => {
          completeStep(stepIndex);
          if (stepIndex < getRideSteps().length - 1) {
            setTimeout(() => nextStep(), 500);
          }
        }}
        onStepChange={goToStep}
        showProgressBar={true}
        className='mb-6'
      />
      
      {/* Help Link */}
      <div className="text-center">
        <button
          onClick={() => setShowReportModal(true)}
          className="text-white/60 hover:text-white text-sm underline transition-colors"
        >
          Report Issue / Need Help?
        </button>
      </div>
    </motion.div>
  )

  // OnTrip State - Trip in progress
  const OnTripState = () => (
    <motion.div
      key="onTrip"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Trip in Progress</h3>
        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
          On Trip
        </span>
      </div>
      
      {/* Trip Timer */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 text-center border border-green-400/30">
        <div className="text-3xl font-bold text-white mb-2">{formatTime(tripTimer)}</div>
        <div className="text-green-400 font-medium">Trip Duration</div>
      </div>
      
      {/* Passenger Info */}
      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold">{rideData?.passenger?.name || 'Passenger'}</h4>
            <p className="text-white/70 text-sm">Going to {rideData?.dropoff?.address || 'DHA Phase 5'}</p>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">{formatPKRDisplay(rideData?.fare || 450)}</div>
            <div className="text-white/70 text-sm">{rideData?.tripDistance || '8.2 km'}</div>
          </div>
        </div>
      </div>
      
      {/* Progressive Stepper */}
      <RideStepper
        steps={getRideSteps()}
        currentStep={currentStep}
        onStepComplete={(stepIndex) => {
          completeStep(stepIndex);
          if (stepIndex < getRideSteps().length - 1) {
            setTimeout(() => nextStep(), 500);
          }
        }}
        onStepChange={goToStep}
        showProgressBar={true}
        className='mb-6'
      />
      
      {/* Help Link */}
      <div className="text-center">
        <button
          onClick={() => setShowReportModal(true)}
          className="text-white/60 hover:text-white text-sm underline transition-colors"
        >
          Report Issue / Need Help?
        </button>
      </div>
    </motion.div>
  )

  // Completed State - Trip summary
  const CompletedState = () => (
    <motion.div
      key="completed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">Trip Completed!</h3>
        <p className="text-white/70">Great job! Your earnings have been updated.</p>
      </div>
      
      {/* Trip Summary */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30">
        <h4 className="text-lg font-bold text-white mb-4">Trip Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/80">Passenger:</span>
            <span className="text-white font-medium">{rideData?.passenger?.name || 'Passenger'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Distance:</span>
            <span className="text-white font-medium">{rideData?.tripDistance || '8.2 km'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Duration:</span>
            <span className="text-white font-medium">{formatTime(tripTimer)}</span>
          </div>
          <div className="border-t border-white/20 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Total Fare:</span>
              <span className="text-white font-bold text-xl">{formatPKRDisplay(rideData?.fare || 450)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Button */}
      <button
        onClick={() => handleStateTransition('waiting')}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
      >
        {isLoading ? 'Getting Ready...' : '🚗 Ready for Next Ride'}
      </button>
    </motion.div>
  )

  const renderState = () => {
    switch (rideState) {
      case 'waiting':
        return <WaitingState />
      case 'assigned':
        return <AssignedState />
      case 'onTrip':
        return <OnTripState />
      case 'completed':
        return <CompletedState />
      default:
        return <WaitingState />
    }
  }

  return (
    <>
      <GlassCard padding='xl'>
        <AnimatePresence mode="wait">
          {renderState()}
        </AnimatePresence>
      </GlassCard>
      
      <ReportModal />
    </>
  )
}

export default ActiveRidePanel