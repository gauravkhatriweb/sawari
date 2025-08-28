import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/connectDB.js';
import passengerRoutes from './routes/passenger.route.js';
import captainRoutes from './routes/captain.route.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS Configuration
const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://localhost:5173" // For local HTTPS testing
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200 // Support legacy browsers
}));

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Serve static files (profile pictures)
app.use('/uploads', express.static('uploads'));

// Security headers for production
if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
}

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        success: true,
        service: 'Sawari.pk Backend API',
        version: '2.0.0',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/passengers', passengerRoutes);
app.use('/api/captain', captainRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Global error handler:', {
        message: err.message,
        stack: NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    res.status(err.status || 500).json({
        success: false,
        message: NODE_ENV === 'production' ? 'Internal server error' : err.message,
        error: NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err
        } : undefined
    });
});

// 404 handler - must be last
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`
✅ Sawari.pk Backend Server Status:`);
            console.log(`   • Environment: ${NODE_ENV}`);
            console.log(`   • Port: ${PORT}`);
            console.log(`   • URL: http://localhost:${PORT}`);
            console.log(`   • Health Check: http://localhost:${PORT}/`);
            console.log(`   • Timestamp: ${new Date().toISOString()}\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
