import React from 'react';
import PropTypes from 'prop-types';

/**
 * GradientBackground Component
 * 
 * A reusable component that provides consistent brand gradient backgrounds
 * across the application. Uses the brand color palette: Blue → Pink → Yellow → Aqua.
 * 
 * @param {Object} props - Component props
 * @param {string} props.direction - Gradient direction ('to-r', 'to-br', 'to-b', 'to-bl', 'to-l', 'to-tl', 'to-t', 'to-tr')
 * @param {number} props.opacity - Opacity level (0-100)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.variant - Gradient variant ('primary', 'secondary', 'ambient')
 * @returns {JSX.Element} Gradient background component
 */
const GradientBackground = ({ 
  direction = 'to-br', 
  opacity = 20, 
  className = '', 
  children, 
  variant = 'primary' 
}) => {
  // Define gradient variants based on brand colors
  const gradientVariants = {
    // Primary brand gradient: Blue → Pink → Yellow → Aqua
    primary: `from-brand-primary via-brand-secondary to-brand-accent`,
    // Secondary gradient: Pink → Yellow → Blue
    secondary: `from-brand-secondary via-brand-accent to-brand-primary`,
    // Ambient gradient for subtle backgrounds
    ambient: `from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10`
  };

  // Construct the gradient classes
  const gradientClasses = `bg-gradient-${direction} ${gradientVariants[variant]}`;
  
  // Apply opacity if not using ambient variant
  const opacityClass = variant !== 'ambient' ? `opacity-${opacity}` : '';
  
  // Combine all classes
  const combinedClasses = `${gradientClasses} ${opacityClass} ${className}`.trim();

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

GradientBackground.propTypes = {
  direction: PropTypes.oneOf([
    'to-r', 'to-br', 'to-b', 'to-bl', 
    'to-l', 'to-tl', 'to-t', 'to-tr'
  ]),
  opacity: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ambient'])
};

export default GradientBackground;