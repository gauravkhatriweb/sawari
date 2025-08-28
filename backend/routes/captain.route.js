
import express from 'express';
import { registerCaptain, loginCaptain, logoutCaptain, getCaptainProfile , sendResetPasswordOtp, resetPassword, sendVerificationOtp, verifyOtp, isAuthenticated} from '../controllers/captain.controller.js';
import { verifyCaptainJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerCaptain);
router.post('/login', loginCaptain);
router.post('/send-reset-password-otp', sendResetPasswordOtp);
router.post('/reset-password', resetPassword);
router.get('/profile', verifyCaptainJWT, getCaptainProfile);
router.post('/logout', verifyCaptainJWT, logoutCaptain);

router.post('/send-verification-otp', verifyCaptainJWT, sendVerificationOtp);
router.post('/verify-otp', verifyCaptainJWT, verifyOtp);
router.post('/is-authenticated', verifyCaptainJWT, isAuthenticated);

export default router;