import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CaptainNavbar from '../../components/CaptainNavbar'
import { useUser } from '../../context/UserContext'

const CaptainHome = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUser()
  const [captain, setCaptain] = useState(null)

  // Redirect if not authenticated or not a captain
  useEffect(() => {
    if (!isAuthenticated || !user || user.type !== 'captain') {
      navigate('/captain/login', { replace: true })
      return
    }
    setCaptain(user)
  }, [isAuthenticated, user, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      toast.dismiss()
      toast.success('Logged out successfully')
      navigate('/captain/login')
    } catch (err) {
      toast.error('Logout failed, but you have been signed out locally')
      navigate('/captain/login')
    }
  }

  if (!captain) return null

  const vehicle = captain?.vehicle || {}

  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white' style={{ fontFamily: 'Inter, system-ui' }}>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />

      {/* Captain Navbar */}
      <CaptainNavbar />

      {/* Main content */}
      <main className='relative z-10 px-6 py-8'>
        <div className='mx-auto max-w-4xl'>
          {/* Welcome section */}
          <div className='mb-8'>
            <h1 className='text-3xl sm:text-4xl font-bold tracking-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Welcome back, {captain?.firstname}! 👋
            </h1>
            <p className='mt-2 text-gray-300'>Ready to start earning? Here's your dashboard overview.</p>
          </div>

          {/* Stats cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.25)]'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-[#4DA6FF]/20 p-3'>
                  <svg className='w-6 h-6 text-[#4DA6FF]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-400'>Total Earnings</p>
                  <p className='text-2xl font-bold text-white'>PKR 0</p>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.25)]'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-[#7CE7E1]/20 p-3'>
                  <svg className='w-6 h-6 text-[#7CE7E1]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-400'>Today's Rides</p>
                  <p className='text-2xl font-bold text-white'>0</p>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.25)]'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-[#FFD65C]/20 p-3'>
                  <svg className='w-6 h-6 text-[#FFD65C]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-400'>Rating</p>
                  <p className='text-2xl font-bold text-white'>5.0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle details section */}
          <div className='rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Vehicle Information</h2>
              <button className='text-sm text-[#4DA6FF] hover:text-[#EFBFFF] transition-colors'>
                Edit Details
              </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
              <div className='rounded-xl border border-white/10 bg-[#111111] p-4'>
                <p className='text-gray-400 mb-1'>Type</p>
                <p className='font-medium text-white'>{vehicle?.type || '-'}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-[#111111] p-4'>
                <p className='text-gray-400 mb-1'>Make</p>
                <p className='font-medium text-white'>{vehicle?.make || '-'}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-[#111111] p-4'>
                <p className='text-gray-400 mb-1'>Model</p>
                <p className='font-medium text-white'>{vehicle?.model || '-'}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-[#111111] p-4'>
                <p className='text-gray-400 mb-1'>Year</p>
                <p className='font-medium text-white'>{vehicle?.year ?? '-'}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-[#111111] p-4'>
                <p className='text-gray-400 mb-1'>Color</p>
                <p className='font-medium text-white'>{vehicle?.color || '-'}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-[#111111] p-4'>
                <p className='text-gray-400 mb-1'>Capacity</p>
                <p className='font-medium text-white'>{vehicle?.capacity ?? '-'}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-[#111111] p-4 sm:col-span-2 lg:col-span-3'>
                <p className='text-gray-400 mb-1'>Number Plate</p>
                <p className='font-medium text-white font-mono text-lg tracking-wider'>{vehicle?.numberPlate || '-'}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className='mt-6 flex flex-col sm:flex-row gap-3'>
              <button className='flex-1 inline-flex items-center justify-center rounded-full bg-[#4DA6FF] hover:brightness-110 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                </svg>
                Start Earning
              </button>
              <button className='flex-1 inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CaptainHome


