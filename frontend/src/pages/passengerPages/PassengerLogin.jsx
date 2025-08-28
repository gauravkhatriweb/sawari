import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import logo from '../../assets/branding/sawaridotpk_main_logo.png'

const PassengerLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { loginPassenger } = useUser()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation prior to API call
    if (!email || !password) {
      setError('Please enter your email and password.')
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

    setIsSubmitting(true)
    try {
      // Prefer context method to standardize state + storage; it also uses axios with proper base URL
      const result = await loginPassenger(email, password, true)
      if (!result.success) {
        const msg = result.message || 'Login failed.'
        toast.dismiss()
        toast.error(msg, { toastId: 'login-error' })
        setError(msg)
        setIsSubmitting(false)
        return
      }
      toast.dismiss()
      toast.success('Logged in successfully')
      navigate('/')
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Login failed.'
      setError(message)
      toast.dismiss()
      toast.error(message, { toastId: 'login-error' })
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
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Welcome back</h1>
              <p className='mt-1 text-sm text-gray-300'>Ride better. Pay smarter with Sawari.pk.</p>
            </div>

            <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
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
                    aria-invalid={Boolean(error)}
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
                    placeholder='••••••••'
                    aria-invalid={Boolean(error)}
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
                <div className='mt-2 flex items-center justify-end'>
                  <Link to='/passenger/forgot-password' className='text-xs text-gray-300 hover:text-white'>
                    Forgot password?
                  </Link>
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
                {isSubmitting ? 'Signing in…' : 'Log in'}
              </button>

              <div className='mt-3 flex items-center justify-between text-xs text-gray-300'>
                <span>Don’t have an account?</span>
                <Link to='/passenger/register' className='font-medium text-white'>Create account</Link>
              </div>

              <div className='relative mt-6'>
                <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                  <span className='w-full border-t border-white/10'></span>
                </div>
                <div className='relative flex justify-center text-xs'>
                  <span className='bg-white/5 px-2 text-gray-400'>or</span>
                </div>
              </div>

              <button
                type='button'
                onClick={() => navigate('/captain/login')}
                className='inline-flex w-full items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm sm:text-base font-semibold text-white ring-1 ring-white/10 transition-[background-color,transform] hover:bg-white/15 hover:scale-[1.005]'
              >
                Log in as Captain
              </button>
            </form>
          </div>

          <div className='mt-6 text-center text-xs text-gray-400'>
            By continuing, you agree to our
            <Link to='/legal/terms' className='mx-1 underline decoration-white/40 hover:decoration-white'> Terms</Link>
            and
            <Link to='/legal/privacy' className='mx-1 underline decoration-white/40 hover:decoration-white'> Privacy Policy</Link>.
          </div>
        </section>
      </main>
    </div>
  )
}

export default PassengerLogin 