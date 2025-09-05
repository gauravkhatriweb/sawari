import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';

const RideStepper = ({
  steps = [],
  currentStep = 0,
  onStepComplete,
  onStepChange,
  className = '',
  showProgressBar = true,
  allowSkip = false,
  autoAdvance = false,
  autoAdvanceDelay = 3000
}) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const stepRefs = useRef([]);
  const timeoutRef = useRef(null);

  // Auto-advance functionality
  useEffect(() => {
    if (autoAdvance && currentStep < steps.length - 1 && !isTransitioning) {
      timeoutRef.current = setTimeout(() => {
        handleStepComplete(currentStep);
      }, autoAdvanceDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStep, autoAdvance, autoAdvanceDelay, isTransitioning]);

  // Focus management for accessibility
  useEffect(() => {
    if (stepRefs.current[currentStep]) {
      stepRefs.current[currentStep].focus();
    }
  }, [currentStep]);

  const handleStepComplete = async (stepIndex) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    
    // Call completion callback
    if (onStepComplete) {
      await onStepComplete(stepIndex, steps[stepIndex]);
    }
    
    // Move to next step if available
    if (stepIndex < steps.length - 1) {
      setTimeout(() => {
        if (onStepChange) {
          onStepChange(stepIndex + 1);
        }
        setIsTransitioning(false);
      }, 500); // Allow animation to complete
    } else {
      setIsTransitioning(false);
    }
  };

  const handleKeyDown = (event, stepIndex) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (stepIndex === currentStep && !completedSteps.has(stepIndex)) {
          handleStepComplete(stepIndex);
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        if (allowSkip && stepIndex < steps.length - 1) {
          if (onStepChange) {
            onStepChange(stepIndex + 1);
          }
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        if (allowSkip && stepIndex > 0) {
          if (onStepChange) {
            onStepChange(stepIndex - 1);
          }
        }
        break;
    }
  };

  const getStepStatus = (stepIndex) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return 'completed';
    return 'pending';
  };

  const isStepAccessible = (stepIndex) => {
    return stepIndex <= currentStep || allowSkip;
  };

  const progressPercentage = ((currentStep + (completedSteps.has(currentStep) ? 1 : 0)) / steps.length) * 100;

  return (
    <div className={`ride-stepper ${className}`} role="tablist" aria-label="Ride progress steps">
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white/80">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-white/80">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-blue to-brand-pink rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}

      {/* Steps Container */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isAccessible = isStepAccessible(index);
            const isVisible = index <= currentStep;

            if (!isVisible) return null;

            return (
              <motion.div
                key={`step-${index}`}
                ref={el => stepRefs.current[index] = el}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  step-container relative
                  ${status === 'current' ? 'ring-2 ring-brand-blue/50' : ''}
                  ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'}
                  rounded-lg overflow-hidden
                `}
                role="tab"
                tabIndex={isAccessible ? 0 : -1}
                aria-selected={status === 'current'}
                aria-expanded={status === 'current'}
                aria-label={`Step ${index + 1}: ${step.title}`}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {/* Step Header */}
                <div className="flex items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10">
                  {/* Step Number/Status Icon */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full mr-3 flex-shrink-0
                    ${status === 'completed' ? 'bg-green-500' : 
                      status === 'current' ? 'bg-brand-blue' : 'bg-white/20'}
                    transition-colors duration-300
                  `}>
                    {status === 'completed' ? (
                      <CheckIcon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Title and Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-semibold transition-colors duration-300
                      ${status === 'current' ? 'text-white' : 'text-white/80'}
                    `}>
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-sm text-white/60 mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center ml-3">
                    {status === 'completed' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </motion.div>
                    )}
                    {status === 'current' && !completedSteps.has(index) && (
                      <ChevronRightIcon className="w-5 h-5 text-white/60" />
                    )}
                  </div>
                </div>

                {/* Step Content - Only show for current step */}
                <AnimatePresence>
                  {status === 'current' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white/5 border-t border-white/10">
                        {/* Render step content */}
                        {typeof step.content === 'function' ? (
                          step.content({
                            onComplete: () => handleStepComplete(index),
                            isLoading: isTransitioning,
                            stepIndex: index
                          })
                        ) : (
                          <div>
                            {step.content}
                            {/* Default action button if no custom content */}
                            {!step.content && (
                              <button
                                onClick={() => handleStepComplete(index)}
                                disabled={isTransitioning}
                                className="
                                  w-full mt-4 bg-gradient-to-r from-brand-blue to-brand-pink 
                                  text-white py-3 px-6 rounded-lg font-medium 
                                  hover:opacity-90 transition-opacity 
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  focus:outline-none focus:ring-2 focus:ring-brand-blue/50
                                "
                              >
                                {isTransitioning ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                  </div>
                                ) : (
                                  step.actionLabel || 'Continue'
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {currentStep >= steps.length - 1 && completedSteps.has(steps.length - 1) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="text-lg font-semibold text-white mb-1">All Steps Completed!</h3>
            <p className="text-white/80 text-sm">Great job completing all the steps.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing stepper state
export const useRideStepper = (initialSteps = [], options = {}) => {
  const [currentStep, setCurrentStep] = useState(options.startStep || 0);
  const [steps, setSteps] = useState(initialSteps);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeStep = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const resetStepper = () => {
    setCurrentStep(options.startStep || 0);
    setCompletedSteps(new Set());
  };

  const updateSteps = (newSteps) => {
    setSteps(newSteps);
  };

  return {
    currentStep,
    steps,
    completedSteps,
    goToStep,
    nextStep,
    prevStep,
    completeStep,
    resetStepper,
    updateSteps,
    isCompleted: completedSteps.size === steps.length,
    progress: (completedSteps.size / steps.length) * 100
  };
};

export default RideStepper;