import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import Navbar from '../../components/Navbar'
import axios from 'axios'

const PassengerProfile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, updateUserProfile, isInitialized } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)
  
  // Profile picture states
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Redirect if not authenticated or not a passenger
  useEffect(() => {
    // Only check authentication after the context has been initialized
    if (!isInitialized) return
    
    if (!isAuthenticated || !user || user.type !== 'passenger') {
      navigate('/passenger/login')
      return
    }
  }, [isAuthenticated, user, navigate, isInitialized])

  // Fetch passenger profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      // Wait for auth initialization and ensure user is authenticated passenger
      if (!isInitialized || !isAuthenticated || !user || user.type !== 'passenger') return

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
  }, [isAuthenticated, user, navigate, isInitialized])

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

  // Profile picture functions
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 2 * 1024 * 1024 // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are allowed')
      return false
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 2MB')
      return false
    }

    return true
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!validateFile(file)) {
      event.target.value = '' // Clear the input
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
    
    setShowUploadModal(true)
  }

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    try {
      setIsUploading(true)
      
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          token = parsed?.token || null
        } catch (_) {}
      }

      if (!token) {
        toast.error('Authentication required. Please login again.')
        navigate('/passenger/login')
        return
      }

      const formData = new FormData()
      formData.append('profilePic', selectedFile)

      const response = await axios.post(
        'http://localhost:3000/api/passengers/upload-profile-pic',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        toast.success('Profile picture uploaded successfully!')
        // Update profile state with new profile picture
        setProfile(prev => ({
          ...prev,
          profilePic: response.data.profilePic
        }))
        // Update UserContext to sync across all components (navbar, etc.)
        updateUserProfile({ profilePic: response.data.profilePic })
        // Reset states
        setSelectedFile(null)
        setImagePreview(null)
        setShowUploadModal(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        navigate('/passenger/login')
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload profile picture')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfilePicture = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    try {
      setIsUploading(true)
      
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          token = parsed?.token || null
        } catch (_) {}
      }

      if (!token) {
        toast.error('Authentication required. Please login again.')
        navigate('/passenger/login')
        return
      }

      const formData = new FormData()
      formData.append('profilePic', selectedFile)

      const response = await axios.put(
        'http://localhost:3000/api/passengers/update-profile-pic',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        toast.success('Profile picture updated successfully!')
        // Update profile state with new profile picture
        setProfile(prev => ({
          ...prev,
          profilePic: response.data.profilePic
        }))
        // Update UserContext to sync across all components (navbar, etc.)
        updateUserProfile({ profilePic: response.data.profilePic })
        // Reset states
        setSelectedFile(null)
        setImagePreview(null)
        setShowUploadModal(false)
      }
    } catch (error) {
      console.error('Update error:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        navigate('/passenger/login')
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile picture')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteProfilePicture = async () => {
    if (!profile?.profilePic) {
      toast.error('No profile picture to delete')
      return
    }

    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return
    }

    try {
      setIsUploading(true)
      
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          token = parsed?.token || null
        } catch (_) {}
      }

      if (!token) {
        toast.error('Authentication required. Please login again.')
        navigate('/passenger/login')
        return
      }

      const response = await axios.delete(
        'http://localhost:3000/api/passengers/delete-profile-pic',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Profile picture deleted successfully!')
        // Update profile state to remove profile picture
        setProfile(prev => ({
          ...prev,
          profilePic: null
        }))
        // Update UserContext to sync across all components (navbar, etc.)
        updateUserProfile({ profilePic: null })
      }
    } catch (error) {
      console.error('Delete error:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        navigate('/passenger/login')
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete profile picture')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setSelectedFile(null)
    setImagePreview(null)
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
              <div className='flex flex-col sm:flex-row items-center gap-6'>
                {/* Profile Picture Section */}
                <div className='relative group'>
                  {/* Main Profile Picture */}
                  <div className='relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white/20 group-hover:border-white/30 transition-all duration-300'>
                    {profile?.profilePic ? (
                      <img 
                        src={`http://localhost:3000${profile.profilePic}`} 
                        alt='Profile' 
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] ${profile?.profilePic ? 'hidden' : 'flex'}`}>
                      {profile?.firstname?.charAt(0)?.toUpperCase() || profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  
                  {/* Upload Overlay - appears on hover */}
                  <div className='absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                    <label 
                      htmlFor='profilePicInput' 
                      className='cursor-pointer p-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 transform hover:scale-110'
                      title={profile?.profilePic ? 'Update profile picture' : 'Upload profile picture'}
                    >
                      <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                    </label>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className='absolute -bottom-1 -right-1 flex gap-1'>
                    {/* Delete Button (only show if profile picture exists) */}
                    {profile?.profilePic && (
                      <motion.button 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeleteProfilePicture}
                        disabled={isUploading}
                        className='w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border-2 border-white/20'
                        title='Remove profile picture'
                      >
                        <svg className='w-3.5 h-3.5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    id='profilePicInput'
                    type='file'
                    accept='image/jpeg,image/jpg,image/png'
                    onChange={handleFileSelect}
                    className='hidden'
                  />
                </div>
                
                {/* Profile Info */}
                <div className='flex-1 text-center sm:text-left'>
                  <h2 className='text-xl font-semibold text-white mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    {profile?.firstname || profile?.firstName || 'Unknown'} {profile?.lastname || profile?.lastName || ''}
                  </h2>
                  <p className='text-gray-300 mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                    {profile?.email || 'No email provided'}
                  </p>
                  {/* Verification Status */}
                  <div className='flex justify-center sm:justify-start'>
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
                      to='/passenger/home'
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
      
      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md'
            onClick={closeUploadModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className='bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/20 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl backdrop-blur-xl'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='text-center'>
                {/* Header */}
                <div className='mb-6'>
                  <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#4DA6FF] to-[#EFBFFF] flex items-center justify-center'>
                    <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                  </div>
                  <h3 className='text-2xl font-bold text-white mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    {profile?.profilePic ? 'Update Photo' : 'Add Photo'}
                  </h3>
                  <p className='text-gray-400 text-sm' style={{ fontFamily: 'Inter, system-ui' }}>
                    Choose a clear photo of yourself
                  </p>
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='mb-8'
                  >
                    <div className='relative w-32 h-32 mx-auto'>
                      <img 
                        src={imagePreview} 
                        alt='Preview' 
                        className='w-full h-full rounded-full object-cover border-4 border-white/20 shadow-2xl'
                      />
                      <div className='absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent' />
                    </div>
                  </motion.div>
                )}
                
                {/* Action Buttons */}
                <div className='flex gap-3 justify-center mt-8'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeUploadModal}
                    disabled={isUploading}
                    className='px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 disabled:opacity-50 transition-all duration-200 font-medium'
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={profile?.profilePic ? handleUpdateProfilePicture : handleUploadProfilePicture}
                    disabled={isUploading || !selectedFile}
                    className='px-8 py-3 bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] text-white rounded-xl hover:from-[#4DA6FF]/90 hover:to-[#EFBFFF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg shadow-[#4DA6FF]/25'
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    {isUploading && (
                      <svg className='w-5 h-5 animate-spin' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                    )}
                    <span>
                      {isUploading 
                        ? (profile?.profilePic ? 'Updating...' : 'Uploading...') 
                        : (profile?.profilePic ? 'Update' : 'Upload')
                      }
                    </span>
                  </motion.button>
                </div>
                
                {/* Tips */}
                {!imagePreview && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='mt-6 p-4 bg-white/5 rounded-xl border border-white/10'
                  >
                    <p className='text-xs text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>
                      📝 Choose JPG, JPEG, or PNG • Max 2MB
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PassengerProfile