import React from 'react';

/**
 * PrimaryButton component - Provides consistent primary button styling
 * with gradients and hover effects matching the design system
 */
const PrimaryButton = ({ 
  children, 
  className = '', 
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const baseClasses = `
    bg-gradient-to-r from-[#FF6B9D] to-[#C147E9]
    text-white font-semibold font-['Poppins',sans-serif]
    rounded-xl
    shadow-[0_4px_15px_rgba(255,107,157,0.3)]
    hover:shadow-[0_8px_25px_rgba(255,107,157,0.4)]
    hover:scale-[1.02]
    active:scale-[0.98]
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:hover:scale-100 disabled:hover:shadow-[0_4px_15px_rgba(255,107,157,0.3)]
    focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/50 focus:ring-offset-2
  `;
  
  return (
    <button 
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;