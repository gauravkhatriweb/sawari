import React from 'react'

// Branded hero section with solid brand colors and primary CTAs
const Hero = () => {
  return (
    <section id='home' className='relative overflow-hidden bg-white text-black'>
      <div className='relative mx-auto max-w-6xl px-6 py-24 text-center'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          🚖 Sawari.pk – Pakistan’s smarter way to move.
        </h1>
        <p className='mx-auto mt-3 max-w-2xl text-sm sm:text-base text-[#061A23]/80'>
          Affordable, safe, and always on time.
        </p>
        <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
          <button className='rounded-full bg-[#4DA6FF] px-6 py-3 text-white font-semibold shadow hover:opacity-90'>
            Download App
          </button>
          <button className='rounded-full bg-[#1A1A1A] px-6 py-3 text-white font-semibold ring-1 ring-black/10 hover:opacity-90'>
            Become a Driver
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero


