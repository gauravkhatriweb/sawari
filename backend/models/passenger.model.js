import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const passengerSchema = new mongoose.Schema({
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
    }
});

// Add methods to schema
passengerSchema.methods.generateToken = async function () {
    const token = jwt.sign({ id: this._id },process.env.JWT_SECRET,{ expiresIn: '24h' });
    return token;
};

passengerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

passengerSchema.statics.hashPassword = async function name(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const passengerModel = mongoose.model('Passenger', passengerSchema);

export default passengerModel;