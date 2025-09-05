import React from 'react'

// Feature sections for passengers and drivers
const FeatureCard = ({ title, description }) => (
  <div className='rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 h-full'>
    <h3 className='text-base font-semibold'>{title}</h3>
    <p className='mt-2 text-sm text-gray-600'>{description}</p>
  </div>
)

const Section = ({ id, heading, subheading, children }) => (
  <section id={id} className='py-16 bg-white'>
    <div className='mx-auto max-w-screen-xl px-6'>
      <div className='text-center'>
        <h2 className='text-2xl sm:text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{heading}</h2>
        <p className='mt-2 text-gray-600'>{subheading}</p>
      </div>
      <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
        {children}
      </div>
    </div>
  </section>
)

const Features = () => {
  return (
    <div id='features'>
      {/* Passenger Features */}
      <Section
        id='passengers'
        heading='Built for Passengers'
        subheading='Affordable Rides. Safety First. Seamless Booking.'
      >
        <FeatureCard title='Reliable & On-Time Rides' description='Arrive when you expect to. We prioritize punctuality and reliability.' />
        <FeatureCard title='Ride Assurance Guarantee' description='We back every ride with our assurance program for peace of mind.' />
        <FeatureCard title='Affordable Rides' description='Transparent pricing with no surprises.' />
        <FeatureCard title='Safety First' description='Verified drivers, secure rides, and 24/7 support.' />
        <FeatureCard title='Seamless Booking' description='Book in seconds with a smooth, intuitive experience.' />
      </Section>

      {/* Driver Features */}
      <Section
        id='drivers'
        heading='Designed for Drivers'
        subheading='Instant Earnings. Flexible Hours. Smart Matching.'
      >
        <FeatureCard title='Lowest Commission in Pakistan' description='Keep more of what you earn with our market-leading commission.' />
        <FeatureCard title='Driver Growth Program' description='Upskill and grow with training and incentives.' />
        <FeatureCard title='Instant Earnings' description='Quick payouts and transparent earnings.' />
        <FeatureCard title='Flexible Hours' description='Drive on your schedule, no strings attached.' />
        <FeatureCard title='Smart Matching System' description='Get rides that fit your route and preferences.' />
      </Section>

      {/* Contact Section */}
      <section id='contact' className='py-16 bg-white'>
        <div className='mx-auto max-w-screen-xl px-6'>
          <div className='rounded-xl border border-black/10 bg-white p-6 text-center'>
            <h2 className='text-2xl sm:text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Get in touch</h2>
            <p className='mt-2 text-gray-600'>Questions or feedback? We’re here to help.</p>
            <button className='mt-4 rounded-full bg-brand-primary px-6 py-3 text-white font-semibold shadow hover:opacity-90'>
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Features


