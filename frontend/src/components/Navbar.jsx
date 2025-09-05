import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/branding/sawaridotpk_main_logo.png'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext' // Import UserContext for authentication state

// Sticky, responsive navbar with brand logo, centered links, login CTA, and theme toggle
const Navbar = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('light')
  // Use UserContext for authentication state instead of local state
  const { user, isAuthenticated, logout: contextLogout } = useUser()
  const [isVerified, setIsVerified] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [profileData, setProfileData] = useState(null) // Store full profile data including profilePic
  const dropdownRef = useRef(null)
  
  // Determine if user is a passenger and extract passenger data
  const isPassengerAuth = isAuthenticated && user?.type === 'passenger'
  const passenger = isPassengerAuth ? user : null

  // Simple scroll-spy to highlight active section
  useEffect(() => {
    const sectionIds = ['home', 'features', 'passengers', 'drivers', 'contact']
    const observers = []
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(id)
          })
        },
        { root: null, rootMargin: '0px', threshold: 0.5 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // Blur/darken on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Theme persistence
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') setTheme(stored)
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')
    } catch (_) {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
      document.documentElement.className = `theme-${theme}`
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch (_) {}
  }, [theme])

  // Check passenger verification status when user changes
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!isPassengerAuth || !passenger) {
        setIsVerified(false)
        setProfileData(null)
        return
      }
      
      try {
        // Extract token from storage for verification check
        const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
        let token = null
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            token = parsed?.token || null
          } catch (_) {}
        }

        const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
        const { data } = await axios.get(`${apiBase}/api/passengers/profile`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        
        // Check verification status from API response and store profile data
        const verified = Boolean(data?.passenger?.isAccountVerified || data?.passenger?.isVerified)
        setIsVerified(verified)
        setProfileData(data?.passenger || null) // Store full profile data including profilePic
      } catch (_) {
        // If profile fetch fails, assume not verified
        setIsVerified(false)
        setProfileData(null)
      }
    }
    
    checkVerificationStatus()
  }, [isPassengerAuth, passenger]) // Re-run when authentication state changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Trigger send verification OTP and redirect
  const handleSendVerificationOtp = async () => {
    try {
      setIsActionLoading(true)
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try { token = JSON.parse(raw)?.token || null } catch (_) {}
      }
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      await axios.post(`${apiBase}/api/passengers/send-verification-otp`, {}, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      toast.success('OTP sent to your email')
      setIsDropdownOpen(false)
      navigate('/passenger/verify-otp')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send OTP'
      toast.error(msg)
    } finally {
      setIsActionLoading(false)
    }
  }

  // Enhanced logout flow using UserContext
  const handleLogout = async () => {
    try {
      setIsActionLoading(true)
      // Use UserContext logout method for consistent state management
      await contextLogout()
      
      // Reset local component state
      setIsVerified(false)
      toast.success('Logged out successfully')
      setIsDropdownOpen(false)
      navigate('/passenger/login')
    } catch (err) {
      // If context logout fails, still clean up local state
      setIsVerified(false)
      setIsDropdownOpen(false)
      toast.error('Logout failed, but you have been signed out locally')
      navigate('/passenger/login')
    } finally {
      setIsActionLoading(false)
    }
  }

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'passengers', label: 'Passengers' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'contact', label: 'Contact', path: '/legal/contact'  },
  ]

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMenuOpen(false)
    }
  }

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path)
      setMenuOpen(false)
    } else {
      scrollTo(item.id)
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-colors ${scrolled ? 'backdrop-theme border-theme-base' : 'bg-transparent'} border-b text-theme-primary`}>
      <div className='mx-auto max-w-screen-xl px-6'>
        <div className='flex h-14 items-center justify-between'>
          {/* Logo */}
          <button onClick={() => scrollTo('home')} className='flex items-center gap-2'>
            <img src={logo} alt='Sawari logo' className='h-8 w-8' />
            <span className='font-semibold'>Sawari</span>
          </button>

          {/* Desktop nav centered */}
          <nav className='hidden md:flex items-center gap-6 text-sm'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary rounded-full px-2 py-1 ${active === item.id ? 'bg-clip-text text-transparent bg-gradient-brand-flow' : 'opacity-80 hover:opacity-100'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions: Login or Passenger avatar */}
          <div className='hidden md:flex items-center gap-3 relative' ref={dropdownRef}>
            {!isPassengerAuth || !passenger ? (
              <button onClick={() => navigate('/passenger/login')} className='rounded-full bg-brand-primary hover:brightness-110 px-4 py-2 text-white text-sm font-semibold shadow-theme-sm hover:shadow-theme-md transition'>Login</button>
            ) : (
              <>
                <button onClick={() => setIsDropdownOpen((o) => !o)} className='relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-theme-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary border-2 border-theme-border-base hover:border-theme-border-subtle transition-all duration-300'>
                  {profileData?.profilePic ? (
                    <img 
                      src={`http://localhost:3000${profileData.profilePic}`} 
                      alt='Profile' 
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary ${profileData?.profilePic ? 'hidden' : 'flex'}`}>
                    {String(passenger?.firstname || passenger?.firstName || '?').charAt(0).toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-0 top-12 w-64 rounded-2xl border border-theme-base bg-theme-surface-elevated/95 backdrop-theme text-theme-primary shadow-theme-xl overflow-hidden'
                    >
                      {/* User info header */}
                      <div className='px-4 py-3 border-b border-theme-base bg-gradient-to-r from-brand-primary/10 via-brand-secondary/10 to-brand-aqua/10'>
                        {/* Profile Picture and User Info */}
                        <div className='flex items-center gap-3 mb-2'>
                          {/* Profile Picture in Dropdown */}
                          <div className='relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-theme-md border-2 border-theme-border-base'>
                            {profileData?.profilePic ? (
                              <img 
                                src={`http://localhost:3000${profileData.profilePic}`} 
                                alt='Profile' 
                                className='w-full h-full object-cover'
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary text-lg ${profileData?.profilePic ? 'hidden' : 'flex'}`}>
                              {String(passenger?.firstname || passenger?.firstName || '?').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          
                          {/* User Details */}
                          <div className='flex-1'>
                            <p className='text-sm font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                              {passenger?.firstname || passenger?.firstName || 'User'}
                            </p>
                            <p className='text-xs text-theme-secondary' style={{ fontFamily: 'Inter, system-ui' }}>
                              {passenger?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Verification Status */}
                        {!isVerified && (
                          <div className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning/20 text-warning'>
                            <span className='text-xs'>⚠️</span>
                            <span className='text-xs font-medium'>Unverified</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Menu items */}
                      <div className='py-2'>
                        <button 
                          onClick={() => { setIsDropdownOpen(false); navigate('/passenger/profile') }} 
                          className='w-full text-left px-4 py-3 text-sm hover:bg-theme-surface transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-brand-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                          </svg>
                          <span>Profile</span>
                        </button>
                        
                        {!isVerified && (
                          <button 
                            disabled={isActionLoading} 
                            onClick={handleSendVerificationOtp} 
                            className='w-full text-left px-4 py-3 text-sm hover:bg-theme-surface disabled:opacity-60 transition-colors flex items-center gap-3'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          >
                            <svg className='w-4 h-4 text-brand-accent' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                            </svg>
                            <span>Verify Account</span>
                            {isActionLoading && (
                              <svg className='w-3 h-3 animate-spin ml-auto' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                              </svg>
                            )}
                          </button>
                        )}
                        
                        <div className='h-px w-full bg-theme-border-base mx-4 my-2' />
                        
                        <button 
                          disabled={isActionLoading} 
                          onClick={handleLogout} 
                          className='w-full text-left px-4 py-3 text-sm hover:bg-error/10 hover:text-error disabled:opacity-60 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-error' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                          </svg>
                          <span>Logout</span>
                          
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className='md:hidden rounded-lg border border-theme-border-base p-2'>
            <span className='sr-only'>Toggle menu</span>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className='md:hidden border-t border-theme-border-base bg-theme-base/90 backdrop-theme text-theme-primary'>
          <div className='mx-auto max-w-screen-xl px-6 py-3 space-y-2'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`block w-full text-left rounded-lg px-3 py-2 text-sm ${active === item.id ? 'bg-theme-surface text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}
              >
                {item.label}
              </button>
            ))}
            <div className='flex items-center gap-3 pt-2'>
              {!isPassengerAuth || !passenger ? (
                <button onClick={() => { setMenuOpen(false); navigate('/passenger/login') }} className='rounded-full bg-brand-primary hover:brightness-110 px-4 py-2 text-white text-sm font-semibold shadow-theme-sm hover:shadow-theme-md transition'>Login</button>
              ) : (
                <div className='relative w-full'>
                  <button onClick={() => setIsDropdownOpen((o) => !o)} className='relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-theme-sm border-2 border-theme-border-base'>
                    {profileData?.profilePic ? (
                      <img 
                        src={`http://localhost:3000${profileData.profilePic}`} 
                        alt='Profile' 
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary ${profileData?.profilePic ? 'hidden' : 'flex'}`}>
                      {String(passenger?.firstname || passenger?.firstName || '?').charAt(0).toUpperCase()}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className='absolute right-0 top-10 w-64 rounded-2xl border border-white/10 bg-[#1A1A1A]/95 backdrop-blur-md text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden'
                      >
                        {/* User info header */}
                        <div className='px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#4DA6FF]/10 via-[#EFBFFF]/10 to-[#7CE7E1]/10'>
                          {/* Profile Picture and User Info */}
                          <div className='flex items-center gap-3 mb-2'>
                            {/* Profile Picture in Mobile Dropdown */}
                            <div className='relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20'>
                              {profileData?.profilePic ? (
                                <img 
                                  src={`http://localhost:3000${profileData.profilePic}`} 
                                  alt='Profile' 
                                  className='w-full h-full object-cover'
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] text-lg ${profileData?.profilePic ? 'hidden' : 'flex'}`}>
                                {String(passenger?.firstname || passenger?.firstName || '?').charAt(0).toUpperCase()}
                              </div>
                            </div>
                            
                            {/* User Details */}
                            <div className='flex-1'>
                              <p className='text-sm font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                                {passenger?.firstname || passenger?.firstName || 'User'}
                              </p>
                              <p className='text-xs text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                                {passenger?.email || 'user@example.com'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Verification Status */}
                          {!isVerified && (
                            <div className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300'>
                              <span className='text-xs'>⚠️</span>
                              <span className='text-xs font-medium'>Unverified</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Menu items */}
                        <div className='py-2'>
                          <button 
                            onClick={() => { setIsDropdownOpen(false); setMenuOpen(false); navigate('/passenger/profile') }} 
                            className='w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          >
                            <svg className='w-4 h-4 text-brand-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                            <span>Profile</span>
                          </button>
                          
                          {!isVerified && (
                            <button 
                              disabled={isActionLoading} 
                              onClick={async () => { await handleSendVerificationOtp(); setMenuOpen(false) }} 
                              className='w-full text-left px-4 py-3 text-sm hover:bg-white/5 disabled:opacity-60 transition-colors flex items-center gap-3'
                              style={{ fontFamily: 'Inter, system-ui' }}
                            >
                              <svg className='w-4 h-4 text-[#FFD65C]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                              </svg>
                              <span>Verify Account</span>
                              {isActionLoading && (
                                <svg className='w-3 h-3 animate-spin ml-auto' viewBox='0 0 24 24'>
                                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                </svg>
                              )}
                            </button>
                          )}
                          
                          <div className='h-px w-full bg-white/10 mx-4 my-2' />
                          
                          <button 
                            disabled={isActionLoading} 
                            onClick={async () => { await handleLogout(); setMenuOpen(false) }} 
                            className='w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60 transition-colors flex items-center gap-3'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          >
                            <svg className='w-4 h-4 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1' />
                            </svg>
                            <span>Logout</span>
                            {isActionLoading && (
                              <svg className='w-3 h-3 animate-spin ml-auto' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar


