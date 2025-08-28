import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Sign up using your email or phone number, set a password, and verify with OTP."
    },
    {
      question: "How do I book a ride?",
      answer: "Enter your pickup and drop-off locations, choose a vehicle type, and confirm."
    },
    {
      question: "What vehicle types are available?",
      answer: "Cars, bikes, rickshaws, and parcel delivery options."
    },
    {
      question: "What is Sawari Pink?",
      answer: "A women-only service with female drivers for female passengers for added safety."
    },
    {
      question: "How do I pay for my ride?",
      answer: "Pay via cash, JazzCash, EasyPaisa, or integrated digital wallets."
    },
    {
      question: "Can I switch languages?",
      answer: "Yes, English, Urdu, and Roman Urdu are available in-app."
    },
    {
      question: "How is my safety ensured?",
      answer: "Verified drivers, SOS button, live ride tracking, and emergency alerts."
    },
    {
      question: "What if a driver cancels?",
      answer: "Another driver is automatically assigned to minimize wait time."
    },
    {
      question: "How do I contact my driver?",
      answer: "Call or chat securely via the in-app communication system."
    },
    {
      question: "Can I schedule rides in advance?",
      answer: "Yes, book rides for a later time and date directly from the app."
    },
    {
      question: "How do I rate my ride?",
      answer: "After each ride, submit your rating and optional feedback in the app."
    },
    {
      question: "Can I share my ride details with family/friends?",
      answer: "Yes, share your live location and ride info for safety."
    },
    {
      question: "Is Sawari.pk available in my city?",
      answer: "Currently available in major urban cities; expansion is ongoing."
    },
    {
      question: "What if I lose something in the ride?",
      answer: "Contact our support team through the app for lost & found assistance."
    },
    {
      question: "Can I ride with multiple passengers?",
      answer: "Yes, you can add additional passengers while booking a car."
    },
    {
      question: "Are the fares fixed or dynamic?",
      answer: "Fares may vary slightly based on traffic, distance, and vehicle type."
    },
    {
      question: "How do I cancel a ride?",
      answer: "Use the cancel option in the app; cancellation charges may apply."
    },
    {
      question: "Do I need an account to book a ride?",
      answer: "Yes, registration is required to ensure verified and secure service."
    },
    {
      question: "Can I use Sawari.pk for parcel delivery?",
      answer: "Yes, select the parcel delivery option and provide pickup/drop details."
    },
    {
      question: "How do I contact Sawari.pk support?",
      answer: "Tap the help/support section in the app to chat, email, or call."
    }
  ]

  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />

      <main className='relative z-10 mx-auto max-w-4xl px-6 py-12 sm:py-16'>
        <header className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Frequently Asked Questions
          </h1>
          <p className='mt-2 text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
            Find quick answers to common questions about Sawari.pk
          </p>
        </header>

        <article className='prose prose-invert max-w-none'>
          <section className='rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-7 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            {/* Introduction */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-3 text-[#4DA6FF]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Sawari.pk Passenger FAQs
              </h2>
              <p className='text-sm text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                Welcome to our comprehensive FAQ section! Here you'll find answers to the most commonly asked questions about using Sawari.pk. 
                Whether you're a new user getting started or an existing passenger looking for specific information, we've got you covered.
              </p>
            </div>

            {/* FAQ Categories */}
            <div className='mb-8'>
              <h3 className='text-lg font-semibold mb-4 text-[#EFBFFF]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Quick Categories
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                <div className='text-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[#4DA6FF]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Account</span>
                </div>
                <div className='text-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[#FFD65C]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Booking</span>
                </div>
                <div className='text-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[#7CE7E1]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Safety</span>
                </div>
                <div className='text-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[#EFBFFF]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium' style={{ fontFamily: 'Inter, system-ui' }}>Payment</span>
                </div>
              </div>
            </div>

            {/* FAQ List */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold mb-4 text-[#FFD65C]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                All Frequently Asked Questions
              </h3>
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className='rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition-colors'
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className='w-full text-left p-4 sm:p-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA6FF] focus-visible:ring-opacity-50'
                  >
                    <h4 className='text-sm sm:text-base font-semibold text-white pr-4' style={{ fontFamily: 'Inter, system-ui' }}>
                      {faq.question}
                    </h4>
                    <div className={`flex-shrink-0 w-6 h-6 text-[#4DA6FF] transition-transform duration-200 ${openFAQ === index ? 'rotate-180' : ''}`}>
                      <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                      </svg>
                    </div>
                  </button>
                  {openFAQ === index && (
                    <div className='px-4 sm:px-5 pb-4 sm:pb-5'>
                      <p className='text-sm text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Help Section */}
            <div className='mt-8 pt-6 border-t border-white/10'>
              <h3 className='text-lg font-semibold mb-4 text-[#7CE7E1]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Still Need Help?
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Link 
                  to='/legal/contact'
                  className='flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group'
                >
                  <div className='flex-shrink-0 w-10 h-10 rounded-full bg-[#4DA6FF]/20 flex items-center justify-center group-hover:bg-[#4DA6FF]/30 transition-colors'>
                    <svg className='w-5 h-5 text-[#4DA6FF]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-semibold text-white text-sm' style={{ fontFamily: 'Inter, system-ui' }}>Contact Support</h4>
                    <p className='text-xs text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>Get direct help from our team</p>
                  </div>
                </Link>

                <div className='flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors'>
                  <div className='flex-shrink-0 w-10 h-10 rounded-full bg-[#FFD65C]/20 flex items-center justify-center'>
                    <svg className='w-5 h-5 text-[#FFD65C]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z' />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-semibold text-white text-sm' style={{ fontFamily: 'Inter, system-ui' }}>Live Chat</h4>
                    <p className='text-xs text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>Chat with us in real-time</p>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors'>
                  <div className='flex-shrink-0 w-10 h-10 rounded-full bg-[#7CE7E1]/20 flex items-center justify-center'>
                    <svg className='w-5 h-5 text-[#7CE7E1]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-semibold text-white text-sm' style={{ fontFamily: 'Inter, system-ui' }}>Call Support</h4>
                    <p className='text-xs text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>+92-21-12345678</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className='mt-8 flex items-center justify-center'>
            <Link
              to='/'
              className='inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white ring-1 ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:scale-[1.01] transition'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              Back to Home
            </Link>
          </div>

          <footer className='mt-6 text-xs text-gray-400' style={{ fontFamily: 'Inter, system-ui' }}>
            Last updated: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </main>
    </div>
  )
}

export default FAQPage