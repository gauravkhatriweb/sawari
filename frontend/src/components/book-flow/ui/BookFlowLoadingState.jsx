import React from 'react';
import { motion } from 'framer-motion';

/**
 * BookFlowLoadingState - Comprehensive loading indicators and skeleton loaders
 * for the booking flow with glassmorphism styling
 */

// Skeleton shimmer animation
const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut'
    }
  }
};

// Pulse animation for loading indicators
const pulseVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.2,
      ease: 'easeInOut'
    }
  }
};

// Spinner component with glassmorphism
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <svg className="w-full h-full text-brand-primary" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// Skeleton base component
const SkeletonBase = ({ className = '', children }) => (
  <div className={`relative overflow-hidden bg-theme-surface-elevated/50 rounded-xl ${className}`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
    />
    {children}
  </div>
);

// Search bar skeleton
const SearchBarSkeleton = () => (
  <div className="space-y-3">
    <SkeletonBase className="h-14 w-full" />
    <div className="space-y-2">
      <SkeletonBase className="h-12 w-full" />
      <SkeletonBase className="h-12 w-4/5" />
      <SkeletonBase className="h-12 w-3/4" />
    </div>
  </div>
);

// Vehicle card skeleton
const VehicleCardSkeleton = () => (
  <div className="flex gap-3 overflow-x-auto pb-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex-shrink-0">
        <SkeletonBase className="w-64 h-32 p-4">
          <div className="flex justify-between items-start mb-3">
            <SkeletonBase className="w-16 h-6" />
            <SkeletonBase className="w-12 h-6" />
          </div>
          <SkeletonBase className="w-24 h-4 mb-2" />
          <SkeletonBase className="w-20 h-4" />
        </SkeletonBase>
      </div>
    ))}
  </div>
);

// Fare breakdown skeleton
const FareBreakdownSkeleton = () => (
  <SkeletonBase className="p-6">
    <SkeletonBase className="w-32 h-6 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <SkeletonBase className="w-24 h-4" />
          <SkeletonBase className="w-16 h-4" />
        </div>
      ))}
    </div>
    <div className="border-t border-theme-border mt-4 pt-4">
      <div className="flex justify-between">
        <SkeletonBase className="w-20 h-5" />
        <SkeletonBase className="w-20 h-5" />
      </div>
    </div>
  </SkeletonBase>
);

// Map loading skeleton
const MapSkeleton = () => (
  <SkeletonBase className="w-full h-full relative">
    <div className="absolute inset-4">
      <SkeletonBase className="w-32 h-8 mb-4" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBase key={i} className="h-6" />
        ))}
      </div>
      <SkeletonBase className="w-24 h-6" />
    </div>
  </SkeletonBase>
);

// Full page loading overlay
const PageLoadingOverlay = ({ message = 'Loading booking interface...' }) => (
  <motion.div
    className="fixed inset-0 z-loading bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-aqua/20 backdrop-theme flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="glass-card rounded-2xl p-8 text-center max-w-sm mx-4"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <LoadingSpinner size="xl" className="mx-auto mb-6" />
      <motion.p
        className="text-theme-secondary font-inter text-lg"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        {message}
      </motion.p>
    </motion.div>
  </motion.div>
);

// Inline loading indicator
const InlineLoader = ({ 
  message = 'Loading...', 
  size = 'md', 
  className = '',
  showSpinner = true 
}) => (
  <motion.div
    className={`flex items-center gap-3 ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {showSpinner && <LoadingSpinner size={size} />}
    <motion.span
      className="text-theme-secondary font-inter"
      variants={pulseVariants}
      initial="initial"
      animate="animate"
    >
      {message}
    </motion.span>
  </motion.div>
);

// Button loading state
const ButtonLoader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};

// Step loading indicator
const StepLoader = ({ step, message }) => (
  <motion.div
    className="glass-card rounded-xl p-6 text-center"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
        <span className="text-brand-primary font-semibold text-sm">{step}</span>
      </div>
      <LoadingSpinner size="md" />
    </div>
    <p className="text-theme-secondary font-inter">{message}</p>
  </motion.div>
);

// Error state with retry
const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry, 
  className = '' 
}) => (
  <motion.div
    className={`glass-card rounded-xl p-6 text-center ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <p className="text-theme-secondary font-inter mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-inter font-medium"
      >
        Try Again
      </button>
    )}
  </motion.div>
);

// Main export object
const BookFlowLoadingState = {
  Spinner: LoadingSpinner,
  Skeleton: {
    Base: SkeletonBase,
    SearchBar: SearchBarSkeleton,
    VehicleCard: VehicleCardSkeleton,
    FareBreakdown: FareBreakdownSkeleton,
    Map: MapSkeleton
  },
  PageOverlay: PageLoadingOverlay,
  Inline: InlineLoader,
  Button: ButtonLoader,
  Step: StepLoader,
  Error: ErrorState
};

export default BookFlowLoadingState;

// Individual exports for convenience
export {
  LoadingSpinner,
  SkeletonBase,
  SearchBarSkeleton,
  VehicleCardSkeleton,
  FareBreakdownSkeleton,
  MapSkeleton,
  PageLoadingOverlay,
  InlineLoader,
  ButtonLoader,
  StepLoader,
  ErrorState
};