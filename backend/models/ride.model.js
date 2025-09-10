import mongoose from 'mongoose';

// Location schema for pickup and drop locations with GeoJSON support
const locationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        trim: true,
        minlength: [5, 'Address must be at least 5 characters long']
    },
    city: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'City must be at least 2 characters long']
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
                validator: function(coords) {
                    return coords.length === 2 && 
                           coords[0] >= -180 && coords[0] <= 180 && // longitude
                           coords[1] >= -90 && coords[1] <= 90;     // latitude
                },
                message: 'Coordinates must be [longitude, latitude] with valid ranges'
            }
        }
    }
}, { _id: false });

// Main ride schema
const rideSchema = new mongoose.Schema({
    // Passenger reference - required
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger',
        required: true,
        index: true
    },
    
    // Driver reference - optional until driver accepts
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain',
        default: null,
        index: true
    },
    
    // Vehicle information - embedded from captain's vehicle when assigned
    vehicle: {
        type: {
            type: String,
            enum: ['car', 'bike', 'rickshaw'],
            default: null
        },
        make: { 
            type: String,
            default: null
        },
        model: { 
            type: String,
            default: null
        },
        numberPlate: { 
            type: String,
            default: null,
            uppercase: true
        },
        capacity: { 
            type: Number,
            default: null,
            min: [1, 'Vehicle capacity must be at least 1']
        }
    },
    
    // Pickup location with GeoJSON support
    pickupLocation: {
        type: locationSchema,
        required: true
    },
    
    // Drop location with GeoJSON support
    dropLocation: {
        type: locationSchema,
        required: true
    },
    
    // Fare information
    fare: {
        type: Number,
        required: true,
        min: [0, 'Fare cannot be negative'],
        validate: {
            validator: function(value) {
                return Number.isFinite(value) && value >= 0;
            },
            message: 'Fare must be a valid positive number'
        }
    },
    
    // Distance in kilometers
    distance: {
        type: Number,
        required: true,
        min: [0.1, 'Distance must be at least 0.1 km'],
        validate: {
            validator: function(value) {
                return Number.isFinite(value) && value > 0;
            },
            message: 'Distance must be a valid positive number'
        }
    },
    
    // Duration in minutes
    duration: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least 1 minute'],
        validate: {
            validator: function(value) {
                return Number.isInteger(value) && value > 0;
            },
            message: 'Duration must be a positive integer'
        }
    },
    
    // Payment method
    paymentMethod: {
        type: String,
        enum: ['cash', 'wallet', 'card'],
        required: true
    },
    
    // Ride status with proper workflow
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    },
    
    // Ride timing information
    startedAt: {
        type: Date,
        default: null,
        validate: {
            validator: function(value) {
                if (!value) return true; // Allow null
                return value <= new Date();
            },
            message: 'Start time cannot be in the future'
        }
    },
    
    completedAt: {
        type: Date,
        default: null,
        validate: {
            validator: function(value) {
                if (!value || !this.startedAt) return true; // Allow null or if no start time
                return value >= this.startedAt;
            },
            message: 'Completion time must be after start time'
        }
    },
    
    // Cancellation information
    cancellationReason: {
        type: String,
        default: null,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
        validate: {
            validator: function(value) {
                // Only allow cancellation reason if status is cancelled
                if (value && this.status !== 'cancelled') {
                    return false;
                }
                return true;
            },
            message: 'Cancellation reason can only be set when ride is cancelled'
        }
    },
    
    // Additional ride metadata
    estimatedArrival: {
        type: String,
        default: null,
        trim: true
    },
    
    // Vehicle type preference
    vehicleType: {
        type: String,
        enum: ['bike', 'car', 'rickshaw'],
        default: 'bike'
    },
    
    // Additional notes for the ride
    notes: {
        type: String,
        default: '',
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        trim: true
    },
    
    // Rating given by passenger (1-5 stars)
    passengerRating: {
        type: Number,
        default: null,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: function(value) {
                if (value === null || value === undefined) return true;
                return Number.isInteger(value) && value >= 1 && value <= 5;
            },
            message: 'Rating must be an integer between 1 and 5'
        }
    },
    
    // Rating given by driver (1-5 stars)
    driverRating: {
        type: Number,
        default: null,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: function(value) {
                if (value === null || value === undefined) return true;
                return Number.isInteger(value) && value >= 1 && value <= 5;
            },
            message: 'Rating must be an integer between 1 and 5'
        }
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'rides' // Explicit collection name
});

