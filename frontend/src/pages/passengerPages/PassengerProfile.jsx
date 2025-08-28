import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import Navbar from '../../components/Navbar'
import axios from 'axios'

const PassengerProfile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)

  // Redirect if not authenticated or not a passenger
  useEffect(() => {
    if (!isAuthenticated || !user || user.type !== 'passenger') {
      navigate('/passenger/login')
      return
    }
  }, [isAuthenticated, user, navigate])

  // Fetch passenger profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user || user.type !== 'passenger') return

      try {
        setLoading(true)
        setError(null)

        // Extract token from storage
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
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (data.success && data.passenger) {
          setProfile(data.passenger)
        } else {
          setError('Failed to load profile data')
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        const message = err?.response?.data?.message || 'Failed to load profile'
        setError(message)
        toast.error(message)
        
        // If unauthorized, redirect to login
        if (err?.response?.status === 401) {
          navigate('/passenger/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated, user, navigate])

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true)
      await logout()
      toast.success('Logged out successfully')
      navigate('/passenger/login')
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Logout failed, but you have been signed out locally')
      navigate('/passenger/login')
    } finally {
      setIsLogoutLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#1A1A1A] text-white'>
        <Navbar />
        <div className='flex items-center justify-center min-h-[calc(100vh-56px)]'>
          <div className='flex items-center gap-3'>
            <svg className='w-6 h-6 animate-spin text-[#4DA6FF]' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
            <span className='text-lg font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className='min-h-screen bg-[#1A1A1A] text-white'>
        <Navbar />
        <div className='flex items-center justify-center min-h-[calc(100vh-56px)]'>
          <div className='text-center max-w-md mx-auto px-6'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center'>
              <svg className='w-8 h-8 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <h2 className='text-xl font-semibold mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Unable to Load Profile</h2>
            <p className='text-gray-300 mb-6' style={{ fontFamily: 'Inter, system-ui' }}>{error}</p>
            <div className='flex gap-3 justify-center'>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-[#4DA6FF] text-white rounded-lg font-medium hover:bg-[#4DA6FF]/90 transition-colors'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                Try Again
              </button>
              <Link
                to='/'
                className='px-4 py-2 border border-white/20 text-white rounded-lg font-medium hover:bg-white/5 transition-colors'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#1A1A1A] text-white'>
      <Navbar />
      
      {/* Background gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-20' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-15' />

      <main className='relative z-10 mx-auto max-w-4xl px-6 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Profile
            </h1>
            <p className='text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
              Manage your account information and settings
            </p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className='rounded-2xl border border-white/10 bg-[#1A1A1A]/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden'
          >
            {/* Profile Header */}
            <div className='px-6 py-6 border-b border-white/10 bg-gradient-to-r from-[#4DA6FF]/10 via-[#EFBFFF]/10 to-[#7CE7E1]/10'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 rounded-full bg-[#4DA6FF] flex items-center justify-center text-2xl font-bold text-white shadow-lg'>
                  {profile?.firstname?.charAt(0)?.toUpperCase() || profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className='flex-1'>
                  <h2 className='text-xl font-semibold text-white mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    {profile?.firstname || profile?.firstName || 'Unknown'} {profile?.lastname || profile?.lastName || ''}
                  </h2>
                  <p className='text-gray-300 mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                    {profile?.email || 'No email provided'}
                  </p>
                  {/* Verification Status */}
                  <div className='flex items-center gap-2'>
                    {profile?.isAccountVerified || profile?.isVerified ? (
                      <div className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span className='text-sm font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Verified</span>
                      </div>
                    ) : (
                      <div className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                        </svg>
                        <span className='text-sm font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Unverified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Account Information */}
                <div>
                  <h3 className='text-lg font-semibold mb-4 text-[#4DA6FF]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Account Information
                  </h3>
                  <div className='space-y-4'>
                    <div className='p-4 rounded-xl border border-white/10 bg-white/5'>
                      <label className='text-sm text-gray-400 font-medium' style={{ fontFamily: 'Inter, system-ui' }}>First Name</label>
                      <p className='text-white mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.firstname || profile?.firstName || 'Not provided'}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl border border-white/10 bg-white/5'>
                      <label className='text-sm text-gray-400 font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Last Name</label>
                      <p className='text-white mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.lastname || profile?.lastName || 'Not provided'}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl border border-white/10 bg-white/5'>
                      <label className='text-sm text-gray-400 font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Email Address</label>
                      <p className='text-white mt-1 break-all' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div>
                  <h3 className='text-lg font-semibold mb-4 text-[#EFBFFF]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Account Details
                  </h3>
                  <div className='space-y-4'>
                    <div className='p-4 rounded-xl border border-white/10 bg-white/5'>
                      <label className='text-sm text-gray-400 font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Account ID</label>
                      <p className='text-white mt-1 font-mono text-sm break-all' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?._id || 'Not available'}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl border border-white/10 bg-white/5'>
                      <label className='text-sm text-gray-400 font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Member Since</label>
                      <p className='text-white mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl border border-white/10 bg-white/5'>
                      <label className='text-sm text-gray-400 font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Last Updated</label>
                      <p className='text-white mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='mt-8 pt-6 border-t border-white/10'>
                <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
                  <div>
                    <h3 className='text-lg font-semibold text-[#7CE7E1] mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                      Account Actions
                    </h3>
                    <p className='text-sm text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>
                      Manage your account settings and preferences
                    </p>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-3'>
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      disabled={isLogoutLoading}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 disabled:opacity-50 transition-colors'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                      </svg>
                      {isLogoutLoading ? 'Logging out...' : 'Logout'}
                      {isLogoutLoading && (
                        <svg className='w-3 h-3 animate-spin ml-1' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                      )}
                    </button>
                    
                    {/* Back to Home */}
                    <Link
                      to='/'
                      className='inline-flex items-center gap-2 px-4 py-2 bg-[#4DA6FF] text-white rounded-lg hover:bg-[#4DA6FF]/90 transition-colors'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                      </svg>
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default PassengerProfile