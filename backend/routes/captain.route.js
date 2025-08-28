
import express from 'express';
import { registerCaptain, loginCaptain, logoutCaptain, getCaptainProfile , sendResetPasswordOtp, resetPassword, sendVerificationOtp, verifyOtp, isAuthenticated, uploadProfilePicture, updateProfilePicture, deleteProfilePicture, updateCaptainStatus} from '../controllers/captain.controller.js';
import { verifyCaptainJWT } from '../middleware/auth.middleware.js';
import upload, { handleUploadError } from '../middleware/upload.middleware.js';

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

// Profile picture routes
router.post('/upload-profile-pic', verifyCaptainJWT, upload.single('profilePic'), handleUploadError, uploadProfilePicture);
router.put('/update-profile-pic', verifyCaptainJWT, upload.single('profilePic'), handleUploadError, updateProfilePicture);
router.delete('/delete-profile-pic', verifyCaptainJWT, deleteProfilePicture);

// Status update route
router.put('/update-status', verifyCaptainJWT, updateCaptainStatus);

export default router;