// Indexes for performance optimization

// Compound index for passenger rides query
rideSchema.index({ passenger: 1, createdAt: -1 });

// Compound index for driver rides query
rideSchema.index({ driver: 1, createdAt: -1 });

// Compound index for status-based queries
rideSchema.index({ status: 1, createdAt: -1 });

// Geospatial indexes for location-based queries
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'dropLocation.coordinates': '2dsphere' });

// Compound index for active rides (pending/accepted/in-progress)
rideSchema.index({ 
    status: 1, 
    driver: 1, 
    createdAt: -1 
}, {
    partialFilterExpression: {
        status: { $in: ['pending', 'accepted', 'in-progress'] }
    }
});

// Pre-save middleware for data validation and business logic
rideSchema.pre('save', function(next) {
    // Ensure vehicle information is populated when driver is assigned
    if (this.driver && this.isModified('driver') && !this.vehicle.type) {
        return next(new Error('Vehicle information must be provided when driver is assigned'));
    }
    
    // Validate status transitions
    if (this.isModified('status')) {
        const validTransitions = {
            'pending': ['accepted', 'cancelled'],
            'accepted': ['in-progress', 'cancelled'],
            'in-progress': ['completed', 'cancelled'],
            'completed': [], // Terminal state
            'cancelled': []  // Terminal state
        };
        
        const currentStatus = this.status;
        const previousStatus = this.isNew ? null : this.$__.originalStatus;
        
        if (previousStatus && !validTransitions[previousStatus].includes(currentStatus)) {
            return next(new Error(`Invalid status transition from ${previousStatus} to ${currentStatus}`));
        }
    }
    
    // Set startedAt when status changes to in-progress
    if (this.status === 'in-progress' && !this.startedAt) {
        this.startedAt = new Date();
    }
    
    // Set completedAt when status changes to completed
    if (this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    
    // Ensure cancellation reason is provided for cancelled rides
    if (this.status === 'cancelled' && !this.cancellationReason) {
        this.cancellationReason = 'No reason provided';
    }
    
    next();
});

// Pre-save middleware to store original status for validation
rideSchema.pre('save', function(next) {
    if (!this.isNew && this.isModified('status')) {
        this.$__.originalStatus = this.$__.status;
    }
    next();
});

// Instance methods

// Calculate ride duration in minutes
rideSchema.methods.getRideDuration = function() {
    if (this.startedAt && this.completedAt) {
        return Math.round((this.completedAt - this.startedAt) / (1000 * 60));
    }
    return null;
};

// Check if ride can be cancelled
rideSchema.methods.canBeCancelled = function() {
    return ['pending', 'accepted'].includes(this.status);
};

// Check if ride is active (not completed or cancelled)
rideSchema.methods.isActive = function() {
    return ['pending', 'accepted', 'in-progress'].includes(this.status);
};

// Get ride progress percentage
rideSchema.methods.getProgressPercentage = function() {
    const statusProgress = {
        'pending': 0,
        'accepted': 25,
        'in-progress': 50,
        'completed': 100,
        'cancelled': 0
    };
    return statusProgress[this.status] || 0;
};

// Static methods

// Find rides by passenger
rideSchema.statics.findByPassenger = function(passengerId, options = {}) {
    const query = { passenger: passengerId };
    
    if (options.status) {
        query.status = options.status;
    }
    
    return this.find(query)
        .populate('driver', 'firstname lastname rating vehicle')
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);
};

// Find rides by driver
rideSchema.statics.findByDriver = function(driverId, options = {}) {
    const query = { driver: driverId };
    
    if (options.status) {
        query.status = options.status;
    }
    
    return this.find(query)
        .populate('passenger', 'firstname lastname')
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);
};

// Find active rides for a driver
rideSchema.statics.findActiveRidesByDriver = function(driverId) {
    return this.findOne({
        driver: driverId,
        status: { $in: ['accepted', 'in-progress'] }
    }).populate('passenger', 'firstname lastname');
};

// Find nearby pending rides (for driver matching)
rideSchema.statics.findNearbyPendingRides = function(longitude, latitude, maxDistance = 5000) {
    return this.find({
        status: 'pending',
        'pickupLocation.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance // meters
            }
        }
    }).populate('passenger', 'firstname lastname');
};

// Create the model
const Ride = mongoose.model('Ride', rideSchema);

export default Ride;