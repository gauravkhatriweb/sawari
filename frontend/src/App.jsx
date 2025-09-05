/**
 * App.jsx - Main Application Router
 * 
 * This is the root component that defines all application routes for the Sawari ride-hailing platform.
 * It handles routing for both passenger and captain user flows, including authentication, booking,
 * profile management, and legal pages. The app uses React Router for client-side navigation
 * and implements error boundaries for critical booking functionality.
 * 
 * Key Features:
 * - Dual user type routing (passengers and captains)
 * - Authentication flow with OTP verification
 * - Password reset functionality
 * - Ride booking with error boundary protection
 * - Legal compliance pages
 * - 404 error handling
 */

import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Core Pages
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import AboutPage from './pages/AboutPage'

// Passenger Pages - Authentication & Profile
import PassengerLogin from './pages/passengerPages/PassengerLogin'
import PassengerRegister from './pages/passengerPages/PassengerRegister'
import PassengerVerifyOtp from './pages/passengerPages/PassengerVerifyOtp'
import PassengerProfile from './pages/passengerPages/PassengerProfile'
import PassengerHome from './pages/passengerPages/PassengerHome'
import PassengerForgotPassword from './pages/passengerPages/PassengerForgotPassword'
import PassengerResetPassword from './pages/passengerPages/PassengerResetPassword'
import BookRide from './pages/passengerPages/BookRide'

// Captain Pages - Authentication & Dashboard
import CaptainLogin from './pages/captainPages/CaptainLogin'
import CaptainRegister from './pages/captainPages/CaptainRegister'
import CaptainVerifyOtp from './pages/captainPages/CaptainVerifyOtp'
import CaptainForgotPassword from './pages/captainPages/CaptainForgotPassword'
import CaptainResetPassword from './pages/captainPages/CaptainResetPassword'
import CaptainHome from './pages/captainPages/CaptainHome'
import CaptainProfile from './pages/captainPages/CaptainProfile'
import CaptainRides from './pages/captainPages/CaptainRides'
import CaptainWallet from './pages/captainPages/CaptainWallet'
import CaptainHelp from './pages/captainPages/CaptainHelp'
import CaptainEarnings from './pages/captainPages/CaptainEarnings'

// Legal & Support Pages
import TermsPage from './pages/legalPages/TermsPage'
import PrivacyPage from './pages/legalPages/PrivacyPage'
import ContactPage from './pages/legalPages/ContactPage'
import FAQPage from './pages/legalPages/FAQPage'

// Error Handling
import NotFound from './pages/errorPages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'


/**
 * Main App Component
 * 
 * Renders the application router with all defined routes. Uses theme-based styling
 * for consistent dark mode appearance across the platform.
 * 
 * @returns {JSX.Element} The main application component with routing
 */
const App = () => {
  return (
    <div className="min-h-screen bg-theme-base text-theme-primary antialiased">
      <Routes>
        {/* Core Application Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Passenger Authentication & Profile Routes */}
        <Route path="/passenger/login" element={<PassengerLogin />} />
        <Route path="/passenger/register" element={<PassengerRegister />} />
        <Route path="/passenger/verify-otp" element={<PassengerVerifyOtp />} />
        <Route path="/passenger/profile" element={<PassengerProfile />} />
        <Route path="/passenger/home" element={<PassengerHome />} />
        <Route path="/passenger/forgot-password" element={<PassengerForgotPassword />} />
        <Route path="/passenger/reset-password" element={<PassengerResetPassword />} />
        
        {/* Passenger Booking Route - Protected with Error Boundary */}
        <Route path="/passenger/book" element={
          <ErrorBoundary>
            <BookRide />
          </ErrorBoundary>
        } />
        
        {/* Captain Authentication Routes */}
        <Route path="/captain/login" element={<CaptainLogin />} />
        <Route path="/captain/register" element={<CaptainRegister />} />
        <Route path="/captain/verify-otp" element={<CaptainVerifyOtp />} />
        <Route path="/captain/forgot-password" element={<CaptainForgotPassword />} />
        <Route path="/captain/reset-password" element={<CaptainResetPassword />} />
        
        {/* Captain Dashboard & Management Routes */}
        <Route path="/captain/home" element={<CaptainHome />} />
        <Route path="/captain/rides" element={<CaptainRides />} />
        <Route path="/captain/earnings" element={<CaptainEarnings />} />
        <Route path="/captain/wallet" element={<CaptainWallet />} />
        <Route path="/captain/help" element={<CaptainHelp />} />
        <Route path="/captain/profile" element={<CaptainProfile />} />
        
        {/* Legal & Compliance Pages */}
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/contact" element={<ContactPage />} />
        <Route path="/legal/faq" element={<FAQPage />} />
        
        {/* 404 Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App