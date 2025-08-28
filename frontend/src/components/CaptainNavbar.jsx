import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/branding/sawaridotpk_main_logo.png'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useUser } from '../context/UserContext'

const CaptainNavbar = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [profileData, setProfileData] = useState(null) // Store full profile data including profilePic
  const dropdownRef = useRef(null)
  
  const captain = isAuthenticated && user?.type === 'captain' ? user : null

  // Check captain verification status when captain changes
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!captain || !isAuthenticated) {
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
        const { data } = await axios.get(`${apiBase}/api/captain/profile`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        
        // Check verification status from API response and store profile data
        const verified = Boolean(data?.captain?.isAccountVerified || data?.captain?.isVerified)
        setIsVerified(verified)
        setProfileData(data?.captain || null) // Store full profile data including profilePic
      } catch (_) {
        // If profile fetch fails, assume not verified
        setIsVerified(false)
        setProfileData(null)
      }
    }
    
    checkVerificationStatus()
  }, [captain, isAuthenticated]) // Re-run when captain or authentication changes

  // Blur/darken on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      await axios.post(`${apiBase}/api/captain/send-verification-otp`, {}, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      toast.success('OTP sent to your email')
      setIsDropdownOpen(false)
      navigate('/captain/verify-otp')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send OTP'
      toast.error(msg)
    } finally {
      setIsActionLoading(false)
    }
  }

  // Enhanced logout flow
  const handleLogout = async () => {
    try {
      setIsActionLoading(true)
      await logout()
      toast.success('Logged out successfully')
      setIsDropdownOpen(false)
      navigate('/captain/login')
    } catch (err) {
      toast.error('Logout failed, but you have been signed out locally')
      navigate('/captain/login')
    } finally {
      setIsActionLoading(false)
    }
  }

  const navItems = [
    { id: 'earnings', label: 'Total Earnings', icon: '💰' },
    { id: 'payout', label: 'Payout', icon: '💳' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ]

  const handleNavClick = (id) => {
    // Handle navigation for different sections
    switch (id) {
      case 'earnings':
        // TODO: Navigate to earnings page
        toast.info('Earnings page coming soon')
        break
      case 'payout':
        // TODO: Navigate to payout page
        toast.info('Payout page coming soon')
        break
      case 'contact':
        // TODO: Navigate to contact page
        toast.info('Contact page coming soon')
        break
      default:
        break
    }
    setMenuOpen(false)
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-colors ${scrolled ? 'backdrop-blur' : ''} ${scrolled ? 'bg-[#1A1A1A]/70 border-white/10' : 'bg-transparent'} border-b text-white`}>
      <div className='mx-auto max-w-screen-xl px-6'>
        <div className='flex h-14 items-center justify-between'>
          {/* Logo */}
          <button onClick={() => navigate('/captain/home')} className='flex items-center gap-2'>
            <img src={logo} alt='Sawari logo' className='h-8 w-8' />
            <span className='font-semibold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Sawari</span>
          </button>

          {/* Desktop nav centered */}
          <nav className='hidden md:flex items-center gap-6 text-sm'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className='transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4DA6FF] rounded-full px-3 py-2 opacity-80 hover:opacity-100 flex items-center gap-2'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <span className='text-xs'>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions: Captain avatar */}
          <div className='hidden md:flex items-center gap-3 relative' ref={dropdownRef}>
            {captain ? (
              <>
                <button 
                  onClick={() => setIsDropdownOpen((o) => !o)} 
                  className='relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center font-bold text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4DA6FF] border-2 border-white/20 hover:border-white/30 transition-all duration-300'
                >
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
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] ${profileData?.profilePic ? 'hidden' : 'flex'}`}>
                    {String(captain?.firstname || captain?.firstName || '?').charAt(0).toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-[#1A1A1A]/95 backdrop-blur-md text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden'
                    >
                      {/* User info header */}
                      <div className='px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#4DA6FF]/10 via-[#EFBFFF]/10 to-[#7CE7E1]/10'>
                        {/* Profile Picture and User Info */}
                        <div className='flex items-center gap-3 mb-2'>
                          {/* Profile Picture in Dropdown */}
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
                              {String(captain?.firstname || captain?.firstName || '?').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          
                          {/* User Details */}
                          <div className='flex-1'>
                            <p className='text-sm font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                              {captain?.firstname || captain?.firstName || 'Captain'}
                            </p>
                            <p className='text-xs text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                              {captain?.email || 'captain@example.com'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Verification and Captain Status */}
                        {!isVerified ? (
                          <div className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300'>
                            <span className='text-xs'>⚠️</span>
                            <span className='text-xs font-medium'>Unverified</span>
                          </div>
                        ) : (
                          <div className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300'>
                            <span className='text-xs'>🚗</span>
                            <span className='text-xs font-medium'>Captain</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Menu items */}
                      <div className='py-2'>
                        
                        {!isVerified && (
                          <button 
                            disabled={isActionLoading} 
                            onClick={handleSendVerificationOtp} 
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

                        <button 
                          onClick={() => { setIsDropdownOpen(false); navigate('/captain/profile') }} 
                          className='w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#4DA6FF]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                          </svg>
                          <span>Profile</span>
                        </button>

                        
                        <button 
                          onClick={() => { setIsDropdownOpen(false); handleNavClick('earnings') }} 
                          className='w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#FFD65C]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
                          </svg>
                          <span>Total Earnings</span>
                        </button>

                        <button 
                          onClick={() => { setIsDropdownOpen(false); handleNavClick('payout') }} 
                          className='w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#7CE7E1]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                          </svg>
                          <span>Payout</span>
                        </button>

                        <button 
                          onClick={() => { setIsDropdownOpen(false); handleNavClick('contact') }} 
                          className='w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-[#EFBFFF]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                          </svg>
                          <span>Contact</span>
                        </button>
                        
                        <div className='h-px w-full bg-white/10 mx-4 my-2' />
                        
                        <button 
                          disabled={isActionLoading} 
                          onClick={handleLogout} 
                          className='w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60 transition-colors flex items-center gap-3'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          <svg className='w-4 h-4 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                          </svg>
                          <span>Logout</span>
                          
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <button onClick={() => navigate('/captain/login')} className='rounded-full bg-[#4DA6FF] hover:brightness-110 px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg transition'>Login</button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className='md:hidden rounded-lg border border-white/20 p-2'>
            <span className='sr-only'>Toggle menu</span>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className='md:hidden border-t border-white/10 bg-[#1A1A1A]/90 backdrop-blur text-white'>
          <div className='mx-auto max-w-screen-xl px-6 py-3 space-y-2'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className='block w-full text-left rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white flex items-center gap-2'
              >
                <span className='text-xs'>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className='flex items-center gap-3 pt-2'>
              {captain ? (
                <div className='relative w-full'>
                  <button onClick={() => setIsDropdownOpen((o) => !o)} className='relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center font-bold text-white shadow border-2 border-white/20'>
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
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] ${profileData?.profilePic ? 'hidden' : 'flex'}`}>
                      {String(captain?.firstname || captain?.firstName || '?').charAt(0).toUpperCase()}
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
                                  {String(captain?.firstname || captain?.firstName || '?').charAt(0).toUpperCase()}
                                </div>
                              </div>
                              
                              {/* User Details */}
                              <div className='flex-1'>
                                <p className='text-sm font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                                  {captain?.firstname || captain?.firstName || 'Captain'}
                                </p>
                                <p className='text-xs text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                                  {captain?.email || 'captain@example.com'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Verification and Captain Status */}
                            {!isVerified ? (
                              <div className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300'>
                                <span className='text-xs'>⚠️</span>
                                <span className='text-xs font-medium'>Unverified</span>
                              </div>
                            ) : (
                              <div className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300'>
                                <span className='text-xs'>🚗</span>
                                <span className='text-xs font-medium'>Captain</span>
                              </div>
                            )}
                          </div>
                          
                          <div className='py-2'>
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
                          <button 
                            onClick={() => { setIsDropdownOpen(false); setMenuOpen(false); navigate('/captain/profile') }} 
                            className='w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          >
                            <svg className='w-4 h-4 text-[#4DA6FF]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                            <span>Profile</span>
                          </button>
                          
                          <div className='h-px w-full bg-white/10 mx-4 my-2' />
                          
                          <button 
                            disabled={isActionLoading} 
                            onClick={async () => { await handleLogout(); setMenuOpen(false) }} 
                            className='w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60 transition-colors flex items-center gap-3'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          >
                            <svg className='w-4 h-4 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
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
              ) : (
                <button onClick={() => { setMenuOpen(false); navigate('/captain/login') }} className='rounded-full bg-[#4DA6FF] hover:brightness-110 px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg transition'>Login</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default CaptainNavbar