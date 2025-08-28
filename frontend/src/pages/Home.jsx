import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/branding/sawaridotpk_main_logo.png'
import { motion, useScroll, useTransform } from 'framer-motion'
import Navbar from '../components/Navbar' // Import the proper Navbar component

// Reusable feature card with hover/spring and reveal animations (dark theme)
const FeatureCard = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.99 }}
    className='rounded-2xl p-[1px] bg-transparent'
  >
    <div className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'>
      <h3 className='text-base font-semibold'>{title}</h3>
      <p className='mt-1 text-sm text-white/80'>{description}</p>
    </div>
  </motion.div>
)

const Home = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  // Framer Motion scroll progress for parallax elements
  const { scrollYProgress } = useScroll()
  const carY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const bikeY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const carOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.85])
  const bikeOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  // Navbar blur/background change on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll spy for navbar highlighting
  useEffect(() => {
    const ids = ['home', 'passengers', 'drivers', 'contact']
    const observers = []
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(id)),
        { threshold: 0.6 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const baseWrap = 'bg-[#0B0B0B] text-white min-h-screen'

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Footer navigation items with same pattern as Navbar
  const footerSections = {
    passengers: [
      { id: 'passengers', label: 'Affordable Rides' },
      { id: 'passengers', label: 'Safety First' },
      { id: 'passengers', label: 'Seamless Booking' }
    ],
    drivers: [
      { id: 'drivers', label: 'Instant Earnings' },
      { id: 'drivers', label: 'Flexible Hours' },
      { id: 'drivers', label: 'Lowest Commission' }
    ],
    company: [
      { path: '/about', label: 'About' },
      { path: '/legal/terms', label: 'Terms' },
      { path: '/legal/privacy', label: 'Privacy' },
      { id: 'contact', label: 'Contact' },
      { path: '/legal/faq', label: 'FAQ' }
    ]
  }

  const handleFooterNavigation = (item) => {
    if (item.path) {
      navigate(item.path)
    } else if (item.id) {
      scrollTo(item.id)
    }
  }

  // Note: Using imported Navbar component instead of local one to get authentication features

  // Hero section with solid dark background, parallax illustrations, and animated text
  const Hero = () => (
    <section id='home' className='relative overflow-hidden bg-[#1A1A1A] text-white'>
      <div className='relative mx-auto max-w-screen-xl px-6 pt-36 pb-20 text-center'>
        <motion.h1
          className='text-3xl sm:text-4xl md:text-5xl font-bold'
          style={{ fontFamily: 'Poppins, Inter, system-ui' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Sawari – Pakistan’s smarter way to move.
        </motion.h1>
        <motion.p
          className='mx-auto mt-3 max-w-2xl text-sm sm:text-base text-white/80'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Affordable, safe, and always on time.
        </motion.p>
        <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/passenger/register')} className='rounded-full bg-[#4DA6FF] hover:brightness-110 px-6 py-3 text-white font-semibold shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4DA6FF]'>Book a Ride</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/captain/register')} className='rounded-full border border-white/20 px-6 py-3 text-white font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40'>Drive with Us</motion.button>
        </div>
        {/* Hero illustration removed per request */}
      </div>
    </section>
  )

  // Features sections (Passengers and Drivers)
  const Features = () => (
    <div id='features'>
      <section id='passengers' className='py-16 bg-[#0B0B0B]'>
        <div className='mx-auto max-w-screen-xl px-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
            <div>
              <h2 className='text-2xl sm:text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>For Passengers</h2>
              <p className='mt-2 text-white/80'>Affordable Rides. Safety First. Seamless Booking.</p>
            </div>
            <motion.div
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, amount: 0.2 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <FeatureCard title='Reliable & On-Time Rides' description='Arrive when you expect to. We prioritize punctuality and reliability.' />
              <FeatureCard title='Ride Assurance Guarantee' description='We back every ride with our assurance program for peace of mind.' />
              <FeatureCard title='Affordable Rides' description='Transparent pricing with no surprises.' />
              <FeatureCard title='Safety First' description='Verified drivers, secure rides, and 24/7 support.' />
              <FeatureCard title='Seamless Booking' description='Book in seconds with a smooth, intuitive experience.' />
            </motion.div>
          </div>
        </div>
      </section>

      <section id='drivers' className='py-16 bg-[#1A1A1A] text-white'>
        <div className='mx-auto max-w-screen-xl px-6'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
            <div>
              <h2 className='text-2xl sm:text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Drive with Sawari.pk</h2>
              <p className='mt-2 text-white/80'>Instant Earnings. Flexible Hours. Smart Matching.</p>
            </div>
            <button onClick={() => navigate('/captain/register')} className='self-start md:self-auto rounded-full bg-[#4DA6FF] hover:brightness-110 px-6 py-3 text-white font-semibold shadow hover:shadow-lg transition'>Register as Driver</button>
          </div>
          <motion.div
            className='mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            <FeatureCard title='Lowest Commission in Pakistan' description='Keep more of what you earn with our market-leading commission.' />
            <FeatureCard title='Driver Growth Program' description='Upskill and grow with training and incentives.' />
            <FeatureCard title='Instant Earnings' description='Quick payouts and transparent earnings.' />
            <FeatureCard title='Flexible Hours' description='Drive on your schedule, no strings attached.' />
            <FeatureCard title='Smart Matching System' description='Get rides that fit your route and preferences.' />
          </motion.div>
        </div>
      </section>

      <section id='contact' className='py-16'>
        <div className='mx-auto max-w-screen-xl px-6'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-6 text-center'>
            <h2 className='text-2xl sm:text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Get in touch</h2>
            <p className='mt-2 text-white/80'>Questions or feedback? We’re here to help.</p>
            <button className='mt-4 rounded-full bg-[#4DA6FF] hover:brightness-110 px-6 py-3 text-white font-semibold shadow hover:scale-[1.02] hover:shadow-lg transition'>Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  )

  // Premium footer layout with multiple columns and social links
  const Footer = () => (
    <footer className='text-white bg-[#0E0E0E]'>
      <div className='h-[1px] w-full bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1]' />
      <div className='mx-auto max-w-6xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div>
          <div className='flex items-center gap-2'>
            <img src={logo} alt='Sawari logo' className='h-8 w-8' />
            <span className='font-semibold'>Sawari</span>
          </div>
          <p className='mt-3 text-sm text-white/80'>Pakistan’s smarter way to move. Affordable, safe, and always on time.</p>
          <div className='mt-4 flex items-center gap-3 text-white/80'>
            <a aria-label='Facebook' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15 3h-3a5 5 0 0 0-5 5v3H5v4h2v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1h3V3z' fill='currentColor' /></svg>
            </a>
            <a aria-label='Twitter' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M22 5.8c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.1 1.6-2-.8.5-1.6.8-2.5 1A3.6 3.6 0 0 0 12 7.6c0 .3 0 .6.1.9-3-.1-5.7-1.6-7.5-4-.3.6-.4 1.2-.4 1.9 0 1.3.7 2.6 1.8 3.3-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.6 3.1 4a3.6 3.6 0 0 1-1.6.1c.5 1.6 2 2.8 3.7 2.8A7.3 7.3 0 0 1 2 19.5 10.3 10.3 0 0 0 7.6 21c6.9 0 10.7-5.7 10.7-10.7v-.5c.7-.5 1.3-1.1 1.7-1.8z' fill='currentColor' /></svg>
            </a>
            <a aria-label='Instagram' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm6-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z' fill='currentColor' /></svg>
            </a>
            <a aria-label='LinkedIn' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M6 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-2 6h4v8H4v-8zm6 0h3.6v1.1h.1c.5-.8 1.6-1.3 2.7-1.3 2.9 0 3.5 1.9 3.5 4.3V20h-4v-3.6c0-.9 0-2-1.2-2s-1.4 1-1.4 1.9V20h-4v-8z' fill='currentColor' /></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className='font-semibold'>For Passengers</h4>
          <ul className='mt-3 space-y-2 text-sm text-white/80'>
            {footerSections.passengers.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleFooterNavigation(item)}
                  className='hover:underline hover:text-white transition-colors cursor-pointer text-left'
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>For Drivers</h4>
          <ul className='mt-3 space-y-2 text-sm text-white/80'>
            {footerSections.drivers.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleFooterNavigation(item)}
                  className='hover:underline hover:text-white transition-colors cursor-pointer text-left'
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>Company</h4>
          <ul className='mt-3 space-y-2 text-sm text-white/80'>
            {footerSections.company.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleFooterNavigation(item)}
                  className='hover:underline hover:text-white transition-colors cursor-pointer text-left'
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className='border-t border-white/10'>
        <div className='mx-auto max-w-6xl px-6 py-4 text-center text-xs text-white/70'>© 2025 Sawari. All rights reserved.</div>
      </div>
    </footer>
  )

  return (
    <div className={baseWrap} style={{ fontFamily: 'Inter, system-ui' }}>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}

export default Home