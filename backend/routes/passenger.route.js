import express from 'express';
import { registerPassenger, loginPassenger, logoutPassenger, getPassengerProfile, sendResetPasswordOtp, resetPassword, sendVerificationOtp, verifyOtp, isAuthenticated } from '../controllers/passenger.controller.js';
import { verifyPassengerJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerPassenger);
router.post('/login', loginPassenger);
router.post('/send-reset-password-otp', sendResetPasswordOtp);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.post('/logout', verifyPassengerJWT, logoutPassenger);
router.get('/profile', verifyPassengerJWT, getPassengerProfile);
router.post('/send-verification-otp', verifyPassengerJWT, sendVerificationOtp);
router.post('/verify-otp', verifyPassengerJWT, verifyOtp);
router.post('/is-authenticated', verifyPassengerJWT, isAuthenticated);

 export default router;