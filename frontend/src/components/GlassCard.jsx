import React from 'react';

/**
 * GlassCard Component
 * 
 * A reusable glassmorphism card component that provides consistent glass effects
 * across the application. Features backdrop blur, subtle borders, and responsive design.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Card size ('sm', 'md', 'lg', 'xl', 'full')
 * @param {string} props.blur - Blur intensity ('sm', 'md', 'lg', 'xl')
 * @param {number} props.opacity - Background opacity (5-30)
 * @param {boolean} props.border - Whether to show border
 * @param {string} props.padding - Padding size ('sm', 'md', 'lg', 'xl')
 * @param {boolean} props.rounded - Whether to apply rounded corners
 * @param {boolean} props.shadow - Whether to apply shadow
 * @returns {JSX.Element} Glass card component
 */
const GlassCard = ({
  children,
  className = '',
  size = 'md',
  blur = 'md',
  opacity = 10,
  border = true,
  padding = 'md',
  rounded = true,
  shadow = true
}) => {
  // Size variants for responsive width
  const sizeVariants = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    full: 'w-full'
  };

  // Blur intensity variants
  const blurVariants = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  // Padding variants
  const paddingVariants = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  // Base glass styles using canonical theme tokens
  const baseClasses = [
    // Canonical glassmorphism background
    'glass-card',
    // Size
    sizeVariants[size],
    // Padding
    paddingVariants[padding]
  ];

  // Conditional styles
  if (!border) {
    baseClasses.push('border-none');
  }

  if (!rounded) {
    baseClasses.push('rounded-none');
  }

  if (!shadow) {
    baseClasses.push('shadow-none');
  }

  // Override blur if different from canonical
  if (blur !== 'md') {
    baseClasses.push(blurVariants[blur]);
  }

  // Combine all classes
  const combinedClasses = [...baseClasses, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};



export default GlassCard;