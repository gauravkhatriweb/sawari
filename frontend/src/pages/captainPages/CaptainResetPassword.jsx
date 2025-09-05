import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import logo from '../../assets/branding/sawaridotpk_main_logo.png'

const CaptainResetPassword = () => {
  // Store OTP as array of 6 digits for individual input boxes
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email from navigation state or redirect if not present
  const email = location.state?.email
  
  // Refs for each input box to handle focus management
  const inputRefs = useRef([])
  
  // Timer states for countdown and resend functionality
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0) // 1 minute cooldown

  // Redirect to forgot password if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Please request a password reset first')
      navigate('/captain/forgot-password')
    }
  }, [email, navigate])

  // Handle individual OTP input changes
  const handleInputChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  // Handle paste functionality - auto-fill all boxes
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '') // Remove non-digits
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('').slice(0, 6)
      setOtp(newOtp)
      // Focus last input after paste
      inputRefs.current[5]?.focus()
    }
  }
  
  // Handle backspace to move to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  // Auto-focus first input on component mount and start countdown
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])
  
  // Main countdown timer (10 minutes)
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Time expired, redirect or show message
      toast.error('OTP has expired. Please request a new one.')
    }
  }, [timeLeft])
  
  // Resend cooldown timer (1 minute)
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCooldown, canResend])
  
  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resendCooldown > 0 || !email) return
    
    try {
      setCanResend(false)
      setResendCooldown(60) // 1 minute cooldown
      
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      await axios.post(`${apiBase}/api/captain/send-reset-password-otp`, {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      // Reset main timer to 10 minutes
      setTimeLeft(600)
      // Clear existing OTP
      setOtp(['', '', '', '', '', ''])
      // Focus first input
      inputRefs.current[0]?.focus()
      
      toast.success('New reset code sent to your email')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send reset code'
      toast.error(msg)
      setCanResend(true)
      setResendCooldown(0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    // Validation
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }

    if (!newPassword.trim()) {
      toast.error('Please enter a new password')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const response = await axios.post(`${apiBase}/api/captain/reset-password`, {
        email: email,
        otp: otpString,
        newPassword: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.data.success) {
        toast.success('Password reset successfully! Please login with your new password.')
        navigate('/captain/login')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      const msg = err?.response?.data?.message || 'Invalid or expired OTP. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Don't render if no email
  if (!email) {
    return null
  }

  return (
    <div className='relative min-h-screen w-full bg-theme-base text-theme-primary overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-brand-accent via-brand-primary to-brand-secondary blur-3xl opacity-25' />
      
      <main className='relative z-10 flex min-h-screen items-center justify-center px-6 py-8'>
        <section className='w-full max-w-md'>
          {/* Logo following brand guidelines */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent'>
              <div className='rounded-2xl bg-theme-base p-3'>
                <img src={logo} alt='Sawari logo' className='h-9 w-9' />
              </div>
            </div>
          </div>
          
          <div className='rounded-2xl glass-border glass-bg p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            {/* Back button */}
            <div className='mb-4'>
              <button 
                onClick={() => navigate('/captain/forgot-password')} 
                className='inline-flex items-center gap-2 text-sm text-theme-muted hover:text-theme-primary transition-colors'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                </svg>
                Back
              </button>
            </div>

            <div className='text-center mb-6'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Reset your password
              </h1>
              <p className='mt-2 text-sm text-theme-secondary' style={{ fontFamily: 'Inter, system-ui' }}>
                Enter the 6-digit code sent to <strong>{email}</strong> and create a new password.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* OTP Input Section */}
              <div>
                <label className='block text-sm font-medium mb-3 text-center' style={{ fontFamily: 'Inter, system-ui' }}>
                  Verification Code
                </label>
                <div className='flex justify-center gap-2 sm:gap-3'>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      type='text'
                      inputMode='numeric'
                      maxLength='1'
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className='w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl glass-border bg-theme-surface text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    />
                  ))}
                </div>
                
                {/* Timer and resend section */}
                <div className='mt-4 text-center'>
                  <div className='text-xs text-theme-muted mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                    ⏱️ Code expires in: <strong className='text-theme-primary'>{formatTime(timeLeft)}</strong>
                  </div>
                  <button
                    type='button'
                    onClick={handleResendOtp}
                    disabled={!canResend || resendCooldown > 0}
                    className={`text-xs transition-colors ${
                      canResend && resendCooldown === 0
                        ? 'text-brand-primary hover:text-brand-secondary cursor-pointer'
                        : 'text-theme-muted cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </div>

              {/* New Password Section */}
              <div className='space-y-4'>
                <div>
                  <label htmlFor='newPassword' className='block text-sm font-medium mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                    New Password
                  </label>
                  <div className='relative'>
                    <input
                      id='newPassword'
                      name='newPassword'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='new-password'
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder='Create a new password'
                      className='block w-full rounded-lg glass-border bg-theme-surface px-4 py-3 pr-12 text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-theme-muted hover:text-theme-primary transition-colors'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  <div className='mt-2 text-xs text-theme-muted' style={{ fontFamily: 'Inter, system-ui' }}>
                    {newPassword.length > 0 && (
                      <div className='flex items-center gap-2'>
                        <div className={`h-1 w-6 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={newPassword.length >= 6 ? 'text-green-400' : 'text-red-400'}>
                          {newPassword.length >= 6 ? 'Strong password' : 'At least 6 characters'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor='confirmPassword' className='block text-sm font-medium mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                    Confirm New Password
                  </label>
                  <div className='relative'>
                    <input
                      id='confirmPassword'
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete='new-password'
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder='Confirm your new password'
                      className='block w-full rounded-lg glass-border bg-theme-surface px-4 py-3 pr-12 text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-theme-muted hover:text-theme-primary transition-colors'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {/* Password match indicator */}
                  {confirmPassword.length > 0 && (
                    <div className='mt-2 text-xs' style={{ fontFamily: 'Inter, system-ui' }}>
                      <div className='flex items-center gap-2'>
                        <div className={`h-1 w-6 rounded ${newPassword === confirmPassword ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'}>
                          {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-bold text-theme-primary shadow-[0_8px_30px_rgb(0,0,0,0.35)] glass-border transition-[transform,background-color,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                  loading
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-brand-primary hover:brightness-110'
                }`}
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                {loading ? (
                  <>
                    <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-theme-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Resetting password…
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Reset Password
                  </>
                )}
              </button>
              
              {/* Additional info */}
              <div className='text-center'>
                <p className='text-xs text-theme-muted' style={{ fontFamily: 'Inter, system-ui' }}>
                  💡 After resetting, you'll be redirected to login with your new password
                </p>
              </div>
            </form>
          </div>
          
          {/* Navigation help */}
          <div className='mt-6 text-center'>
            <Link
              to='/captain/login'
              className='text-xs text-theme-muted hover:text-theme-primary transition-colors'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              ← Back to Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default CaptainResetPassword