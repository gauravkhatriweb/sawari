
import PassengerModel from "../models/passenger.model.js";
import CaptainModel from "../models/captain.model.js";
import bcrypt from 'bcrypt';
import { sendEmail } from '../services/email.service.js';
import {
    getPassengerWelcomeEmailHTML,
    getPassengerVerifyOtpEmailHTML,
    getPassengerResetPasswordEmailHTML,
} from "../templates/passengerEmail.template.js";

// Constants
const OTP_EXPIRY_MINUTES = 10; // 10 minutes
const PASSWORD_MIN_LENGTH = 6;

// Utility function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerPassenger = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        
        // Validation
        const errors = [];
        
        // Check if required fields are present (lastname optional)
        if (!firstname || !email || !password) {
            errors.push({ field: 'all', message: 'First name, email and password are required' });
        }
        
        // Validate firstname
        if (firstname && firstname.length < 3) {
            errors.push({ field: 'firstname', message: 'First name must be at least 3 characters long' });
        }
        
        // Validate lastname
        if (lastname && lastname.length < 3) {
            errors.push({ field: 'lastname', message: 'Last name must be at least 3 characters long' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push({ field: 'email', message: 'Invalid email address' });
        }
        
        // Validate password length
        if (password && password.length < 6) {
            errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
        }
        
        // If there are validation errors, return them
        if (errors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: errors 
            });
        }
        
        // Check if passenger already exists
        const existingPassenger = await PassengerModel.findOne({ email });
        if (existingPassenger) {
            return res.status(409).json({
                success: false,
                message: 'Passenger with this email already exists'
            });
        }

        // Check if email is already used by a captain
        const existingCaptain = await CaptainModel.findOne({ email });
        if (existingCaptain) {
            return res.status(409).json({
                success: false,
                message: 'This email is already been used. Please use a different email address.'
            });
        }
        
        // Hash password and create passenger
        const hashedPassword = await PassengerModel.hashPassword(password);
        const newPassenger = new PassengerModel({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });
        await newPassenger.save();
        const token = await newPassenger.generateToken();
                            
        
        try {
            
            await sendEmail(
                newPassenger.email,
                "Welcome to Sawari.pk 🚖",
                getPassengerWelcomeEmailHTML(newPassenger.firstname)
            );
        } catch (err) {
            console.error("Welcome email error:", err);
        }
        res.status(201).json({
            success: true,
            message: "Passenger created successfully",
            passenger: newPassenger,
            token: token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const getPassengerProfile = async (req, res, next) => {
    try {
        // Passenger is already attached to req by the middleware
        const passenger = req.passenger;
        
        res.status(200).json({
            success: true,
            message: "Passenger profile retrieved successfully",
            passenger: passenger
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const logoutPassenger = async (req, res, next) => {
    try {
        // Passenger is already attached to req by the middleware
        const passenger = req.passenger;
        
        // Logout passenger (clear socketId if needed)
        passenger.socketId = null;
        const loggedOutPassenger = await passenger.save();
        
        // Clear the cookie
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        res.status(200).json({
            success: true,
            message: "Passenger logged out successfully",
            passenger: loggedOutPassenger
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        
        if (error.message === "Passenger not found") {
            return res.status(404).json({
                success: false,
                message: 'Passenger not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const loginPassenger = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        const errors = [];
        
        // Check if required fields are present
        if (!email || !password) {
            errors.push({ field: 'all', message: 'Email and password are required' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push({ field: 'email', message: 'Invalid email address' });
        }
        
        // If there are validation errors, return them
        if (errors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: errors 
            });
        }
        
        // Login passenger
        const passenger = await PassengerModel.findOne({ email }).select('+password');
        if (!passenger) {
            // Check if email exists in captain model to provide helpful error message
            const captainWithEmail = await CaptainModel.findOne({ email });
            if (captainWithEmail) {
                return res.status(401).json({
                    success: false,
                    message: 'This email is registered as a captain account. Please use the captain login or register as a passenger with a different email.'
                });
            }
            throw new Error("Invalid email or password");
        }
        
        const isPasswordValid = await passenger.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        
        const token = await passenger.generateToken();
        
        // Set cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        
        // Set token in cookie
        res.cookie("accessToken", token, options);
        
    
    // Response
    res.status(200).json({
        success: true,
        message: "Passenger logged in successfully",
        passenger,
        token
    });
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Send verification OTP to user's email
 * @route POST /api/auth/send-verification-otp
 * @protected
 */
export const sendVerificationOtp = async (req, res) => {
    try {
        // Find user by ID (set by auth middleware)
        const user = await PassengerModel.findOne({ _id: req.passenger._id });    
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account is already verified'
            });
        }

        // Generate and save OTP
        const otp = generateOTP();
        user.verifyOtp = otp;
        user.verifyOtpExpiry = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

       // Send OTP via email (Account Verification)
await sendEmail(
    user.email,
    'Verify Your Sawari.pk Account',
    getPassengerVerifyOtpEmailHTML(otp, OTP_EXPIRY_MINUTES)
);


        return res.status(200).json({
            success: true,
            message: 'Verification OTP sent successfully'
        });
    } catch (error) {
        console.error('Send Verification OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending verification OTP'
        });
    }
}

/**
 * Verify user's account using OTP
 * @route POST /api/auth/verify-otp
 * @protected
 */
export const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        // Validate OTP input
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required'
            });
        }

        // Find user by ID (set by auth middleware)
        const user = await PassengerModel.findOne({ _id: req.passenger._id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        if (user.verifyOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiry
        if (user.verifyOtpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Update user verification status
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;
        user.isAccountVerified = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Account verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while verifying OTP'
        });
    }
}

/**
 * Check if user is authenticated
 * @route POST /api/auth/is-authenticated
 * @protected
 */
export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'User is authenticated'
        });
    } catch (error) {
        console.error('Authentication Check Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while checking authentication'
        });
    }
}

/**
 * Send password reset OTP
 * @route POST /api/passengers/send-reset-password-otp
 * @public
 */
export const sendResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await PassengerModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Check if email exists in captain model to provide helpful error message
            const captainWithEmail = await CaptainModel.findOne({ email: email.toLowerCase() });
            if (captainWithEmail) {
                return res.status(404).json({
                    success: false,
                    message: 'This email is registered as a captain account. Please use the captain password reset or register as a passenger with a different email.'
                });
            }
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Generate and save OTP
        const otp = generateOTP();
        user.forgotPasswordOtp = otp;
        user.forgotPasswordOtpExpiry = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

       // Send OTP via email
await sendEmail(
    user.email,
    'Sawari.pk | Password Reset OTP',
    getPassengerResetPasswordEmailHTML(otp, OTP_EXPIRY_MINUTES)
  );
  

        return res.status(200).json({
            success: true,
            message: 'Password reset OTP sent successfully'
        });
    } catch (error) {
        console.error('Send Reset Password OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending reset password OTP'
        });
    }
}

/**
 * Reset password using OTP
 * @route POST /api/passengers/reset-password
 * @public
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body || {};

        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP and new password are required'
            });
        }

        // Validate password length
        if (newPassword.length < PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters`
            });
        }

        // Find user by email and verify OTP (include password field for comparison)
        const user = await PassengerModel.findOne({ email: email.toLowerCase() }).select('+password');
        
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.forgotPasswordOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (user.forgotPasswordOtpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Check if new password is same as old password
        
        // Check if user.password exists before comparing
        if (!user.password) {
            // If password doesn't exist, we can skip the comparison
            // This might happen for users created before password hashing was implemented
        } else {
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password'
                });
            }
        }

        // Update password and clear OTP
        user.password = await bcrypt.hash(newPassword, 10);
        user.forgotPasswordOtp = undefined;
        user.forgotPasswordOtpExpiry = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while resetting password'
        });
    }
}
