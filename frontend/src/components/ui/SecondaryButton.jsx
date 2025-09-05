import React from 'react';

/**
 * SecondaryButton component - Provides consistent secondary button styling
 * with glassmorphism effects matching the design system
 */
const SecondaryButton = ({ 
  children, 
  className = '', 
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  variant = 'glass', // 'glass' or 'outline'
  ...props 
}) => {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    glass: `
      bg-white/5 backdrop-blur-md border border-white/10
      text-theme-primary
      hover:bg-white/10 hover:border-white/20
    `,
    outline: `
      bg-transparent border-2 border-[#FF6B9D]
      text-[#FF6B9D]
      hover:bg-[#FF6B9D] hover:text-white
    `
  };

  const baseClasses = `
    font-semibold font-['Poppins',sans-serif]
    rounded-xl
    shadow-[0_4px_15px_rgba(0,0,0,0.1)]
    hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]
    hover:scale-[1.02]
    active:scale-[0.98]
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:hover:scale-100 disabled:hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]
    focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2
  `;
  
  return (
    <button 
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default SecondaryButton;