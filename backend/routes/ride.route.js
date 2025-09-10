import express from 'express';
import {
    createRide,
    getPassengerRides,
    getCaptainRides,
    getNearbyRides,
    acceptRide,
    startRide,
    completeRide,
    cancelRide,
    getRideById,
    rateRide,
    getActivePassengerRide,
    getActiveCaptainRide
} from '../controllers/ride.controller.js';
import { verifyPassengerJWT, verifyCaptainJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Passenger routes (require passenger authentication)
router.post('/', verifyPassengerJWT, createRide); // Create a new ride booking
router.get('/passenger', verifyPassengerJWT, getPassengerRides); // Get passenger's ride history
router.get('/passenger/active', verifyPassengerJWT, getActivePassengerRide); // Get active ride for passenger

// Captain routes (require captain authentication)
router.get('/captain', verifyCaptainJWT, getCaptainRides); // Get captain's ride history
router.get('/captain/active', verifyCaptainJWT, getActiveCaptainRide); // Get active ride for captain
router.get('/nearby', verifyCaptainJWT, getNearbyRides); // Get nearby pending rides for captain
router.put('/:rideId/accept', verifyCaptainJWT, acceptRide); // Accept a ride (captain only)
router.put('/:rideId/start', verifyCaptainJWT, startRide); // Start a ride (captain only)
router.put('/:rideId/complete', verifyCaptainJWT, completeRide); // Complete a ride (captain only)

// Mixed routes (require either passenger or captain authentication)
// Note: These routes will check authorization within the controller based on req.passenger or req.captain
router.get('/:rideId', (req, res, next) => {
    // Try passenger auth first, then captain auth
    verifyPassengerJWT(req, res, (err) => {
        if (err || !req.passenger) {
            // If passenger auth fails, try captain auth
            verifyCaptainJWT(req, res, next);
        } else {
            // Passenger auth succeeded
            next();
        }
    });
}, getRideById); // Get ride details by ID

router.put('/:rideId/cancel', (req, res, next) => {
    // Try passenger auth first, then captain auth
    verifyPassengerJWT(req, res, (err) => {
        if (err || !req.passenger) {
            // If passenger auth fails, try captain auth
            verifyCaptainJWT(req, res, next);
        } else {
            // Passenger auth succeeded
            next();
        }
    });
}, cancelRide); // Cancel a ride (passenger or captain)

router.put('/:rideId/rate', (req, res, next) => {
    // Try passenger auth first, then captain auth
    verifyPassengerJWT(req, res, (err) => {
        if (err || !req.passenger) {
            // If passenger auth fails, try captain auth
            verifyCaptainJWT(req, res, next);
        } else {
            // Passenger auth succeeded
            next();
        }
    });
}, rateRide); // Rate a ride (passenger or captain)

export default router;