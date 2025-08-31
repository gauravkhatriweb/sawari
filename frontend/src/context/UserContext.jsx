import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
})

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // Track if auth state has been initialized

  // Load persisted session from storage (localStorage preferred, then sessionStorage)
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
      // ignore corrupt storage
    } finally {
      // Mark as initialized regardless of success/failure
      setIsInitialized(true)
    }
  }, [])

  const loginPassenger = async (email, password, remember) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/passengers/login', { email, password }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      // Build a normalized user object and persist according to remember flag
      const normalized = { type: 'passenger', ...(data?.passenger || {}) }
      setUser(normalized)
      setIsAuthenticated(true)
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
        // storage may be unavailable; continue without persistence
      }
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed.'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const loginCaptain = async (email, password, remember) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/captain/login', { email, password })
      // Build a normalized user object and persist according to remember flag
      const normalized = { type: 'captain', ...(data?.captain || {}) }
      setUser(normalized)
      setIsAuthenticated(true)
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
        // storage may be unavailable; continue without persistence
      }
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed.'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      if (user?.type === 'captain') {
        await api.post('/api/captain/logout')
      } else {
        await api.post('/api/passengers/logout')
      }
    } catch (_) {
      // no-op
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      try {
        localStorage.removeItem('sawari_auth')
        sessionStorage.removeItem('sawari_auth')
        // Also clean up legacy captain auth keys
        localStorage.removeItem('sawari_captain_auth')
        sessionStorage.removeItem('sawari_captain_auth')
      } catch (_) {}
      setLoading(false)
    }
  }

  // Function to update user profile data (for real-time sync across components)
  const updateUserProfile = (updatedData) => {
    if (!user || !isAuthenticated) return
    
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    
    // Update persisted storage as well
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
      // ignore storage errors
    }
  }

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    isInitialized,
    setUser,
    setIsAuthenticated,
    loginPassenger,
    loginCaptain,
    logout,
    updateUserProfile,
  }), [user, isAuthenticated, loading, isInitialized])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}


