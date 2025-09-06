import jwt from 'jsonwebtoken';
import PassengerModel from '../models/passenger.model.js';
import Captain from '../models/captain.model.js';

export const verifyPassengerJWT = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized request - No token provided"
            });
        }
        
        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find passenger
        const passenger = await PassengerModel.findById(decodedToken.id).select("-password");
        
        if (!passenger) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token - Passenger not found"
            });
        }
        
        // Add passenger to request object
        req.passenger = passenger;
        next();
        
    } catch (error) {
        // Only log JWT errors in development mode to reduce console spam
        if (process.env.NODE_ENV === 'development') {
            console.error('JWT verification error:', error.name, error.message);
        }
        
        // Clear invalid token cookie
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token. Please login again.",
            code: "TOKEN_INVALID"
        });
    }
};

export const verifyCaptainJWT = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized request - No token provided"
            });
        }
        
        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find captain
        const captain = await Captain.findById(decodedToken.id).select("-password");
        
        if (!captain) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token - Captain not found"
            });
        }
        
        // Add captain to request object
        req.captain = captain;
        next();
        
    } catch (error) {
        // Only log JWT errors in development mode to reduce console spam
        if (process.env.NODE_ENV === 'development') {
            console.error('JWT verification error:', error.name, error.message);
        }
        
        // Clear invalid token cookie
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token. Please login again.",
            code: "TOKEN_INVALID"
        });
    }
};
