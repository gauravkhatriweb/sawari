/**
 * main.jsx - Application Entry Point
 * 
 * This is the main entry point for the Sawari ride-hailing application. It initializes
 * the React application with all necessary providers, theme configuration, and global
 * toast notifications. The app uses a dark theme by default with glassmorphism design.
 * 
 * Key Features:
 * - Theme initialization and persistence
 * - React Router for client-side navigation
 * - User context for authentication state management
 * - Global toast notifications with custom styling
 * - Dark mode with CSS custom properties
 */

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { UserProvider } from './context/UserContext.jsx'

/**
 * Initialize Theme Configuration
 * 
 * Sets up the application theme on initial load. Reads the saved theme preference
 * from localStorage (defaults to 'dark') and applies the appropriate CSS classes
 * to the document element for consistent theming across the application.
 * 
 * The theme system uses CSS custom properties defined in index.css and applies
 * both theme-specific classes and the 'dark' class for Tailwind compatibility.
 */
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.documentElement.className = `theme-${savedTheme}`
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Apply theme before rendering to prevent flash of unstyled content
initializeTheme()

/**
 * Render Application
 * 
 * Creates the React root and renders the application with all necessary providers:
 * 
 * - BrowserRouter: Enables client-side routing for SPA navigation
 * - UserProvider: Manages global user authentication state for both passengers and captains
 * - ToastContainer: Provides global toast notifications with glassmorphism styling
 * 
 * The toast configuration matches the app's design system with dark theme,
 * glassmorphism effects, and consistent spacing.
 */
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
    {/* Global Toast Notifications with Glassmorphism Styling */}
    <ToastContainer
      position="top-right"
      autoClose={2500}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastStyle={{
        background: 'var(--surface-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-base)',
        backdropFilter: 'blur(12px)'
      }}
      bodyStyle={{ fontSize: '0.9rem' }}
    />
  </BrowserRouter>
)
