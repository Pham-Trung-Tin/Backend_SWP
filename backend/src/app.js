import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import ensureTablesExist from './ensureTables.js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS ?
            process.env.ALLOWED_ORIGINS.split(',') :
            ['http://localhost:5173'];

        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);

        // Allow any localhost port for development
        if (origin && origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection
await testConnection();
// Ensure all required tables exist on startup
await ensureTablesExist();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'NoSmoke API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        data: null,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // CORS error
    if (error.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation',
            data: null
        });
    }

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        data: process.env.NODE_ENV === 'development' ? error.stack : null,
        timestamp: new Date().toISOString()
    });
});

export default app;
