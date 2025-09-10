import Ride from '../models/ride.model.js';
import PassengerModel from '../models/passenger.model.js';
import CaptainModel from '../models/captain.model.js';

// Constants
const DEFAULT_SEARCH_RADIUS = 5000; // 5km in meters
const MAX_RIDES_PER_PAGE = 50;

/**
 * Create a new ride booking
 * POST /api/rides
 */
export const createRide = async (req, res) => {
    try {
        const {
            pickupLocation,
            dropLocation,
            fare,
            distance,
            duration,
            paymentMethod,
            estimatedArrival,
            vehicleType,
            notes
        } = req.body;

        // Validation
        const errors = [];

        // Validate required fields
        if (!pickupLocation || !dropLocation || !fare || !distance || !duration || !paymentMethod) {
            errors.push({ field: 'all', message: 'Pickup location, drop location, fare, distance, duration, and payment method are required' });
        }

        // Validate pickup location
        if (pickupLocation) {
            if (!pickupLocation.address || !pickupLocation.city || !pickupLocation.coordinates) {
                errors.push({ field: 'pickupLocation', message: 'Pickup location must include address, city, and coordinates' });
            } else if (!Array.isArray(pickupLocation.coordinates) || pickupLocation.coordinates.length !== 2) {
                errors.push({ field: 'pickupLocation', message: 'Pickup coordinates must be an array of [longitude, latitude]' });
            }
        }

        // Validate drop location
        if (dropLocation) {
            if (!dropLocation.address || !dropLocation.city || !dropLocation.coordinates) {
                errors.push({ field: 'dropLocation', message: 'Drop location must include address, city, and coordinates' });
            } else if (!Array.isArray(dropLocation.coordinates) || dropLocation.coordinates.length !== 2) {
                errors.push({ field: 'dropLocation', message: 'Drop coordinates must be an array of [longitude, latitude]' });
            }
        }

        // Validate fare
        if (fare !== undefined && (typeof fare !== 'number' || fare <= 0)) {
            errors.push({ field: 'fare', message: 'Fare must be a positive number' });
        }

        // Validate distance
        if (distance !== undefined && (typeof distance !== 'number' || distance <= 0)) {
            errors.push({ field: 'distance', message: 'Distance must be a positive number' });
        }

        // Validate duration
        if (duration !== undefined && (typeof duration !== 'number' || duration <= 0 || !Number.isInteger(duration))) {
            errors.push({ field: 'duration', message: 'Duration must be a positive integer' });
        }

        // Validate payment method
        const validPaymentMethods = ['cash', 'wallet', 'card'];
        if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
            errors.push({ field: 'paymentMethod', message: 'Payment method must be one of: cash, wallet, card' });
        }

        // If there are validation errors, return them
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // Check if passenger exists
        const passenger = await PassengerModel.findById(req.passenger.id);
        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger not found'
            });
        }

        // Check if passenger has any active rides
        const activeRide = await Ride.findOne({
            passenger: req.passenger.id,
            status: { $in: ['pending', 'accepted', 'in-progress'] }
        });

        if (activeRide) {
            return res.status(409).json({
                success: false,
                message: 'You already have an active ride. Please complete or cancel it before booking a new one.',
                activeRide: {
                    id: activeRide._id,
                    status: activeRide.status,
                    createdAt: activeRide.createdAt
                }
            });
        }

        // Format location data for GeoJSON
        const formattedPickupLocation = {
            address: pickupLocation.address.trim(),
            city: pickupLocation.city.trim(),
            coordinates: {
                type: 'Point',
                coordinates: [pickupLocation.coordinates[0], pickupLocation.coordinates[1]]
            }
        };

        const formattedDropLocation = {
            address: dropLocation.address.trim(),
            city: dropLocation.city.trim(),
            coordinates: {
                type: 'Point',
                coordinates: [dropLocation.coordinates[0], dropLocation.coordinates[1]]
            }
        };

        // Create new ride
        const newRide = new Ride({
            passenger: req.passenger.id,
            pickupLocation: formattedPickupLocation,
            dropLocation: formattedDropLocation,
            fare,
            distance,
            duration,
            paymentMethod,
            vehicleType: vehicleType || 'bike',
            notes: notes || '',
            estimatedArrival: estimatedArrival || null,
            status: 'pending'
        });

        const savedRide = await newRide.save();

        // Populate passenger details for response
        await savedRide.populate('passenger', 'firstname lastname email');

        res.status(201).json({
            success: true,
            message: 'Ride booked successfully',
            data: savedRide,
            ride: savedRide // For backward compatibility
        });

    } catch (error) {
        console.error('Error creating ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get rides for the authenticated passenger
 * GET /api/rides/passenger
 */
export const getPassengerRides = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), MAX_RIDES_PER_PAGE);
        const skip = (pageNum - 1) * limitNum;

        const query = { passenger: req.passenger.id };
        
        if (status) {
            const validStatuses = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'];
            if (validStatuses.includes(status)) {
                query.status = status;
            }
        }

        const rides = await Ride.find(query)
            .populate('driver', 'firstname lastname rating vehicle')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalRides = await Ride.countDocuments(query);
        const totalPages = Math.ceil(totalRides / limitNum);

        res.status(200).json({
            success: true,
            message: 'Rides retrieved successfully',
            rides,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRides,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error getting passenger rides:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get rides for the authenticated captain/driver
 * GET /api/rides/captain
 */
export const getCaptainRides = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), MAX_RIDES_PER_PAGE);
        const skip = (pageNum - 1) * limitNum;

        const query = { driver: req.captain.id };
        
        if (status) {
            const validStatuses = ['accepted', 'in-progress', 'completed', 'cancelled'];
            if (validStatuses.includes(status)) {
                query.status = status;
            }
        }

        const rides = await Ride.find(query)
            .populate('passenger', 'firstname lastname')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalRides = await Ride.countDocuments(query);
        const totalPages = Math.ceil(totalRides / limitNum);

        res.status(200).json({
            success: true,
            message: 'Rides retrieved successfully',
            rides,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRides,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error getting captain rides:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get nearby pending rides for captain
 * GET /api/rides/nearby
 */
export const getNearbyRides = async (req, res) => {
    try {
        const { longitude, latitude, radius = DEFAULT_SEARCH_RADIUS } = req.query;

        // Validation
        if (!longitude || !latitude) {
            return res.status(400).json({
                success: false,
                message: 'Longitude and latitude are required'
            });
        }

        const lng = parseFloat(longitude);
        const lat = parseFloat(latitude);
        const searchRadius = Math.min(parseInt(radius), 20000); // Max 20km

        if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates provided'
            });
        }

        // Check if captain has any active rides
        const activeRide = await Ride.findOne({
            driver: req.captain.id,
            status: { $in: ['accepted', 'in-progress'] }
        });

        if (activeRide) {
            return res.status(409).json({
                success: false,
                message: 'You already have an active ride. Complete it before accepting new rides.',
                activeRide: {
                    id: activeRide._id,
                    status: activeRide.status
                }
            });
        }

        const nearbyRides = await Ride.findNearbyPendingRides(lng, lat, searchRadius);

        res.status(200).json({
            success: true,
            message: 'Nearby rides retrieved successfully',
            rides: nearbyRides,
            searchParams: {
                longitude: lng,
                latitude: lat,
                radius: searchRadius
            }
        });

    } catch (error) {
        console.error('Error getting nearby rides:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Accept a ride (captain)
 * PUT /api/rides/:rideId/accept
 */
export const acceptRide = async (req, res) => {
    try {
        const { rideId } = req.params;

        // Find the ride
        const ride = await Ride.findById(rideId).populate('passenger', 'firstname lastname');
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check if ride is still pending
        if (ride.status !== 'pending') {
            return res.status(409).json({
                success: false,
                message: `Ride is already ${ride.status} and cannot be accepted`
            });
        }

        // Check if captain has any active rides
        const activeRide = await Ride.findOne({
            driver: req.captain.id,
            status: { $in: ['accepted', 'in-progress'] }
        });

        if (activeRide) {
            return res.status(409).json({
                success: false,
                message: 'You already have an active ride. Complete it before accepting new rides.'
            });
        }

        // Get captain details with vehicle info
        const captain = await CaptainModel.findById(req.captain.id);
        if (!captain) {
            return res.status(404).json({
                success: false,
                message: 'Captain not found'
            });
        }

        // Update ride with captain and vehicle details
        ride.driver = req.captain.id;
        ride.status = 'accepted';
        ride.vehicle = {
            type: captain.vehicle.type,
            make: captain.vehicle.make,
            model: captain.vehicle.model,
            numberPlate: captain.vehicle.numberPlate,
            capacity: captain.vehicle.capacity
        };

        const updatedRide = await ride.save();
        await updatedRide.populate('driver', 'firstname lastname rating vehicle');

        res.status(200).json({
            success: true,
            message: 'Ride accepted successfully',
            ride: updatedRide
        });

    } catch (error) {
        console.error('Error accepting ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Start a ride (captain)
 * PUT /api/rides/:rideId/start
 */
export const startRide = async (req, res) => {
    try {
        const { rideId } = req.params;

        // Find the ride
        const ride = await Ride.findById(rideId)
            .populate('passenger', 'firstname lastname')
            .populate('driver', 'firstname lastname');
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check if the captain is assigned to this ride
        if (ride.driver._id.toString() !== req.captain.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to start this ride'
            });
        }

        // Check if ride is accepted
        if (ride.status !== 'accepted') {
            return res.status(409).json({
                success: false,
                message: `Ride is ${ride.status} and cannot be started`
            });
        }

        // Update ride status
        ride.status = 'in-progress';
        const updatedRide = await ride.save();

        res.status(200).json({
            success: true,
            message: 'Ride started successfully',
            ride: updatedRide
        });

    } catch (error) {
        console.error('Error starting ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Complete a ride (captain)
 * PUT /api/rides/:rideId/complete
 */
export const completeRide = async (req, res) => {
    try {
        const { rideId } = req.params;

        // Find the ride
        const ride = await Ride.findById(rideId)
            .populate('passenger', 'firstname lastname')
            .populate('driver', 'firstname lastname');
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check if the captain is assigned to this ride
        if (ride.driver._id.toString() !== req.captain.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to complete this ride'
            });
        }

        // Check if ride is in progress
        if (ride.status !== 'in-progress') {
            return res.status(409).json({
                success: false,
                message: `Ride is ${ride.status} and cannot be completed`
            });
        }

        // Update ride status
        ride.status = 'completed';
        const updatedRide = await ride.save();

        res.status(200).json({
            success: true,
            message: 'Ride completed successfully',
            ride: updatedRide
        });

    } catch (error) {
        console.error('Error completing ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Cancel a ride (passenger or captain)
 * PUT /api/rides/:rideId/cancel
 */
export const cancelRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { reason } = req.body;

        // Find the ride
        const ride = await Ride.findById(rideId)
            .populate('passenger', 'firstname lastname')
            .populate('driver', 'firstname lastname');
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check authorization (passenger or assigned captain)
        const isPassenger = req.passenger && ride.passenger._id.toString() === req.passenger.id;
        const isCaptain = req.captain && ride.driver && ride.driver._id.toString() === req.captain.id;
        
        if (!isPassenger && !isCaptain) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this ride'
            });
        }

        // Check if ride can be cancelled
        if (!ride.canBeCancelled()) {
            return res.status(409).json({
                success: false,
                message: `Ride is ${ride.status} and cannot be cancelled`
            });
        }

        // Update ride status
        ride.status = 'cancelled';
        ride.cancellationReason = reason || 'No reason provided';
        const updatedRide = await ride.save();

        res.status(200).json({
            success: true,
            message: 'Ride cancelled successfully',
            ride: updatedRide
        });

    } catch (error) {
        console.error('Error cancelling ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get ride details by ID
 * GET /api/rides/:rideId
 */
export const getRideById = async (req, res) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId)
            .populate('passenger', 'firstname lastname email')
            .populate('driver', 'firstname lastname rating vehicle');
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check authorization
        const isPassenger = req.passenger && ride.passenger._id.toString() === req.passenger.id;
        const isCaptain = req.captain && ride.driver && ride.driver._id.toString() === req.captain.id;
        
        if (!isPassenger && !isCaptain) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this ride'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ride details retrieved successfully',
            ride
        });

    } catch (error) {
        console.error('Error getting ride details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Rate a ride (passenger or captain)
 * PUT /api/rides/:rideId/rate
 */
export const rateRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { rating } = req.body;

        // Validate rating
        if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }

        // Find the ride
        const ride = await Ride.findById(rideId)
            .populate('passenger', 'firstname lastname')
            .populate('driver', 'firstname lastname');
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check if ride is completed
        if (ride.status !== 'completed') {
            return res.status(409).json({
                success: false,
                message: 'Only completed rides can be rated'
            });
        }

        // Check authorization and set appropriate rating
        const isPassenger = req.passenger && ride.passenger._id.toString() === req.passenger.id;
        const isCaptain = req.captain && ride.driver && ride.driver._id.toString() === req.captain.id;
        
        if (!isPassenger && !isCaptain) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to rate this ride'
            });
        }

        if (isPassenger) {
            if (ride.passengerRating) {
                return res.status(409).json({
                    success: false,
                    message: 'You have already rated this ride'
                });
            }
            ride.passengerRating = rating;
        }

        if (isCaptain) {
            if (ride.driverRating) {
                return res.status(409).json({
                    success: false,
                    message: 'You have already rated this ride'
                });
            }
            ride.driverRating = rating;
        }

        const updatedRide = await ride.save();

        res.status(200).json({
            success: true,
            message: 'Ride rated successfully',
            ride: updatedRide
        });

    } catch (error) {
        console.error('Error rating ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get active ride for passenger
 * GET /api/rides/passenger/active
 */
export const getActivePassengerRide = async (req, res) => {
    try {
        const activeRide = await Ride.findOne({
            passenger: req.passenger.id,
            status: { $in: ['pending', 'accepted', 'in-progress'] }
        }).populate('driver', 'firstname lastname rating vehicle');

        if (!activeRide) {
            return res.status(404).json({
                success: false,
                message: 'No active ride found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Active ride retrieved successfully',
            ride: activeRide
        });

    } catch (error) {
        console.error('Error getting active passenger ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get active ride for captain
 * GET /api/rides/captain/active
 */
export const getActiveCaptainRide = async (req, res) => {
    try {
        const activeRide = await Ride.findOne({
            driver: req.captain.id,
            status: { $in: ['accepted', 'in-progress'] }
        }).populate('passenger', 'firstname lastname');

        if (!activeRide) {
            return res.status(404).json({
                success: false,
                message: 'No active ride found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Active ride retrieved successfully',
            ride: activeRide
        });

    } catch (error) {
        console.error('Error getting active captain ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};