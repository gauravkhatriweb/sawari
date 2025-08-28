import React from 'react'
import logo from '../assets/branding/sawaridotpk_main_logo.png'

const Footer = () => {
  return (
    <footer className='text-white bg-[#0E0E0E]'>
      <div className='h-[1px] w-full bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1]' />
      <div className='mx-auto max-w-screen-xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div>
          <div className='flex items-center gap-2'>
            <img src={logo} alt='Sawari.pk logo' className='h-8 w-8' />
            <span className='font-semibold'>Sawari.pk</span>
          </div>
          <p className='mt-3 text-sm text-white/80'>Pakistan’s smarter way to move. Affordable, safe, and always on time.</p>
          <div className='mt-4 flex items-center gap-3 text-white/80'>
            <a aria-label='Facebook' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
              f
            </a>
            <a aria-label='Twitter' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
              x
            </a>
            <a aria-label='Instagram' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
              ig
            </a>
            <a aria-label='LinkedIn' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
              in
            </a>
          </div>
        </div>
        <div>
          <h4 className='font-semibold'>Quick Links</h4>
          <ul className='mt-3 space-y-2 text-sm text-white/80'>
            <li><a href='#home' className='hover:underline'>Home</a></li>
            <li><a href='#passengers' className='hover:underline'>Passengers</a></li>
            <li><a href='#drivers' className='hover:underline'>Drivers</a></li>
            <li><a href='/legal/terms' className='hover:underline'>Legal</a></li>
            <li><a href='#contact' className='hover:underline'>Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>For Passengers</h4>
          <ul className='mt-3 space-y-2 text-sm text-white/80'>
            <li><a href='#passengers' className='hover:underline'>Affordable Rides</a></li>
            <li><a href='#passengers' className='hover:underline'>Safety First</a></li>
            <li><a href='#passengers' className='hover:underline'>Seamless Booking</a></li>
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>For Drivers</h4>
          <ul className='mt-3 space-y-2 text-sm text-white/80'>
            <li><a href='#drivers' className='hover:underline'>Instant Earnings</a></li>
            <li><a href='#drivers' className='hover:underline'>Flexible Hours</a></li>
            <li><a href='#drivers' className='hover:underline'>Lowest Commission</a></li>
          </ul>
        </div>
      </div>
      <div className='border-t border-white/10'>
        <div className='mx-auto max-w-screen-xl px-6 py-4 text-center text-xs text-white/70'>© 2025 Sawari.pk. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default Footer


