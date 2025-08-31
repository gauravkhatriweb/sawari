import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/branding/sawaridotpk_main_logo.png'

const PassengerVerifyOtp = () => {
  // Store OTP as array of 6 digits for individual input boxes
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  // Refs for each input box to handle focus management
  const inputRefs = useRef([])
  
  // Timer states for countdown and resend functionality
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0) // 1 minute cooldown

  // Handle individual input changes
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
  
  // Handle paste functionality - auto-fill all boxes (without notifications)
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
    if (!canResend || resendCooldown > 0) return
    
    try {
      setCanResend(false)
      setResendCooldown(60) // 1 minute cooldown
      
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try { token = JSON.parse(raw)?.token || null } catch (_) {}
      }
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      await axios.post(`${apiBase}/api/passengers/send-verification-otp`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      
      // Reset main timer to 10 minutes
      setTimeLeft(600)
      // Clear existing OTP
      setOtp(['', '', '', '', '', ''])
      // Focus first input
      inputRefs.current[0]?.focus()
      
      toast.success('New OTP sent to your email')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send OTP'
      toast.error(msg)
      setCanResend(true)
      setResendCooldown(0)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    
    setLoading(true)
    try {
      const raw = localStorage.getItem('sawari_auth') || sessionStorage.getItem('sawari_auth')
      let token = null
      if (raw) {
        try { token = JSON.parse(raw)?.token || null } catch (_) {}
      }
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      await axios.post(`${apiBase}/api/passengers/verify-otp`, { otp: otpString }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      toast.success('Account verified successfully')
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid or expired OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />
      
      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
          {/* Logo following brand guidelines */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1]'>
              <div className='rounded-2xl bg-[#1A1A1A] p-3'>
                <img src={logo} alt='Sawari.pk logo' className='h-9 w-9' />
              </div>
            </div>
          </div>
          
          <div className='rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Verify your account</h1>
              <p className='mt-2 text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>Enter the 6-digit OTP sent to your email.</p>
            </div>
            
            <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
              <div>
                <label className='block text-sm font-medium mb-3 text-center' style={{ fontFamily: 'Inter, system-ui' }}>Enter OTP Code</label>
                
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
                      className='w-12 h-12 text-center text-lg font-bold rounded-xl border border-white/10 bg-[#111111] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent transition-all duration-200'
                      style={{ fontFamily: 'Inter, system-ui' }}
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Paste instruction - simplified */}
                <p className='text-xs text-gray-400 text-center mb-4' style={{ fontFamily: 'Inter, system-ui' }}>
                  💡 Tip: You can paste your 6-digit OTP directly
                </p>
              </div>
              
              <button
                type='submit'
                disabled={loading || otp.join('').length !== 6}
                className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-white/10 transition-[transform,background-color,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                  loading || otp.join('').length !== 6
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-[#4DA6FF] hover:brightness-110'
                }`}
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                {loading ? (
                  <>
                    <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Verifying…
                  </>
                ) : (
                  'Verify Account'
                )}
              </button>
              
              {/* Timer and Resend OTP section */}
              <div className='text-center space-y-3'>
                {/* Main countdown timer */}
                <div className='flex items-center justify-center gap-2'>
                  <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='text-sm text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>
                    Code expires in: <span className='text-[#4DA6FF] font-medium'>{formatTime(timeLeft)}</span>
                  </span>
                </div>
                
                {/* Resend OTP */}
                <div>
                  <p className='text-xs text-gray-400 mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                    Didn't receive the code?
                  </p>
                  <button
                    type='button'
                    disabled={!canResend || resendCooldown > 0}
                    onClick={handleResendOtp}
                    className={`text-sm font-medium transition-colors ${
                      canResend && resendCooldown === 0
                        ? 'text-[#4DA6FF] hover:text-[#EFBFFF] cursor-pointer'
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Navigation help */}
          <div className='mt-6 text-center'>
            <button
              onClick={() => navigate('/passenger/home')}
              className='text-xs text-gray-400 hover:text-white transition-colors'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              ← Back to Home
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PassengerVerifyOtp


