import express from 'express';
import { registerPassenger, loginPassenger, logoutPassenger, getPassengerProfile, sendResetPasswordOtp, resetPassword, sendVerificationOtp, verifyOtp, isAuthenticated, uploadProfilePicture, updateProfilePicture, deleteProfilePicture } from '../controllers/passenger.controller.js';
import { verifyPassengerJWT } from '../middleware/auth.middleware.js';
import upload, { handleUploadError } from '../middleware/upload.middleware.js';

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

// Profile picture routes
router.post('/upload-profile-pic', verifyPassengerJWT, upload.single('profilePic'), handleUploadError, uploadProfilePicture);
router.put('/update-profile-pic', verifyPassengerJWT, upload.single('profilePic'), handleUploadError, updateProfilePicture);
router.delete('/delete-profile-pic', verifyPassengerJWT, deleteProfilePicture);

 export default router;