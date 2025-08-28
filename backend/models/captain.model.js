import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const captainSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: [3, 'First name must be at least 3 characters long'],
    },
    lastname: {
        type: String,
        minlength: [3, 'Last name must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (email) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },

            message: 'Invalid email address',
        },
    },
    profilePic: {
        type: String,
        default: null,
        validate: {
            validator: function(value) {
                if (!value) return true; // Allow null/empty values
                // Check file extension for valid image types
                const validExtensions = /\.(jpg|jpeg|png)$/i;
                return validExtensions.test(value);
            },
            message: 'Profile picture must be a valid image file (jpg, jpeg, png)'
        }
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    vehicle: {
        type: {
          type: String,
          enum: ['car', 'bike', 'rickshaw'],
          required: true,
        },
        make: { type: String, required: true }, 
        model: { type: String, required: true }, 
        year: { type: Number, min: 1990, max: new Date().getFullYear() },
        color: { type: String },
        numberPlate: { 
          type: String, 
          required: true, 
          unique: true, 
          uppercase: true,
          match: /^[A-Z]{2,3}-\d{1,4}$/, // e.g., LEB-1234, KAR-999

        },
        capacity: { type: Number, required: true, min: [2 ,  'Capacity must be more than 1'] },
        location:{
            latitude:{
                type:Number
            },
            longitude:{
                type:Number

            }
        }

      },
    // Account verification fields
    isAccountVerified: { 
        type: Boolean, 
        default: false 
    },
    verifyOtp: { 
        type: String, 
        default: '' 
    },
    verifyOtpExpiry: { 
        type: Number, 
        default: 0 
    },

    // Password reset fields
    forgotPasswordOtp: { 
        type: String, 
        default: '' 
    },
    forgotPasswordOtpExpiry: { 
        type: Number, 
        default: 0 
    },

    // Captain performance metrics
    rating: {
        type: Number,
        default: 5.0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        validate: {
            validator: function(v) {
                return Number.isFinite(v) && v >= 0 && v <= 5;
            },
            message: 'Rating must be a number between 0 and 5'
        }
    },
    totalRides: {
        type: Number,
        default: 0,
        min: [0, 'Total rides cannot be negative'],
        validate: {
            validator: function(v) {
                return Number.isInteger(v) && v >= 0;
            },
            message: 'Total rides must be a non-negative integer'
        }
    },
    yearsActive: {
        type: Number,
        default: 0,
        min: [0, 'Years active cannot be negative'],
        validate: {
            validator: function(v) {
                return Number.isFinite(v) && v >= 0;
            },
            message: 'Years active must be a non-negative number'
        }
    }
    
});

captainSchema.methods.generateAuthToken = function () {
     const token = jwt.sign({ id: this._id },process.env.JWT_SECRET,{ expiresIn: '24h' });
     return token;
};
captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

captainSchema.statics.hashPassword = async function name(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}





const Captain = mongoose.model('Captain', captainSchema);

export default Captain;