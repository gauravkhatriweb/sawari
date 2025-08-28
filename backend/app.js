import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/connectDB.js';
import passengerRoutes from './routes/passenger.route.js';
import captainRoutes from './routes/captain.route.js'
dotenv.config();

const app = express();

const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({ ok: true, service: 'sawaridotpk-backend' });
});

app.use('/api/passengers', passengerRoutes);
app.use('/api/captain', captainRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
