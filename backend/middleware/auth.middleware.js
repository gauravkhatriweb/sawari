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
        console.error('JWT verification error:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid access token"
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
        console.error('JWT verification error:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid access token"
        });
    }
};
