import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import quitPlanRoutes from './routes/quitPlanRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import packagesRoutes from './routes/packages.js';
import paymentsRoutes from './routes/payments.js';
import zaloPayRoutes from './routes/zaloPayRoutes.js';
import userRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import coachRoutes from './routes/coachRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import testRoutes from './routes/testRoutes.js';
import createAppointmentsStatusRoutes from './routes/appointmentsStatusRoutes.js';
import ensureTablesExist from './ensureTables.js';

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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));

// Add specific CORS headers for preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quit-plans', quitPlanRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payments', zaloPayRoutes);
// Health routes removed - functionality now in ProgressDashboard component

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

// Special CORS handling for appointments status endpoint
app.options('/api/appointments/:id/status', (req, res) => {
    console.log('🔄 Handling OPTIONS preflight for PATCH status endpoint');
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments-update', createAppointmentsStatusRoutes());
app.use('/api', healthRoutes);
// app.use('/api/packages', packageRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/test', testRoutes);

// Đăng ký route payments với debug chi tiết
console.log('📌 Registering payment routes...');
try {
  // Express routers can be functions with properties
  if (paymentsRoutes) {
    // Đăng ký routes
    app.use('/api/payments', paymentsRoutes);
    console.log('✅ Payment routes registered successfully');
    
    // Log các routes đã đăng ký
    if (paymentsRoutes.stack && Array.isArray(paymentsRoutes.stack)) {
      console.log('Routes registered in paymentsRoutes:');
      paymentsRoutes.stack.forEach(r => {
        if (r.route) {
          const methods = Object.keys(r.route.methods).map(m => m.toUpperCase()).join(',');
          console.log(`  ${methods} ${r.route.path}`);
        }
      });
    }
  } else {
    console.error('❌ paymentsRoutes is not available');
  }
} catch (error) {
  console.error('❌ Error registering payment routes:', error);
}

// Log tất cả các routes đã đăng ký (để debug)
console.log('\n📋 Registered routes:');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    // Routes đơn giản
    console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router-level middleware
    const path = middleware.regexp.toString()
      .replace('\\/?(?=\\/|$)', '')
      .replace(/[\\^$.*+?()[\]{}|]/g, '')
      .replace('/^', '')
      .replace('\\/', '/')
      .replace('(?:/(?=$))?$/i', '');
      
    if (path.includes('/api/payments')) {
      console.log(`🔍 Router at path: ${path}`);
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          console.log(`  ${method} ${path}${handler.route.path}`);
        }
      });
    }
  }
});

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
