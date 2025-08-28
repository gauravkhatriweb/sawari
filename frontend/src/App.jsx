import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import AboutPage from './pages/AboutPage'
import PassengerLogin from './pages/passengerPages/PassengerLogin'
import PassengerRegister from './pages/passengerPages/PassengerRegister'
import PassengerVerifyOtp from './pages/passengerPages/PassengerVerifyOtp'
import PassengerProfile from './pages/passengerPages/PassengerProfile'
import PassengerForgotPassword from './pages/passengerPages/PassengerForgotPassword'
import PassengerResetPassword from './pages/passengerPages/PassengerResetPassword'
import CaptainLogin from './pages/captainPages/CaptainLogin'
import CaptainRegister from './pages/captainPages/CaptainRegister'
import CaptainVerifyOtp from './pages/captainPages/CaptainVerifyOtp'
import CaptainForgotPassword from './pages/captainPages/CaptainForgotPassword'
import CaptainResetPassword from './pages/captainPages/CaptainResetPassword'
import TermsPage from './pages/legalPages/TermsPage'
import PrivacyPage from './pages/legalPages/PrivacyPage'
import ContactPage from './pages/legalPages/ContactPage'
import FAQPage from './pages/legalPages/FAQPage'
import NotFound from './pages/errorPages/NotFound'
import CaptainHome from './pages/captainPages/CaptainHome'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/passenger/login" element={<PassengerLogin />} />
        <Route path="/passenger/register" element={<PassengerRegister />} />
        <Route path="/passenger/verify-otp" element={<PassengerVerifyOtp />} />
        <Route path="/passenger/profile" element={<PassengerProfile />} />
        <Route path="/passenger/forgot-password" element={<PassengerForgotPassword />} />
        <Route path="/passenger/reset-password" element={<PassengerResetPassword />} />
        <Route path="/captain/login" element={<CaptainLogin />} />
        <Route path="/captain/register" element={<CaptainRegister />} />
        <Route path="/captain/verify-otp" element={<CaptainVerifyOtp />} />
        <Route path="/captain/forgot-password" element={<CaptainForgotPassword />} />
        <Route path="/captain/reset-password" element={<CaptainResetPassword />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/contact" element={<ContactPage />} />
        <Route path="/legal/faq" element={<FAQPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/captain/home" element={<CaptainHome />} />
      </Routes>
    </div>
  )
}

export default App