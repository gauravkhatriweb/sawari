import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/branding/sawaridotpk_main_logo.png'
import devImage from '../assets/personal/dev_image.png'

const AboutPage = () => {
  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  // Value cards with icons
  const values = [
    {
      icon: '🚖',
      title: 'Affordability',
      description: 'Fair fares for passengers, fair earnings for drivers.'
    },
    {
      icon: '🔒',
      title: 'Safety First',
      description: 'Verified drivers, SOS button, real-time tracking.'
    },
    {
      icon: '🌍',
      title: 'Accessibility',
      description: 'Multiple vehicle types, language support, and cash/digital payments.'
    },
    {
      icon: '💪',
      title: 'Empowerment',
      description: 'Female drivers with Sawari Pink, opportunities for local drivers.'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Transparent pricing and reliable support.'
    }
  ]

  // Impact numbers
  const stats = [
    { number: '50,000+', label: 'Rides Completed' },
    { number: '15+', label: 'Cities Served' },
    { number: '5,000+', label: 'Drivers Onboarded' },
    { number: '25,000+', label: 'Passengers Trust Us' }
  ]

  // Feature highlights
  const passengerFeatures = [
    { icon: '⚡', title: 'Easy Booking', description: 'Book your ride in seconds with our intuitive app' },
    { icon: '🚗', title: 'Multiple Ride Options', description: 'Cars, bikes, and premium vehicles available' },
    { icon: '🛡️', title: 'Safety Features', description: 'Real-time tracking, SOS button, and verified drivers' },
    { icon: '💳', title: 'Flexible Payments', description: 'Cash, wallet, and digital payment options' }
  ]

  const driverFeatures = [
    { icon: '💰', title: 'Higher Earnings', description: 'Lowest commission rates in Pakistan' },
    { icon: '⚡', title: 'Quick Withdrawals', description: 'Instant cash-out and transparent earnings' },
    { icon: '⏰', title: 'Flexible Hours', description: 'Drive on your schedule, no strings attached' },
    { icon: '🎓', title: 'Training & Support', description: 'Comprehensive training and 24/7 support' }
  ]

  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />
      <div className='pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-[#EFBFFF]/10 via-[#7CE7E1]/10 to-[#FFD65C]/10 blur-3xl opacity-40' />

      <main className='relative z-10 mx-auto max-w-6xl px-6 py-12 sm:py-16'>
        
        {/* Back to Home */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <Link 
            to='/' 
            className='inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors'
            style={{ fontFamily: 'Inter, system-ui' }}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Hero Statement */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='text-center mb-20'
        >
          <div className='mx-auto mb-8 inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1]'>
            <div className='rounded-2xl bg-[#1A1A1A] p-4'>
              <img src={logo} alt='Sawari.pk logo' className='h-16 w-16' />
            </div>
          </div>
          
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            About <span className='bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1] bg-clip-text text-transparent'>Sawari.pk</span>
          </h1>
          
          <p className='text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
            Sawari.pk is Pakistan's homegrown ride-hailing platform, built to make everyday travel safer, more affordable, and accessible for everyone.
          </p>
        </motion.section>

        {/* Mission & Vision */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='mb-4'>
              <span className='text-3xl'>🎯</span>
            </div>
            <h2 className='text-2xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Mission</h2>
            <p className='text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
              We exist to revolutionize Pakistan's transportation landscape by providing affordable, safe, and accessible rides for everyone. 
              Our platform empowers both passengers and drivers, with special focus on women's empowerment through our Sawari Pink service, 
              creating opportunities and ensuring safety for all.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='mb-4'>
              <span className='text-3xl'>🚀</span>
            </div>
            <h2 className='text-2xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Vision</h2>
            <p className='text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
              We envision a future where mobility is seamless and inclusive, empowering passengers and drivers alike. 
              Our goal is to connect every Pakistani with reliable, safe, and affordable rides, making transportation a bridge 
              to opportunities rather than a barrier.
            </p>
          </motion.div>
        </motion.section>

        {/* Core Values */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div variants={itemVariants} className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Our Core Values
            </h2>
            <p className='text-gray-300 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              The principles that guide everything we do at Sawari.pk
            </p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-center'
              >
                <div className='text-4xl mb-4'>{value.icon}</div>
                <h3 className='text-lg font-semibold mb-3' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  {value.title}
                </h3>
                <p className='text-sm text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Story */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='flex items-center gap-3 mb-6'>
              <span className='text-3xl'>📖</span>
              <h2 className='text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Story</h2>
            </div>
            
            <div className='prose prose-lg prose-invert max-w-none'>
              <p className='text-gray-300 leading-relaxed mb-6' style={{ fontFamily: 'Inter, system-ui' }}>
                We noticed Pakistan needed a safer, more affordable alternative to international ride-hailing apps. 
                Born from the vision to create a truly Pakistani solution, Sawari.pk was designed specifically for 
                our commuters' needs – understanding our culture, our challenges, and our aspirations.
              </p>
              
              <p className='text-gray-300 leading-relaxed mb-6' style={{ fontFamily: 'Inter, system-ui' }}>
                Starting as a local initiative, we've grown into Pakistan's premier homegrown ride-hailing platform. 
                We're not just another app – we're a movement towards safer, more affordable transportation that 
                puts Pakistani drivers and passengers first.
              </p>
              
              <p className='text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                Every ride on Sawari.pk represents our commitment to building a better Pakistan, one journey at a time. 
                We're proud to be Pakistani, and we're proud to serve Pakistan.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* For Passengers & Drivers */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            
            {/* For Passengers */}
            <motion.div variants={itemVariants}>
              <div className='flex items-center gap-3 mb-6'>
                <span className='text-3xl'>👥</span>
                <h2 className='text-2xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>For Passengers</h2>
              </div>
              
              <div className='space-y-4'>
                {passengerFeatures.map((feature, index) => (
                  <div key={index} className='flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10'>
                    <span className='text-2xl flex-shrink-0'>{feature.icon}</span>
                    <div>
                      <h3 className='font-semibold mb-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.title}
                      </h3>
                      <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* For Drivers */}
            <motion.div variants={itemVariants}>
              <div className='flex items-center gap-3 mb-6'>
                <span className='text-3xl'>🚗</span>
                <h2 className='text-2xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>For Drivers</h2>
              </div>
              
              <div className='space-y-4'>
                {driverFeatures.map((feature, index) => (
                  <div key={index} className='flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10'>
                    <span className='text-2xl flex-shrink-0'>{feature.icon}</span>
                    <div>
                      <h3 className='font-semibold mb-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.title}
                      </h3>
                      <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Unique Feature Highlight - Sawari Pink */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-r from-[#EFBFFF]/10 via-[#FFD65C]/10 to-[#EFBFFF]/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-center'
          >
            <div className='mb-6'>
              <span className='text-5xl'>💗</span>
            </div>
            
            <h2 className='text-3xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Introducing <span className='text-[#EFBFFF]'>Sawari Pink</span>
            </h2>
            
            <p className='text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
              Pakistan's first women-only ride service, ensuring safety and comfort for female passengers and drivers.
            </p>
            
            <div className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#EFBFFF]/20 to-[#FFD65C]/20 border border-[#EFBFFF]/30'>
              <span className='text-[#EFBFFF] font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                Empowering women, one ride at a time
              </span>
            </div>
          </motion.div>
        </motion.section>

        {/* Impact Numbers */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div variants={itemVariants} className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Our Impact
            </h2>
            <p className='text-gray-300 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              The numbers that showcase our growing community
            </p>
          </motion.div>

          <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-center'
              >
                <div className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1] bg-clip-text text-transparent mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  {stat.number}
                </div>
                <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Developer Section */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='flex items-center gap-3 mb-8 justify-center'>
              <span className='text-3xl'>👨‍💻</span>
              <h2 className='text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Meet the Developer</h2>
            </div>
            
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-center'>
              {/* Developer Image */}
              <motion.div 
                variants={itemVariants}
                className='lg:col-span-1 flex justify-center'
              >
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1] rounded-2xl blur-xl opacity-30'></div>
                  <img 
                    src={devImage} 
                    alt='Gaurav Khatri - Founder & Developer' 
                    className='relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover border-2 border-white/20 shadow-2xl'
                  />
                </div>
              </motion.div>
              
              {/* Developer Info */}
              <motion.div 
                variants={itemVariants}
                className='lg:col-span-2 text-center lg:text-left'
              >
                <h3 className='text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-[#4DA6FF] via-[#EFBFFF] to-[#7CE7E1] bg-clip-text text-transparent' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  Gaurav Khatri
                </h3>
                
                <div className='space-y-4 text-gray-300'>
                  <div className='flex items-center gap-2 justify-center lg:justify-start'>
                    <span className='text-xl'>🚀</span>
                    <span className='text-lg font-semibold text-[#EFBFFF]' style={{ fontFamily: 'Inter, system-ui' }}>Founder & Team Member</span>
                  </div>
                  
                  <div className='flex items-center gap-2 justify-center lg:justify-start'>
                    <span className='text-xl'>💻</span>
                    <span className='text-lg font-semibold text-[#7CE7E1]' style={{ fontFamily: 'Inter, system-ui' }}>Solo MERN Stack Developer</span>
                  </div>
                  
                  <div className='flex items-center gap-2 justify-center lg:justify-start'>
                    <span className='text-xl'>🎓</span>
                    <span className='text-base' style={{ fontFamily: 'Inter, system-ui' }}>Learning MERN Stack from Aptech Pakistan</span>
                  </div>
                  
                  <div className='mt-6 p-4 rounded-xl bg-gradient-to-r from-[#4DA6FF]/10 via-[#EFBFFF]/10 to-[#7CE7E1]/10 border border-white/10'>
                    <p className='text-base leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                      Gaurav is the sole developer and visionary behind Sawari.pk, having built this entire MERN stack application 
                      from the ground up. With a passion for creating meaningful technology solutions, he continues to learn 
                      and innovate while developing this comprehensive ride-hailing platform.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Competition Project Notice */}
            <motion.div 
              variants={itemVariants}
              className='mt-8 pt-8 border-t border-white/10'
            >
              <div className='bg-gradient-to-r from-[#FFD65C]/20 via-[#EFBFFF]/20 to-[#4DA6FF]/20 border border-[#FFD65C]/30 rounded-xl p-6 text-center'>
                <div className='flex items-center justify-center gap-2 mb-3'>
                  <span className='text-2xl'>🏆</span>
                  <h4 className='text-xl font-bold text-[#FFD65C]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Competition Project</h4>
                </div>
                <p className='text-gray-300 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
                  <strong>Important Notice:</strong> Sawari.pk is developed as part of a coding competition project, 
                  not as a commercial business venture. This showcase demonstrates full-stack development capabilities 
                  and innovative thinking in the transportation technology space.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='text-center'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Ready to Move Pakistan Forward?
            </h2>
            
            <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              Join Sawari.pk today and be part of Pakistan's transportation revolution — one safe, affordable ride at a time.
            </p>
            
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Link
                to='/passenger/register'
                className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#4DA6FF] to-[#EFBFFF] px-8 py-4 text-white font-semibold shadow-[0_8px_30px_rgba(77,166,255,0.3)] hover:scale-[1.02] transition-transform'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <span className='mr-2'>📱</span>
                Book Your First Ride
              </Link>
              
              <Link
                to='/captain/register'
                className='inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <span className='mr-2'>🚗</span>
                Become a Captain
              </Link>
            </div>
            
            <div className='mt-8 pt-8 border-t border-white/10'>
              <p className='text-sm text-gray-400 italic' style={{ fontFamily: 'Inter, system-ui' }}>
                "Ride Better. Pay Smarter." — Sawari.pk
              </p>
            </div>
          </motion.div>
        </motion.section>

      </main>
    </div>
  )
}

export default AboutPage