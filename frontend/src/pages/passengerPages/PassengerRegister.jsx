import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/branding/sawaridotpk_main_logo.png'
import axios from 'axios'
import { toast } from 'react-toastify'

const PassengerRegister = () => {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Basic client-side validation aligned with requirements
    if (!firstName || !email || !password) {
      setError('Please fill in all required fields: first name, email, and password.')
      return
    }
    if (firstName.trim().length < 3) {
      setError('First name must be at least 3 characters.')
      return
    }
    // Last name is optional; validate length only if provided
    if (lastName && lastName.trim().length > 0 && lastName.trim().length < 3) {
      setError('Last name must be at least 3 characters if provided.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    // Confirm password check only on frontend; do not send it to backend
    if (confirmPassword !== password) {
      const msg = 'Passwords do not match.'
      setError(msg)
      toast.dismiss()
      toast.error(msg, { toastId: 'password-mismatch' })
      return
    }
    

    setIsSubmitting(true)
    try {
      // Resolve API base URL from env; fallback to README default
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'

      // Prepare request body as backend expects (send lastname only if provided; never send confirmPassword)
      const payload = {
        firstname: firstName,
        ...(lastName && lastName.trim() ? { lastname: lastName.trim() } : {}),
        email,
        password,
      }
      // Send POST to registration endpoint with explicit JSON headers
      const { data } = await axios.post(`${apiBase}/api/passengers/register`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      toast.dismiss()
      toast.success(data?.message || 'Account created! Please log in.')
      navigate('/passenger/login')
    } catch (err) {
      // Extract an informative error message from API response if available
      const apiMessage = err?.response?.data?.message
      const apiErrors = err?.response?.data?.errors
      const firstError = Array.isArray(apiErrors) && apiErrors.length ? apiErrors[0]?.msg || apiErrors[0] : null
      const message = firstError || apiMessage || err?.message || 'Registration failed. Please try again.'
      // Optional console output for debugging network issues during dev
      if (import.meta.env.DEV) {
        console.error('Passenger register error:', err)
      }
      setError(message)
      toast.dismiss()
      toast.error(message, { toastId: 'register-error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1]'>
              <div className='rounded-2xl bg-[#1A1A1A] p-3'>
                <img src={logo} alt='Sawari.pk logo' className='h-9 w-9' />
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Create your account</h1>
              <p className='mt-1 text-sm text-gray-300'>Join Sawari.pk and ride smarter.</p>
            </div>

            <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='firstName' className='block text-sm font-medium mb-1'>First name</label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      {/* user icon */}
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <circle cx='12' cy='8' r='3.5' stroke='currentColor' strokeWidth='1.5'/>
                        <path d='M5 19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                      </svg>
                    </span>
                    <input
                      id='firstName'
                      type='text'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder='First name'
                      className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent'
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor='lastName' className='block text-sm font-medium mb-1'>Last name (optional)</label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      {/* user icon */}
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <circle cx='12' cy='8' r='3.5' stroke='currentColor' strokeWidth='1.5'/>
                        <path d='M5 19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                      </svg>
                    </span>
                    <input
                      id='lastName'
                      type='text'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder='Last name (optional)'
                      className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent'
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-medium mb-1'>Email</label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                    {/* mail icon */}
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5Z' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M5 7L12 12L19 7' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                    </svg>
                  </span>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='you@example.com'
                    className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent'
                  />
                </div>
              </div>


              <div>
                <label htmlFor='password' className='block text-sm font-medium mb-1'>Password</label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                    {/* lock icon */}
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <rect x='4.75' y='10' width='14.5' height='9.5' rx='2.25' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M8 10V8.5C8 6.01472 10.0147 4 12.5 4V4C14.9853 4 17 6.01472 17 8.5V10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                    </svg>
                  </span>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Create a password'
                    className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-12 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 hover:text-white'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium mb-1'>Confirm password</label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                    {/* lock icon */}
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <rect x='4.75' y='10' width='14.5' height='9.5' rx='2.25' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M8 10V8.5C8 6.01472 10.0147 4 12.5 4V4C14.9853 4 17 6.01472 17 8.5V10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                    </svg>
                  </span>
                  <input
                    id='confirmPassword'
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Re-enter your password'
                    className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-12 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent'
                  />
                </div>
              </div>

              {error && (
                <div className='rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={isSubmitting}
                className={`mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-white/10 transition-[transform,background-color,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] ${isSubmitting ? 'bg-black/70 opacity-75' : 'bg-black'}`}
              >
                {isSubmitting ? 'Registering...' : 'Create account'}
              </button>

              <div className='mt-3 flex items-center justify-between text-xs text-gray-300'>
                <span>Already have an account?</span>
                <Link to='/passenger/login' className='font-medium text-white'>Log in</Link>
              </div>
            </form>
          </div>

          <div className='mt-6 text-center text-xs text-gray-400'>
            By creating an account, you agree to our
            <Link to='/legal/terms' className='mx-1 underline decoration-white/40 hover:decoration-white'> Terms</Link>
            and
            <Link to='/legal/privacy' className='mx-1 underline decoration-white/40 hover:decoration-white'> Privacy Policy</Link>.
          </div>
        </section>
      </main>
    </div>
  )
}

export default PassengerRegister