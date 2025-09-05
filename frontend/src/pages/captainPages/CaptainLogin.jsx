import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/branding/sawaridotpk_main_logo.png'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'

const CaptainLogin = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loginCaptain, loading } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-redirect if already authenticated as captain
  useEffect(() => {
    if (isAuthenticated && user?.type === 'captain') {
      navigate('/captain/home', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation: required fields
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
      const result = await loginCaptain(email, password, true)
      if (result.success) {
        toast.dismiss()
        toast.success('Logged in successfully')
        navigate('/captain/home')
      } else {
        setError(result.message || 'Login failed. Please try again.')
        toast.dismiss()
        toast.error(result.message || 'Login failed. Please try again.', { toastId: 'captain-login-error' })
      }
    } catch (err) {
      const message = err?.message || 'Login failed. Please try again.'
      setError(message)
      toast.dismiss()
      toast.error(message, { toastId: 'captain-login-error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-theme-base text-theme-primary overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-primary/30 via-brand-secondary/30 to-brand-accent/30 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-brand-aqua/25 via-brand-primary/25 to-brand-secondary/25 blur-3xl' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-hero'>
              <div className='rounded-2xl bg-theme-base p-3'>
                <img src={logo} alt='Sawari.pk logo' className='h-9 w-9' />
              </div>
            </div>
          </div>
          <div className='glass-card p-6 sm:p-8'>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Welcome back</h1>
              <p className='mt-1 text-sm text-theme-secondary'>Manage your rides with Sawari.pk.</p>
            </div>

            <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium mb-1'>Email</label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted'>
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
                    className='w-full rounded-xl glass-border bg-theme-surface pl-10 pr-4 py-3 text-sm placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  />
                </div>
              </div>

              <div>
                <label htmlFor='password' className='block text-sm font-medium mb-1'>Password</label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted'>
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
                    className='w-full rounded-xl glass-border bg-theme-surface pl-10 pr-12 py-3 text-sm placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-theme-secondary hover:text-theme-primary'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className='mt-2 flex items-center justify-end'>
                  <Link to='/captain/forgot-password' className='text-xs text-theme-secondary hover:text-theme-primary'>
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
                className={`mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-bold text-theme-primary shadow-[0_8px_30px_rgb(0,0,0,0.35)] glass-border transition-[transform,background-color,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] ${isSubmitting ? 'bg-black/70 opacity-75' : 'bg-black'}`}
              >
                {isSubmitting ? 'Logging in...' : 'Log in as Captain'}
              </button>

              <div className='mt-3 flex items-center justify-between text-xs text-theme-secondary'>
                <span>Don't have an account?</span>
                <Link to='/captain/register' className='font-medium text-theme-primary'>Create account</Link>
              </div>

              <div className='relative mt-6'>
                <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                  <span className='w-full border-t glass-border'></span>
                </div>
                <div className='relative flex justify-center text-xs'>
                  <span className='glass-bg px-2 text-theme-muted'>or</span>
                </div>
              </div>

              <button
                type='button'
                onClick={() => navigate('/passenger/login')}
                className='inline-flex w-full items-center justify-center rounded-full glass-bg px-6 py-3 text-sm sm:text-base font-semibold text-theme-primary glass-border transition-[background-color,transform] hover:glass-hover-bg hover:scale-[1.005]'
              >
                Log in as Passenger
              </button>
            </form>
          </div>

          <div className='mt-6 text-center text-xs text-theme-muted'>
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

export default CaptainLogin