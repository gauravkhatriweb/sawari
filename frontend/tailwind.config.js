/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Brand colors from design system
        brand: {
          primary: '#4DA6FF',
          secondary: '#EFBFFF', 
          accent: '#FFD65C',
          aqua: '#7CE7E1',
          'neutral-dark': '#1A1A1A',
          'pure-white': '#FFFFFF',
        },
        // Glass effect colors
        glass: {
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          'hover-bg': 'var(--glass-hover-bg)',
        },
        // Theme-aware colors using CSS variables
        theme: {
          'bg-base': 'var(--bg-base)',
          'bg-elevated': 'var(--bg-elevated)',
          'surface-base': 'var(--surface-base)',
          'surface-elevated': 'var(--surface-elevated)',
          'surface-card': 'var(--surface-card)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-subtle': 'var(--text-subtle)',
          'border-base': 'var(--border-base)',
          'border-subtle': 'var(--border-subtle)',
        },
        // Status colors
        success: '#10B981',
        warning: '#F59E0B', 
        error: '#EF4444',
        info: '#4DA6FF',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-cta': 'var(--gradient-cta)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-brand-flow': 'var(--gradient-brand-flow)',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      backdropBlur: {
        'theme': '12px',
        'theme-light': '8px',
      },
    },
  },
  plugins: [],
}