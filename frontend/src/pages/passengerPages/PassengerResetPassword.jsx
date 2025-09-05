import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import logo from '../../assets/branding/sawaridotpk_main_logo.png'

const PassengerResetPassword = () => {
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
      navigate('/passenger/forgot-password')
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
      await axios.post(`${apiBase}/api/passengers/send-reset-password-otp`, {
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
      
      const response = await axios.post(`${apiBase}/api/passengers/reset-password`, {
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
        navigate('/passenger/login')
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
    <div className='relative min-h-screen w-full bg-theme-background text-theme-primary overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-primary blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-secondary blur-3xl opacity-25' />
      
      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
          {/* Logo following brand guidelines */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-primary'>
              <div className='rounded-2xl bg-theme-background p-3'>
                <img src={logo} alt='Sawari logo' className='h-9 w-9' />
              </div>
            </div>
          </div>
          
          <div className='rounded-2xl glass-border glass-bg p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Reset your password
              </h1>
              <p className='mt-2 text-sm text-theme-secondary' style={{ fontFamily: 'Inter, system-ui' }}>
                Enter the 6-digit code sent to <span className='text-brand-primary font-medium'>{email}</span> and create a new password.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
              {/* OTP Input Section */}
              <div>
                <label className='block text-sm font-medium mb-3 text-center' style={{ fontFamily: 'Inter, system-ui' }}>
                  Enter Reset Code
                </label>
                
                {/* Individual OTP input boxes */}
                <div className='flex justify-center gap-3 mb-4'>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type='text'
                      inputMode='numeric'
                      maxLength='1'
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined} // Only first input handles paste
                      className='w-12 h-12 text-center text-lg font-bold rounded-xl glass-border bg-theme-surface text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200'
                      style={{ fontFamily: 'Inter, system-ui' }}
                      aria-label={`Reset code digit ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Paste instruction */}
                <p className='text-xs text-theme-muted text-center mb-4' style={{ fontFamily: 'Inter, system-ui' }}>
                  💡 Tip: You can paste your 6-digit code directly
                </p>
              </div>

              {/* Password Input Section */}
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
                      placeholder='Enter your new password'
                      className='block w-full rounded-lg glass-border bg-theme-surface px-4 py-3 pr-12 text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200'
                      style={{ fontFamily: 'Inter, system-ui' }}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 flex items-center pr-3 text-theme-muted hover:text-theme-primary transition-colors'
                    >
                      {showPassword ? (
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21' />
                        </svg>
                      ) : (
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                        </svg>
                      )}
                    </button>
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
                      className='absolute inset-y-0 right-0 flex items-center pr-3 text-theme-muted hover:text-theme-primary transition-colors'
                    >
                      {showConfirmPassword ? (
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21' />
                        </svg>
                      ) : (
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password requirements */}
                <div className='text-xs text-theme-muted space-y-1' style={{ fontFamily: 'Inter, system-ui' }}>
                  <div className='flex items-center gap-2'>
                    <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <span>At least 6 characters</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className={`w-2 h-2 rounded-full ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
              
              <button
                type='submit'
                disabled={loading || otp.join('').length !== 6 || !newPassword || !confirmPassword}
                className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-bold text-theme-primary shadow-[0_8px_30px_rgb(0,0,0,0.35)] glass-border transition-[transform,background-color,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                  loading || otp.join('').length !== 6 || !newPassword || !confirmPassword
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
                    Resetting Password…
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                    Reset Password
                  </>
                )}
              </button>
              
              {/* Timer and Resend OTP section */}
              <div className='text-center space-y-3'>
                {/* Main countdown timer */}
                <div className='flex items-center justify-center gap-2'>
                  <svg className='w-4 h-4 text-theme-muted' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='text-sm text-theme-muted' style={{ fontFamily: 'Inter, system-ui' }}>
                    Code expires in: <span className='text-brand-primary font-medium'>{formatTime(timeLeft)}</span>
                  </span>
                </div>
                
                {/* Resend OTP */}
                <div>
                  <p className='text-xs text-theme-muted mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                    Didn't receive the code?
                  </p>
                  <button
                    type='button'
                    disabled={!canResend || resendCooldown > 0}
                    onClick={handleResendOtp}
                    className={`text-sm font-medium transition-colors ${
                      canResend && resendCooldown === 0
                        ? 'text-brand-primary hover:text-brand-secondary cursor-pointer'
                        : 'text-theme-muted cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Navigation help */}
          <div className='mt-6 text-center space-y-2'>
            <Link
              to='/passenger/login'
              className='block text-xs text-theme-muted hover:text-theme-primary transition-colors'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              ← Back to Login
            </Link>
            <Link
              to='/passenger/forgot-password'
              className='block text-xs text-theme-muted hover:text-theme-primary transition-colors'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              Use a different email address
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PassengerResetPassword