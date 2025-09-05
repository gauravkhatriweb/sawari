/**
 * UserContext.jsx - Global Authentication State Management
 * 
 * This context provides centralized user authentication and session management for the
 * Sawari ride-hailing platform. It handles both passenger and captain authentication,
 * session persistence, and real-time profile updates across the application.
 * 
 * Key Features:
 * - Dual user type authentication (passengers and captains)
 * - Session persistence with localStorage/sessionStorage
 * - Remember me functionality
 * - Real-time profile synchronization
 * - Automatic session restoration on app load
 * - Secure logout with cleanup
 * 
 * Authentication Flow:
 * 1. User logs in via loginPassenger() or loginCaptain()
 * 2. Session data is stored based on "remember me" preference
 * 3. On app reload, session is automatically restored
 * 4. Profile updates sync across all components
 * 5. Logout clears all stored session data
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

// Configure axios instance for API communication
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // Include cookies for session management
})

// Create authentication context
const UserContext = createContext(null)

/**
 * UserProvider Component
 * 
 * Provides authentication context to the entire application. Manages user state,
 * authentication status, and session persistence for both passengers and captains.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that need access to auth context
 * @returns {JSX.Element} Context provider wrapping children
 */
export const UserProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null) // Current user object (passenger or captain)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Authentication status
  const [loading, setLoading] = useState(false) // Loading state for auth operations
  const [isInitialized, setIsInitialized] = useState(false) // Track if auth state has been initialized

  /**
   * Session Restoration Effect
   * 
   * Automatically restores user session on app load by checking both localStorage
   * and sessionStorage. Prioritizes localStorage (remember me) over sessionStorage.
   * Handles corrupt storage gracefully and always marks initialization as complete.
   */
  useEffect(() => {
    try {
      const rawLocal = localStorage.getItem('sawari_auth')
      const rawSession = sessionStorage.getItem('sawari_auth')
      const raw = rawLocal || rawSession
      
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.type && parsed?.user) {
          setUser(parsed.user)
          setIsAuthenticated(true)
        }
      }
    } catch (_) {
      // Ignore corrupt storage data
    } finally {
      // Mark as initialized regardless of success/failure
      setIsInitialized(true)
    }
  }, [])

  /**
   * Passenger Login Function
   * 
   * Authenticates a passenger user and manages session persistence based on
   * the "remember me" preference. Stores session in localStorage for persistent
   * sessions or sessionStorage for temporary sessions.
   * 
   * @param {string} email - Passenger email address
   * @param {string} password - Passenger password
   * @param {boolean} remember - Whether to persist session across browser sessions
   * @returns {Promise<Object>} Success status and optional error message
   */
  const loginPassenger = async (email, password, remember) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/passengers/login', { email, password }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      // Normalize user object with type identifier
      const normalized = { type: 'passenger', ...(data?.passenger || {}) }
      setUser(normalized)
      setIsAuthenticated(true)
      
      // Persist session based on remember preference
      try {
        const payload = JSON.stringify({ type: 'passenger', user: normalized, token: data?.token || null })
        if (remember) {
          localStorage.setItem('sawari_auth', payload)
          sessionStorage.removeItem('sawari_auth')
        } else {
          sessionStorage.setItem('sawari_auth', payload)
          localStorage.removeItem('sawari_auth')
        }
      } catch (_) {
        // Storage may be unavailable; continue without persistence
      }
      
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed.'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Captain Login Function
   * 
   * Authenticates a captain user and manages session persistence. Similar to
   * passenger login but uses captain-specific API endpoints and data structure.
   * 
   * @param {string} email - Captain email address
   * @param {string} password - Captain password
   * @param {boolean} remember - Whether to persist session across browser sessions
   * @returns {Promise<Object>} Success status and optional error message
   */
  const loginCaptain = async (email, password, remember) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/captain/login', { email, password })
      
      // Normalize user object with type identifier
      const normalized = { type: 'captain', ...(data?.captain || {}) }
      setUser(normalized)
      setIsAuthenticated(true)
      
      // Persist session based on remember preference
      try {
        const payload = JSON.stringify({ type: 'captain', user: normalized, token: data?.token || null })
        if (remember) {
          localStorage.setItem('sawari_auth', payload)
          sessionStorage.removeItem('sawari_auth')
        } else {
          sessionStorage.setItem('sawari_auth', payload)
          localStorage.removeItem('sawari_auth')
        }
      } catch (_) {
        // Storage may be unavailable; continue without persistence
      }
      
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed.'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout Function
   * 
   * Securely logs out the current user by calling the appropriate API endpoint
   * and clearing all stored session data. Handles both passenger and captain
   * logout flows and ensures cleanup even if API calls fail.
   * 
   * @returns {Promise<void>} Resolves when logout is complete
   */
  const logout = async () => {
    setLoading(true)
    try {
      // Determine user type and call appropriate logout endpoint
      if (user?.type === 'captain') {
        await api.post('/api/captain/logout')
      } else if (user?.type === 'passenger') {
        await api.post('/api/passengers/logout')
      }
    } catch (err) {
      console.error('Logout API error:', err)
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear local state and storage regardless of API response
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      
      // Remove all stored authentication data
      try {
        localStorage.removeItem('sawari_auth')
        sessionStorage.removeItem('sawari_auth')
        // Also clean up legacy captain auth keys
        localStorage.removeItem('sawari_captain_auth')
        sessionStorage.removeItem('sawari_captain_auth')
      } catch (_) {
        // Storage may be unavailable
      }
    }
  }

  /**
   * Update User Profile Function
   * 
   * Updates the current user's profile data in both memory and persistent storage.
   * This ensures that profile changes are immediately reflected across all components
   * and persist across browser sessions.
   * 
   * @param {Object} updatedData - Partial user data to merge with existing profile
   * @returns {void}
   */
  const updateUserProfile = (updatedData) => {
    if (!user || !isAuthenticated) return
    
    // Merge updated data with existing user object
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    
    // Synchronize changes with persistent storage
    try {
      const rawLocal = localStorage.getItem('sawari_auth')
      const rawSession = sessionStorage.getItem('sawari_auth')
      const raw = rawLocal || rawSession
      
      if (raw) {
        const parsed = JSON.parse(raw)
        const updatedPayload = {
          ...parsed,
          user: updatedUser
        }
        
        const newPayload = JSON.stringify(updatedPayload)
        if (rawLocal) {
          localStorage.setItem('sawari_auth', newPayload)
        } else if (rawSession) {
          sessionStorage.setItem('sawari_auth', newPayload)
        }
      }
    } catch (_) {
      // Ignore storage errors
    }
  }

  /**
   * Memoized Context Value
   * 
   * Optimizes performance by memoizing the context value to prevent unnecessary
   * re-renders of consuming components. Only updates when authentication state changes.
   */
  const value = useMemo(() => ({
    user,                // Current user object
    isAuthenticated,     // Authentication status
    loading,            // Loading state for auth operations
    isInitialized,      // Whether auth state has been restored from storage
    setUser,            // Direct user state setter (internal use)
    setIsAuthenticated, // Direct auth status setter (internal use)
    loginPassenger,     // Passenger login function
    loginCaptain,       // Captain login function
    logout,             // Logout function
    updateUserProfile,  // Profile update function
  }), [user, isAuthenticated, loading, isInitialized])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * useUser Hook
 * 
 * Custom hook for accessing the user authentication context. Provides type-safe
 * access to authentication state and functions throughout the application.
 * 
 * @returns {Object} Authentication context containing user state and functions
 * @throws {Error} If used outside of UserProvider
 */
export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}


