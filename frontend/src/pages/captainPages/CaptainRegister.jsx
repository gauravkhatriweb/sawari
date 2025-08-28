import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/branding/sawaridotpk_main_logo.png'
import axios from 'axios'
import { toast } from 'react-toastify'

const currentYear = new Date().getFullYear()

const CaptainRegister = () => {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [vehicleType, setVehicleType] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleColor, setVehicleColor] = useState('')
  const [numberPlate, setNumberPlate] = useState('')
  const [capacity, setCapacity] = useState('')

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const numberPlateRegex = /^[A-Z]{2,3}-\d{1,4}$/

  const validateStepOne = () => {
    if (!firstName || !email || !password) {
      setError('Please fill in first name, email, and password.')
      return false
    }
    if (firstName.trim().length < 3) {
      setError('First name must be at least 3 characters.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return false
    }
    return true
  }

  const handleNext = (e) => {
    e.preventDefault()
    setError('')
    if (validateStepOne()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!firstName || !email || !password) {
      setError('Please fill in first name, email, and password.')
      return
    }
    if (firstName.trim().length < 3) {
      setError('First name must be at least 3 characters.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!vehicleType || !vehicleMake || !vehicleModel || !vehicleColor || !numberPlate || !capacity) {
      setError('Please complete all required vehicle details.')
      return
    }

    const yearNum = Number(vehicleYear)
    if (vehicleYear && (isNaN(yearNum) || yearNum < 1990 || yearNum > currentYear)) {
      setError(`Year must be between 1990 and ${currentYear}.`)
      return
    }

    const capacityNum = Number(capacity)
    if (isNaN(capacityNum) || capacityNum < 2) {
      setError('Capacity must be at least 2.')
      return
    }

    if (!numberPlateRegex.test(numberPlate)) {
      setError('Number plate must match format e.g., LEB-1234 or KAR-999.')
      return
    }

    setIsSubmitting(true)
    try {
      // Resolve API base URL, fallback to README default
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'

      // Build payload to match backend schema. Lastname is optional and omitted when blank.
      const payload = {
        firstname: firstName,
        ...(lastName && lastName.trim() ? { lastname: lastName.trim() } : {}),
        email,
        password,
        vehicle: {
          type: vehicleType,
          make: vehicleMake,
          model: vehicleModel,
          ...(vehicleYear ? { year: Number(vehicleYear) } : {}),
          color: vehicleColor,
          numberPlate: numberPlate.toUpperCase(),
          capacity: Number(capacity),
        },
        // Location is required by backend, but not collected in the form
        location: {
          latitude: 0,
          longitude: 0,
        },
      }

      const { data } = await axios.post(`${apiBase}/api/captain/register`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      // Store captain authentication data for verification flow
      const record = JSON.stringify({ type: 'captain', user: data?.captain || null, token: data?.token || null })
      try {
        // For registration, default to sessionStorage (temporary session)
        // This will be updated to localStorage if user chooses "remember me" on login
        sessionStorage.setItem('sawari_auth', record)
        localStorage.removeItem('sawari_auth')
        // Clean up any legacy captain auth keys
        localStorage.removeItem('sawari_captain_auth')
        sessionStorage.removeItem('sawari_captain_auth')
      } catch (_) {}

      toast.dismiss()
      toast.success(data?.message || 'Captain registered successfully')
      
      // After successful registration, try to send verification OTP
      try {
        await axios.post(`${apiBase}/api/captain/send-verification-otp`, {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(data?.token ? { Authorization: `Bearer ${data.token}` } : {}),
          },
        })
        toast.success('Verification OTP sent to your email')
        navigate('/captain/verify-otp')
      } catch (otpErr) {
        // If OTP sending fails, still redirect to home with a notice
        console.warn('Failed to send verification OTP:', otpErr)
        toast.info('Please verify your account from the dashboard')
        navigate('/captain/home')
      }
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      const apiErrors = err?.response?.data?.errors
      const firstError = Array.isArray(apiErrors) && apiErrors.length ? apiErrors[0]?.msg || apiErrors[0] : null
      const message = firstError || apiMessage || err?.message || 'Registration failed. Please try again.'
      setError(message)
      toast.dismiss()
      toast.error(message, { toastId: 'captain-register-error' })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white overflow-hidden'>
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-2xl'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1]'>
              <div className='rounded-2xl bg-[#1A1A1A] p-3'>
                <img src={logo} alt='Sawari.pk logo' className='h-9 w-9' />
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            {/* Back button */}
            <div className='mb-4'>
              <button 
                onClick={() => navigate('/captain/login')} 
                className='inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                </svg>
                Back to Login
              </button>
            </div>

            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Captain registration</h1>
              <p className='mt-1 text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>Create your account and add your vehicle details.</p>
            </div>

            <div className='mt-5 flex items-center justify-center gap-2 text-xs'>
              <div className={`h-1.5 w-16 rounded-full ${step === 1 ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`h-1.5 w-16 rounded-full ${step === 2 ? 'bg-white' : 'bg-white/30'}`} />
            </div>

            <form onSubmit={step === 1 ? handleNext : handleSubmit} className='mt-6 space-y-5'>
              {step === 1 && (<>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='firstName' className='block text-sm font-medium mb-1'>First name</label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <circle cx='12' cy='8' r='3.5' stroke='currentColor' strokeWidth='1.5'/>
                        <path d='M5 19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                      </svg>
                    </span>
                    <input id='firstName' type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='First name' className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                </div>
                <div>
                  <label htmlFor='lastName' className='block text-sm font-medium mb-1'>Last name (optional)</label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <circle cx='12' cy='8' r='3.5' stroke='currentColor' strokeWidth='1.5'/>
                        <path d='M5 19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                      </svg>
                    </span>
                    <input id='lastName' type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Last name (optional)' className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='email' className='block text-sm font-medium mb-1'>Email</label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5Z' stroke='currentColor' strokeWidth='1.5'/>
                        <path d='M5 7L12 12L19 7' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                      </svg>
                    </span>
                    <input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='you@example.com' className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                </div>
                <div>
                  <label htmlFor='password' className='block text-sm font-medium mb-1'>Password</label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <rect x='4.75' y='10' width='14.5' height='9.5' rx='2.25' stroke='currentColor' strokeWidth='1.5'/>
                        <path d='M8 10V8.5C8 6.01472 10.0147 4 12.5 4V4C14.9853 4 17 6.01472 17 8.5V10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                      </svg>
                    </span>
                    <input id='password' type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Create a password' className='w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-12 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                    <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 hover:text-white' aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className='rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300'>
                  {error}
                </div>
              )}

              <div className='flex items-center justify-end'>
                <button type='submit' className='inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white ring-1 ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:scale-[1.01] transition'>
                  Next
                </button>
              </div>
              </>)}

              {step === 2 && (
              <div>
                <h2 className='text-sm font-semibold text-gray-200'>Vehicle details</h2>
                <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='vehicleType' className='block text-sm font-medium mb-1'>Type</label>
                    <select id='vehicleType' value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className='w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent'>
                      <option value='' disabled>Choose type</option>
                      <option value='car'>Car</option>
                      <option value='bike'>Bike</option>
                      <option value='rickshaw'>Rickshaw</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor='vehicleMake' className='block text-sm font-medium mb-1'>Make</label>
                    <input id='vehicleMake' type='text' value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder='e.g., Toyota' className='w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                  <div>
                    <label htmlFor='vehicleModel' className='block text-sm font-medium mb-1'>Model</label>
                    <input id='vehicleModel' type='text' value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder='e.g., Corolla' className='w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                  <div>
                    <label htmlFor='vehicleYear' className='block text-sm font-medium mb-1'>Year</label>
                    <input id='vehicleYear' type='number' inputMode='numeric' min='1990' max={currentYear} value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} placeholder={`1990 - ${currentYear}`} className='w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                  <div>
                    <label htmlFor='vehicleColor' className='block text-sm font-medium mb-1'>Color</label>
                    <input id='vehicleColor' type='text' value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} placeholder='e.g., White' className='w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                  <div>
                    <label htmlFor='capacity' className='block text-sm font-medium mb-1'>Capacity</label>
                    <input id='capacity' type='number' inputMode='numeric' min='2' value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder='e.g., 4' className='w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                  </div>
                  <div className='sm:col-span-2'>
                    <label htmlFor='numberPlate' className='block text-sm font-medium mb-1'>Number plate</label>
                    <div className='relative'>
                      <input id='numberPlate' type='text' value={numberPlate} onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} placeholder='LEB-1234' className='w-full uppercase tracking-wider rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DA6FF] focus:border-transparent' />
                      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400'>AA-1234</span>
                    </div>
                    <p className='mt-1 text-[11px] text-gray-400'>Format: 2–3 letters, dash, 1–4 digits (e.g., LEB-1234).</p>
                  </div>
                </div>

                {error && (
                  <div className='mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300'>
                    {error}
                  </div>
                )}

                <div className='mt-4 flex items-center justify-between'>
                  <button type='button' onClick={() => { setError(''); setStep(1) }} className='inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15'>
                    Back
                  </button>
                  <button type='submit' disabled={isSubmitting} className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-white/10 transition-[transform,background-color,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] ${isSubmitting ? 'bg-black/70 opacity-75' : 'bg-black'}`}>
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                  </button>
                </div>

                <div className='mt-3 flex items-center justify-between text-xs text-gray-300'>
                  <span>Already have an account?</span>
                  <Link to='/captain/login' className='font-medium text-white'>Log in</Link>
                </div>
              </div>
              )}
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

export default CaptainRegister