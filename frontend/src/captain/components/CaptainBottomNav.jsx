import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const CaptainBottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/captain/home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'rides',
      label: 'Rides',
      path: '/captain/rides',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'earnings',
      label: 'Earnings',
      path: '/captain/earnings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      id: 'wallet',
      label: 'Wallet',
      path: '/captain/wallet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'help',
      label: 'Help',
      path: '/captain/help',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/captain/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  const handleNavigation = (path, event) => {
    event.preventDefault()
    navigate(path)
  }

  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      navigate(path)
    }
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-t border-white/10"
      role="navigation"
      aria-label="Captain navigation"
    >
      <div className="max-w-md mx-auto px-4 py-2">
        <ul className="flex items-center justify-around" role="tablist">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            
            return (
              <li key={item.id} role="none">
                <motion.button
                  onClick={(e) => handleNavigation(item.path, e)}
                  onKeyDown={(e) => handleKeyDown(e, item.path)}
                  className={`
                    flex flex-col items-center justify-center
                    min-w-[60px] py-2 px-3 rounded-lg
                    transition-all duration-200 ease-out
                    focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent
                    ${isActive 
                      ? 'text-[#4DA6FF] bg-white/10' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Navigate to ${item.label}`}
                  tabIndex={0}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="mb-1"
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      color: isActive ? '#4DA6FF' : 'inherit'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-xs font-medium font-['Poppins',sans-serif] leading-none">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute -top-0.5 left-1/2 w-1 h-1 bg-[#4DA6FF] rounded-full"
                      layoutId="activeIndicator"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  )}
                </motion.button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default CaptainBottomNav