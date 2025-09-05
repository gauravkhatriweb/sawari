import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import CaptainNavbar from '../../components/CaptainNavbar'
import CaptainBottomNav from '../../captain/components/CaptainBottomNav'
import GlassCard from '../../components/GlassCard'
import axios from 'axios'

const CaptainProfile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, updateUserProfile } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)
  
  // Profile picture states
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // Vehicle editing states
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)
  const [vehicleData, setVehicleData] = useState({
    type: '',
    make: '',
    model: '',
    numberPlate: '',
    capacity: ''
  })
  const [isSavingVehicle, setIsSavingVehicle] = useState(false)

  // Redirect if not authenticated or not a captain
  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // Add a small delay to allow authentication state to settle
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user || user.type !== 'captain') {
        console.log('Authentication check failed:', { isAuthenticated, user, userType: user?.type })
        navigate('/captain/login')
        return
      }
    }, 100) // 100ms delay to allow auth state to settle
    
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, navigate])

  // Fetch captain profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      console.log('fetchProfile called:', { isAuthenticated, user, userType: user?.type })
      if (!isAuthenticated || !user || user.type !== 'captain') {
        console.log('Skipping profile fetch due to auth check')
        return
      }

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
        
        const { data } = await axios.get(`${apiBase}/api/captain/profile`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (data.success && data.captain) {
          setProfile(data.captain)
          // Initialize vehicle data for editing
          setVehicleData({
            type: data.captain?.vehicle?.type || '',
            make: data.captain?.vehicle?.make || '',
            model: data.captain?.vehicle?.model || '',
            numberPlate: data.captain?.vehicle?.numberPlate || '',
            capacity: data.captain?.vehicle?.capacity || ''
          })
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
          navigate('/captain/login')
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
      navigate('/captain/login')
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Logout failed, but you have been signed out locally')
      navigate('/captain/login')
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
        navigate('/captain/login')
        return
      }

      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const formData = new FormData()
      formData.append('profilePic', selectedFile)

      const response = await axios.post(
        `${apiBase}/api/captain/upload-profile-pic`,
        formData,
        {
          withCredentials: true,
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
        navigate('/captain/login')
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
        navigate('/captain/login')
        return
      }

      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const formData = new FormData()
      formData.append('profilePic', selectedFile)

      const response = await axios.put(
        `${apiBase}/api/captain/update-profile-pic`,
        formData,
        {
          withCredentials: true,
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
        navigate('/captain/login')
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
        navigate('/captain/login')
        return
      }

      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const response = await axios.delete(
        `${apiBase}/api/captain/delete-profile-pic`,
        {
          withCredentials: true,
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
        navigate('/captain/login')
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

  // Vehicle editing functions
  const handleVehicleEdit = () => {
    setIsEditingVehicle(true)
  }

  const handleVehicleCancel = () => {
    setIsEditingVehicle(false)
    // Reset to original data
    setVehicleData({
      type: profile?.vehicle?.type || '',
      make: profile?.vehicle?.make || '',
      model: profile?.vehicle?.model || '',
      numberPlate: profile?.vehicle?.numberPlate || '',
      capacity: profile?.vehicle?.capacity || ''
    })
  }

  const handleVehicleSave = async () => {
    try {
      setIsSavingVehicle(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update profile state (UI-only simulation)
      setProfile(prev => ({
        ...prev,
        vehicle: {
          ...prev?.vehicle,
          ...vehicleData
        }
      }))
      
      setIsEditingVehicle(false)
      toast.success('Vehicle details updated successfully!')
    } catch (error) {
      toast.error('Failed to update vehicle details')
    } finally {
      setIsSavingVehicle(false)
    }
  }

  const handleVehicleChange = (field, value) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Meta-style verification tick component
  const VerificationTick = ({ isVerified }) => {
    if (!isVerified) return null
    
    return (
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-theme-base text-theme-primary'>
        <CaptainNavbar />
        <div className='flex items-center justify-center min-h-[calc(100vh-56px)]'>
          <div className='flex items-center gap-3'>
            <svg className='w-6 h-6 animate-spin text-brand-primary' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
            <span className='text-lg font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-theme-base text-theme-primary'>
      <CaptainNavbar />
      
      {/* Background gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-brand-aqua/15 via-brand-primary/15 to-brand-secondary/15 blur-3xl' />

      <main className='relative z-10 mx-auto max-w-4xl px-6 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Captain Profile
            </h1>
            <p className='text-theme-secondary' style={{ fontFamily: 'Inter, system-ui' }}>
              Manage your captain account information and settings
            </p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className='glass-card overflow-hidden'
          >
            {/* Profile Header */}
            <div className='px-6 py-6 glass-border bg-gradient-to-r from-brand-primary/10 via-brand-secondary/10 to-brand-aqua/10'>
              <div className='flex flex-col sm:flex-row items-center gap-6'>
                {/* Profile Picture Section */}
                <div className='relative group'>
                  {/* Main Profile Picture */}
                  <div className='relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-3xl font-bold text-theme-primary shadow-xl border-4 glass-border group-hover:border-white/30 transition-all duration-300'>
                    {profile?.profilePic ? (
                      <img 
                        src={`http://localhost:3000${profile.profilePic}`} 
                        alt={`Profile picture of Captain ${profile?.firstname || profile?.firstName || ''} ${profile?.lastname || profile?.lastName || ''}`}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary ${profile?.profilePic ? 'hidden' : 'flex'}`}>
                      {profile?.firstname?.charAt(0)?.toUpperCase() || profile?.firstName?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    
                    {/* Meta-style Verification Tick */}
                    <VerificationTick isVerified={profile?.isAccountVerified || profile?.isVerified} />
                  </div>
                  
                  {/* Upload Overlay - appears on hover */}
                  <div className='absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                    <label 
                      htmlFor='profilePicInput' 
                      className='cursor-pointer p-2 glass-bg rounded-full backdrop-blur-sm glass-border hover:glass-hover-bg focus:glass-hover-bg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-110 focus:scale-110'
                      title={profile?.profilePic ? 'Update profile picture' : 'Upload profile picture'}
                      tabIndex={0}
                      role='button'
                      aria-label={profile?.profilePic ? 'Update profile picture' : 'Upload profile picture'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          document.getElementById('profilePicInput').click()
                        }
                      }}
                    >
                      <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
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
                        className='w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border-2 glass-border'
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
                    className='sr-only'
                    aria-describedby='profile-pic-help'
                  />
                  <div id='profile-pic-help' className='sr-only'>
                    Upload a profile picture. Accepted formats: JPG, JPEG, PNG. Maximum file size: 2MB.
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className='flex-1 text-center sm:text-left'>
                  <h2 className='text-xl font-semibold text-theme-primary mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Captain {profile?.firstname || profile?.firstName || 'Unknown'} {profile?.lastname || profile?.lastName || ''}
                  </h2>
                  <p className='text-theme-secondary mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
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
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Personal Information */}
                <div>
                  <h3 className='text-lg font-semibold mb-4 text-brand-primary' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Personal Information
                  </h3>
                  <div className='space-y-4'>
                    <div className='p-4 rounded-xl glass-card'>
                      <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>First Name</label>
                      <p className='text-theme-primary mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.firstname || profile?.firstName || 'Not provided'}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl glass-card'>
                      <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Last Name</label>
                      <p className='text-theme-primary mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.lastname || profile?.lastName || 'Not provided'}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl glass-card'>
                      <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Email Address</label>
                      <p className='text-theme-primary mt-1 break-all' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.email || 'Not provided'}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl glass-card'>
                      <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Account Status</label>
                      <p className='text-theme-primary mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {profile?.status || 'inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-semibold text-brand-secondary' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                      Vehicle Information
                    </h3>
                    {!isEditingVehicle && (
                      <button
                          onClick={handleVehicleEdit}
                          className='px-3 py-1.5 text-sm bg-brand-primary/20 hover:bg-brand-primary/30 focus:bg-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-transparent text-brand-primary rounded-lg transition-colors duration-200 flex items-center gap-1'
                          aria-label='Edit vehicle information'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                        </svg>
                        Edit
                      </button>
                    )}
                  </div>
                  
                  {isEditingVehicle ? (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='p-4 rounded-xl glass-card'>
                          <label htmlFor='vehicle-type' className='block text-sm font-medium text-theme-muted mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Vehicle Type</label>
                          <select
                            id='vehicle-type'
                            value={vehicleData.type}
                            onChange={(e) => handleVehicleChange('type', e.target.value)}
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          >
                            <option value=''>Select Type</option>
                            <option value='Sedan'>Sedan</option>
                            <option value='SUV'>SUV</option>
                            <option value='Hatchback'>Hatchback</option>
                            <option value='Motorcycle'>Motorcycle</option>
                            <option value='Auto Rickshaw'>Auto Rickshaw</option>
                          </select>
                        </div>
                        
                        <div className='p-4 rounded-xl glass-card'>
                          <label htmlFor='vehicle-make' className='block text-sm font-medium text-theme-muted mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Make</label>
                          <input
                            id='vehicle-make'
                            type='text'
                            value={vehicleData.make}
                            onChange={(e) => handleVehicleChange('make', e.target.value)}
                            placeholder='e.g., Toyota, Honda'
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-theme-primary placeholder-theme-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          />
                        </div>
                        
                        <div className='p-4 rounded-xl glass-card'>
                          <label htmlFor='vehicle-model' className='block text-sm font-medium text-theme-muted mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Model</label>
                          <input
                            id='vehicle-model'
                            type='text'
                            value={vehicleData.model}
                            onChange={(e) => handleVehicleChange('model', e.target.value)}
                            placeholder='e.g., Corolla, Civic'
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-theme-primary placeholder-theme-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          />
                        </div>
                        
                        <div className='p-4 rounded-xl glass-card'>
                          <label htmlFor='vehicle-plate' className='block text-sm font-medium text-theme-muted mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Number Plate</label>
                          <input
                            id='vehicle-plate'
                            type='text'
                            value={vehicleData.numberPlate}
                            onChange={(e) => handleVehicleChange('numberPlate', e.target.value.toUpperCase())}
                            placeholder='e.g., ABC-123'
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-theme-primary placeholder-theme-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono tracking-wider'
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                          />
                        </div>
                        
                        <div className='md:col-span-2 p-4 rounded-xl glass-card'>
                          <label htmlFor='vehicle-capacity' className='block text-sm font-medium text-theme-muted mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Passenger Capacity</label>
                          <select
                            id='vehicle-capacity'
                            value={vehicleData.capacity}
                            onChange={(e) => handleVehicleChange('capacity', e.target.value)}
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            style={{ fontFamily: 'Inter, system-ui' }}
                          >
                            <option value=''>Select Capacity</option>
                            <option value='1'>1 passenger</option>
                            <option value='2'>2 passengers</option>
                            <option value='3'>3 passengers</option>
                            <option value='4'>4 passengers</option>
                            <option value='5'>5 passengers</option>
                            <option value='6'>6 passengers</option>
                            <option value='7'>7 passengers</option>
                            <option value='8'>8 passengers</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className='flex gap-3 pt-4'>
                        <button
                          onClick={handleVehicleSave}
                          disabled={isSavingVehicle}
                          className='flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 disabled:bg-brand-primary/50 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          {isSavingVehicle ? (
                            <>
                              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                        <button
                          onClick={handleVehicleCancel}
                          disabled={isSavingVehicle}
                          className='px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-theme-primary rounded-lg transition-colors duration-200'
                          style={{ fontFamily: 'Inter, system-ui' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div className='p-4 rounded-xl glass-card'>
                        <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Vehicle Type</label>
                        <p className='text-theme-primary mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                          {profile?.vehicle?.type || 'Not provided'}
                        </p>
                      </div>
                      <div className='p-4 rounded-xl glass-card'>
                        <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Make & Model</label>
                        <p className='text-theme-primary mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                          {profile?.vehicle?.make && profile?.vehicle?.model 
                            ? `${profile.vehicle.make} ${profile.vehicle.model}` 
                            : 'Not provided'}
                        </p>
                      </div>
                      <div className='p-4 rounded-xl glass-card'>
                        <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Number Plate</label>
                        <p className='text-theme-primary mt-1 font-mono text-lg tracking-wider' style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {profile?.vehicle?.numberPlate || 'Not provided'}
                        </p>
                      </div>
                      <div className='p-4 rounded-xl glass-card'>
                        <label className='text-sm text-theme-muted font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Capacity</label>
                        <p className='text-theme-primary mt-1' style={{ fontFamily: 'Inter, system-ui' }}>
                          {profile?.vehicle?.capacity ? `${profile.vehicle.capacity} passengers` : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className='mt-8 pt-6 glass-border'>
                <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
                  <div>
                    <h3 className='text-lg font-semibold text-brand-aqua mb-1' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                      Account Actions
                    </h3>
                    <p className='text-sm text-theme-muted' style={{ fontFamily: 'Inter, system-ui' }}>
                      Manage your captain account settings and preferences
                    </p>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-3'>
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      disabled={isLogoutLoading}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 focus:bg-red-500/30 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                      style={{ fontFamily: 'Inter, system-ui' }}
                      aria-describedby={isLogoutLoading ? 'logout-status' : undefined}
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                      </svg>
                      {isLogoutLoading ? 'Logging out...' : 'Logout'}
                      {isLogoutLoading && (
                        <>
                          <svg className='w-3 h-3 animate-spin ml-1' viewBox='0 0 24 24' aria-hidden='true'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                          </svg>
                          <span id='logout-status' className='sr-only'>Logout in progress</span>
                        </>
                      )}
                    </button>
                    
                    {/* Back to Home */}
                    <Link
                      to='/captain/home'
                      className='inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-theme-primary rounded-lg hover:bg-brand-primary/90 focus:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-transparent transition-colors'
                      style={{ fontFamily: 'Inter, system-ui' }}
                      aria-label='Navigate back to captain dashboard'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                      </svg>
                      Back to Dashboard
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
              className='bg-gradient-to-br from-theme-base to-theme-surface glass-border rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl backdrop-blur-xl'
              onClick={(e) => e.stopPropagation()}
              role='dialog'
              aria-labelledby='upload-modal-title'
              aria-describedby='upload-modal-description'
            >
              <div className='text-center'>
                {/* Header */}
                <div className='mb-6'>
                  <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center'>
                    <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                  </div>
                  <h3 id='upload-modal-title' className='text-2xl font-bold text-theme-primary mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    {profile?.profilePic ? 'Update Photo' : 'Add Photo'}
                  </h3>
                  <p id='upload-modal-description' className='text-theme-muted text-sm' style={{ fontFamily: 'Inter, system-ui' }}>
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
                        className='w-full h-full rounded-full object-cover border-4 glass-border shadow-2xl'
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
                    className='px-6 py-3 glass-border text-theme-primary rounded-xl hover:glass-hover-bg disabled:opacity-50 transition-all duration-200 font-medium'
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={profile?.profilePic ? handleUpdateProfilePicture : handleUploadProfilePicture}
                    disabled={isUploading || !selectedFile}
                    className='px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary rounded-xl hover:from-brand-primary/90 hover:to-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg shadow-brand-primary/25'
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
                    className='mt-6 p-4 glass-card'
                  >
                    <p className='text-xs text-theme-muted' style={{ fontFamily: 'Inter, system-ui' }}>
                      📝 Choose JPG, JPEG, or PNG • Max 2MB
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CaptainBottomNav />
    </div>
  )
}

export default CaptainProfile