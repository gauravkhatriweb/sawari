
import CaptainModel from "../models/captain.model.js";
import PassengerModel from "../models/passenger.model.js";
import { sendEmail } from "../services/email.service.js";
import {
    getCaptainWelcomeEmailHTML,
    getCaptainVerifyOtpEmailHTML,
    getCaptainResetPasswordEmailHTML,
} from "../templates/captainEmail.template.js";
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { deleteOldProfilePic } from '../middleware/upload.middleware.js';



// Utility function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Constants
const OTP_EXPIRY_MINUTES = 10; // 10 minutes
const PASSWORD_MIN_LENGTH = 6;


export const registerCaptain = async (req, res) => {
    try {
      const {
        firstname,
        lastname,
        email,
        password,
        vehicle,
        location
      } = req.body;
  
      // Check if captain already exists
      const existingCaptain = await CaptainModel.findOne({ email });
      if (existingCaptain) {
        return res.status(400).json({ message: "Captain with this email already exists" });
      }

      // Check if email is already used by a passenger
      const existingPassenger = await PassengerModel.findOne({ email });
      if (existingPassenger) {
        return res.status(400).json({ message: "This email is already been used. Please use a different email address." });
      }
  
      // Vehicle validation
      if (!vehicle || typeof vehicle !== 'object') {
        return res.status(400).json({ message: "Vehicle information is required and must be an object" });
      }
  
      const { type, make, model, year, color, numberPlate, capacity } = vehicle;
  
      const allowedTypes = ['car', 'bike', 'rickshaw'];
      if (!type || !allowedTypes.includes(type)) {
        return res.status(400).json({ message: "Vehicle type is required and must be one of: car, bike, rickshaw" });
      }
  
      if (!make || typeof make !== 'string' || make.trim().length === 0) {
        return res.status(400).json({ message: "Vehicle make is required" });
      }
  
      if (!model || typeof model !== 'string' || model.trim().length === 0) {
        return res.status(400).json({ message: "Vehicle model is required" });
      }
  
      if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        if (typeof year !== 'number' || year < 1990 || year > currentYear) {
          return res.status(400).json({ message: `Vehicle year must be between 1990 and ${currentYear}` });
        }
      }
  
      // ✅ Pakistan number plate validation
      const platePatterns = [
        /^[A-Z]{2,3}-\d{3,4}$/, // Punjab, ICT, Sindh (cars)
        /^\d{3,4}$/,            // Bikes/Rickshaws (numeric only)
        /^[A-Z]{2}-\d{4}$/      // KP, Balochistan, AJK, GB
      ];
  
      const forbiddenPrefixes = [
        /^GOVT/i,
        /^CC/i,    // Diplomatic corps
        /^CD/i,
        /^ARMY/i,
        /^PAF/i,
        /^PN/i,
        /^NAVY/i,
        /^POLICE/i
      ];
  
      if (!numberPlate) {
        return res.status(400).json({ message: "Vehicle numberPlate is required" });
      }
  
      const normalizedPlate = numberPlate.toUpperCase().trim();
  
      // Reject forbidden types
      if (forbiddenPrefixes.some(pattern => pattern.test(normalizedPlate))) {
        return res.status(400).json({ message: "Government, Diplomatic, Armed Forces or Police plates are not allowed" });
      }
  
      // Validate against allowed formats
      const isValidPlate = platePatterns.some(pattern => pattern.test(normalizedPlate));
      if (!isValidPlate) {
        return res.status(400).json({
          message: "Invalid number plate format for Pakistan. Examples: LEB-1234, ICT-345, QA-7654, 5678"
        });
      }
  
      // Ensure unique number plate
      const existingNumberPlate = await CaptainModel.findOne({ "vehicle.numberPlate": normalizedPlate });
      if (existingNumberPlate) {
        return res.status(400).json({ message: "A vehicle with this number plate already exists" });
      }
  
      if (capacity === undefined || typeof capacity !== 'number' || capacity < 2) {
        return res.status(400).json({ message: "Vehicle capacity is required and must be at least 2" });
      }
  
      // Hash password
      const hashedPassword = await CaptainModel.hashPassword(password);
  
      // Create new captain
      const newCaptain = new CaptainModel({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        vehicle: {
          ...vehicle,
          numberPlate: normalizedPlate // store normalized
        },
        location
      });
  
      await newCaptain.save();
  
      // Generate token
      const token = newCaptain.generateAuthToken();
  
      // Return response (omit password)
      const captainData = newCaptain.toObject();
      delete captainData.password;
  
      const welcomeEmailTemplate = getCaptainWelcomeEmailHTML(newCaptain);
      try {
        await sendEmail(newCaptain.email, "Welcome to Sawari.pk 🚖", welcomeEmailTemplate);
      } catch (err) {
        console.error("Welcome email error:", err);
      }
  
      res.status(201).json({
        message: "Captain registered successfully",
        captain: captainData,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

export const loginCaptain = async (req, res) => {
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
        
        // Find captain by email and include password for comparison
        const captain = await CaptainModel.findOne({ email }).select('+password');
        if (!captain) {
            // Check if email exists in passenger model to provide helpful error message
            const passengerWithEmail = await PassengerModel.findOne({ email });
            if (passengerWithEmail) {
                return res.status(401).json({
                    success: false,
                    message: 'This email is registered as a passenger account. Please use the passenger login or register as a captain with a different email.'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check if password matches
        const isPasswordValid = await captain.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate token
        const token = captain.generateAuthToken();
        
        // Set cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        
        // Set token in cookie
        res.cookie("accessToken", token, options);
        
        // Return response (omit password)
        const captainData = captain.toObject();
        delete captainData.password;
        
        res.status(200).json({
            success: true,
            message: "Captain logged in successfully",
            captain: captainData,
            token: token
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
};

export const logoutCaptain = async (req, res) => {
    try {
        // Captain is already attached to req by the middleware
        const captain = req.captain;
        
        // Logout captain (clear socketId if needed)
        captain.socketId = null;
        const loggedOutCaptain = await captain.save();
        
        // Clear the cookie
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        res.status(200).json({
            success: true,
            message: "Captain logged out successfully",
            captain: loggedOutCaptain
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        
        if (error.message === "Captain not found") {
            return res.status(404).json({
                success: false,
                message: 'Captain not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const getCaptainProfile = async (req, res) => {
    try {
        // Captain is already attached to req by the middleware
        const captain = req.captain;
        
        res.status(200).json({
            success: true,
            message: "Captain profile retrieved successfully",
            captain: captain
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
/**
 * Send verification OTP to user's email
 * @route POST /api/auth/send-verification-otp
 * @protected
 */
export const sendVerificationOtp = async (req, res) => {
    try {
        // Find user by ID (set by auth middleware)
        const user = await CaptainModel.findOne({ _id: req.captain._id });    
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
        try {
            await sendEmail(
                user.email,
                'Verify Your Sawari.pk Captain Account',
                getCaptainVerifyOtpEmailHTML(otp, OTP_EXPIRY_MINUTES)
            );
        } catch (emailErr) {
            console.error('Captain verification email error:', emailErr);
        }


        return res.status(200).json({
            success: true,
            message: 'Verification OTP sent successfully',
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: user.verifyOtp } : {})
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
        const user = await CaptainModel.findOne({ _id: req.captain._id });
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
 * @route POST /api/captain/send-reset-password-otp
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
        const user = await CaptainModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Check if email exists in passenger model to provide helpful error message
            const passengerWithEmail = await PassengerModel.findOne({ email: email.toLowerCase() });
            if (passengerWithEmail) {
                return res.status(404).json({
                    success: false,
                    message: 'This email is registered as a passenger account. Please use the passenger password reset or register as a captain with a different email.'
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
        try {
            await sendEmail(
                user.email,
                'Sawari.pk | Captain Password Reset OTP',
                getCaptainResetPasswordEmailHTML(otp, OTP_EXPIRY_MINUTES)
            );
        } catch (emailErr) {
            console.error('Captain reset password email error:', emailErr);
        }
  

        return res.status(200).json({
            success: true,
            message: 'Password reset OTP sent successfully',
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: user.forgotPasswordOtp } : {})
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
 * @route POST /api/captain/reset-password
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
        const user = await CaptainModel.findOne({ email: email.toLowerCase() }).select('+password');
        
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

/**
 * Upload profile picture
 * @route POST /api/captain/upload-profile-pic
 * @protected
 */
export const uploadProfilePicture = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select an image file.'
            });
        }

        // Get captain ID from auth middleware
        const captainId = req.captain._id;

        // Find captain and get current profile picture
        const captain = await CaptainModel.findById(captainId);
        if (!captain) {
            // Delete uploaded file if captain not found
            if (req.file && req.file.filename) {
                deleteOldProfilePic(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'Captain not found'
            });
        }

        // Delete old profile picture if exists
        if (captain.profilePic) {
            const oldFileName = path.basename(captain.profilePic);
            deleteOldProfilePic(oldFileName);
        }

        // Update captain with new profile picture path
        const profilePicPath = `/uploads/profile-pictures/${req.file.filename}`;
        captain.profilePic = profilePicPath;
        await captain.save();

        return res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePic: profilePicPath
        });
    } catch (error) {
        console.error('Upload Profile Picture Error:', error);
        
        // Delete uploaded file in case of error
        if (req.file && req.file.filename) {
            deleteOldProfilePic(req.file.filename);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error while uploading profile picture'
        });
    }
}

/**
 * Update profile picture
 * @route PUT /api/captain/update-profile-pic
 * @protected
 */
export const updateProfilePicture = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select an image file.'
            });
        }

        // Get captain ID from auth middleware
        const captainId = req.captain._id;

        // Find captain and get current profile picture
        const captain = await CaptainModel.findById(captainId);
        if (!captain) {
            // Delete uploaded file if captain not found
            if (req.file && req.file.filename) {
                deleteOldProfilePic(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'Captain not found'
            });
        }

        // Delete old profile picture if exists
        if (captain.profilePic) {
            const oldFileName = path.basename(captain.profilePic);
            deleteOldProfilePic(oldFileName);
        }

        // Update captain with new profile picture path
        const profilePicPath = `/uploads/profile-pictures/${req.file.filename}`;
        captain.profilePic = profilePicPath;
        await captain.save();

        return res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePic: profilePicPath
        });
    } catch (error) {
        console.error('Update Profile Picture Error:', error);
        
        // Delete uploaded file in case of error
        if (req.file && req.file.filename) {
            deleteOldProfilePic(req.file.filename);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile picture'
        });
    }
}

/**
 * Delete profile picture
 * @route DELETE /api/captain/delete-profile-pic
 * @protected
 */
export const deleteProfilePicture = async (req, res) => {
    try {
        // Get captain ID from auth middleware
        const captainId = req.captain._id;

        // Find captain
        const captain = await CaptainModel.findById(captainId);
        if (!captain) {
            return res.status(404).json({
                success: false,
                message: 'Captain not found'
            });
        }

        // Check if captain has a profile picture
        if (!captain.profilePic) {
            return res.status(400).json({
                success: false,
                message: 'No profile picture to delete'
            });
        }

        // Delete profile picture file from server
        const fileName = path.basename(captain.profilePic);
        deleteOldProfilePic(fileName);

        // Remove profile picture from database
        captain.profilePic = null;
        await captain.save();

        return res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        console.error('Delete Profile Picture Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while deleting profile picture'
        });
    }
}

